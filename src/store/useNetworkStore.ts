import { create } from 'zustand';

interface NetworkState {
  isOnline: boolean;
  setOnline: (status: boolean) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isOnline: true, // Default true; NetInfo will immediately correct on mount
  setOnline: (status) => set({ isOnline: status }),
}));

export default useNetworkStore;
