import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';

export interface LikeAction {
  id: string;
  postId: string;
  userId: string;
  action: 'like' | 'unlike';
  timestamp: number;
}

const STORAGE_KEY = '@abhinnati_like_sync_queue';

class LikeSyncService {
  private queue: LikeAction[] = [];
  private processing = false;
  private retryTimer: any = null;

  constructor() {
    this.loadQueue();
  }

  private async loadQueue() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        this.processQueue();
      }
    } catch (err) {
      console.error('[LikeSyncService] Failed to load like sync queue:', err);
    }
  }

  private async saveQueue() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch (err) {
      console.error('[LikeSyncService] Failed to save like sync queue:', err);
    }
  }

  /**
   * Queue a like or unlike operation. Optimizes and deduplicates redundant actions.
   */
  async queueLikeAction(postId: string, userId: string, action: 'like' | 'unlike') {
    // Deduplication logic:
    // If there is already a queued action for the same postId:
    // - If current queued action is 'like' and new is 'unlike': they cancel out (no-op). Remove from queue!
    // - If current queued action is 'unlike' and new is 'like': they cancel out (no-op). Remove from queue!
    // - If current queued action is same as new action: keep only one!
    const existingIndex = this.queue.findIndex(item => item.postId === postId);

    if (existingIndex > -1) {
      const existing = this.queue[existingIndex];
      if (existing.action !== action) {
        // Cancel out and remove
        this.queue.splice(existingIndex, 1);
      } else {
        // Update timestamp, keep only one
        this.queue[existingIndex].timestamp = Date.now();
      }
    } else {
      // Add new action to queue
      const newAction: LikeAction = {
        id: `${postId}_${userId}_${Date.now()}`,
        postId,
        userId,
        action,
        timestamp: Date.now(),
      };
      this.queue.push(newAction);
    }

    await this.saveQueue();
    this.processQueue();
  }

  /**
   * Process the queued actions sequentially.
   */
  async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }

    console.log(`[LikeSyncService] Processing queue of size: ${this.queue.length}`);

    while (this.queue.length > 0) {
      const item = this.queue[0];
      try {
        if (item.action === 'like') {
          await api.likePost(item.postId, item.userId);
        } else {
          await api.unlikePost(item.postId, item.userId);
        }

        // Action succeeded — remove it from the queue
        this.queue.shift();
        await this.saveQueue();
        console.log(`[LikeSyncService] Successfully synced ${item.action} for post: ${item.postId}`);
      } catch (err: any) {
        // Detect connection/network issues (e.g. TypeError: Network request failed or status 503/timeout)
        const isNetworkError = 
          !err.status || 
          err.message?.includes('Network request failed') ||
          err.message?.includes('timeout') ||
          err.message?.includes('Network Error');

        if (isNetworkError) {
          console.warn('[LikeSyncService] Network error encountered. Postponing queue processing.', err.message);
          // Schedule a retry in 10 seconds
          this.processing = false;
          this.retryTimer = setTimeout(() => this.processQueue(), 10000);
          return;
        } else {
          // If it's a client or server bug (e.g., 400 or 404), discard it to avoid blocking the queue forever
          console.error('[LikeSyncService] Non-recoverable error. Discarding action:', err);
          this.queue.shift();
          await this.saveQueue();
        }
      }
    }

    this.processing = false;
  }
}

export const likeSyncService = new LikeSyncService();
export default likeSyncService;
