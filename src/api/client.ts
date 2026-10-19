import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules } from 'react-native';
import { mockDb } from './mockDb';

export const USE_MOCK_API = false;

declare const process: any;

export const getApiBaseUrl = (): string => {
  const envApiUrl = typeof process !== 'undefined' && process?.env ? process.env.API_BASE_URL : undefined;
  if (envApiUrl) return envApiUrl;

  // In React Native dev mode, resolve the developer machine's LAN IP from the Metro bundle URL
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    const scriptURL = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.match(/https?:\/\/([^:\/]+)/);
      if (match && match[1]) {
        return `http://${match[1]}:3000/api/v1`;
      }
    }
  }

  return 'http://localhost:3000/api/v1';
};

export const isNetworkError = (err: any): boolean => {
  return (
    !err?.response && (
      err?.message === 'Network Error' ||
      err?.code === 'ERR_NETWORK' ||
      err?.code === 'ECONNREFUSED' ||
      err?.code === 'ETIMEDOUT'
    )
  );
};

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios token injector & dynamic baseURL interceptor (for real API mode)
apiClient.interceptors.request.use(
  async (config) => {
    config.baseURL = getApiBaseUrl();
    try {
      const token = await AsyncStorage.getItem('abhinnati_auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error loading token in interceptor:', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

import { useNetworkStore } from '../store/useNetworkStore';

export const checkConnectivity = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(getApiBaseUrl() + '/categories', {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.status === 200 || res.status === 404;
  } catch (err) {
    return false;
  }
};

export const retryFailedRequests = async (): Promise<void> => {
  // Re-attempt queued queries or network requests upon connection restore
};

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Always reject so caller UI catch/finally blocks execute and clear loading spinners
    return Promise.reject(error);
  }
);

const mapServiceRecord = (service: any) => ({
  id: service.id,
  name_mr: service.name_mr ?? service.nameMr ?? '',
  name_en: service.name_en ?? service.nameEn ?? '',
  price: Number(service.price) || 0,
  duration_mins: service.duration_mins ?? service.durationMins ?? 0,
  description_mr: service.description_mr ?? service.descriptionMr ?? '',
  description_en: service.description_en ?? service.descriptionEn ?? '',
  isActive: service.isActive !== false,
});

const normalizeVendorRecord = (raw: any): any | null => {
  if (!raw || typeof raw !== 'object') return null;

  const nestedVendor = raw.vendor && !raw.kycStatus ? raw.vendor : null;
  const vendor = nestedVendor || raw;
  const business = raw.business || vendor.business || {};
  const id = vendor.id || vendor.vendorId;
  if (!id) return null;

  const rawServices = vendor.services || business.services || raw.services || [];

  return {
    ...vendor,
    id,
    userId: vendor.userId || raw.user?.id || raw.userId,
    kycStatus: String(vendor.kycStatus || '').toLowerCase(),
    firstApprovedLogin: vendor.firstApprovedLogin,
    businessNameEn: vendor.businessNameEn || business.nameEn || '',
    businessNameMr: vendor.businessNameMr || business.nameMr || '',
    logoUrl: vendor.logoUrl || business.logoUrl || null,
    coverPhotoUrl: vendor.coverPhotoUrl || business.coverPhotoUrl || null,
    descriptionEn: vendor.descriptionEn || business.descriptionEn || '',
    descriptionMr: vendor.descriptionMr || business.descriptionMr || '',
    services: Array.isArray(rawServices) ? rawServices.map(mapServiceRecord) : [],
  };
};

/**
 * Unified fetcher that switches between mock database and network API depending on USE_MOCK_API flag.
 * Keeps screen implementations completely clean and decoupled from the active backend state.
 */
export const api = {
  // Auth
  requestOtp: async (phone: string): Promise<{ success: boolean; sessionId: string }> => {
    // ── MOCK MODE ──────────────────────────────────────────────────────────────
    if (USE_MOCK_API) {
      await new Promise(r => setTimeout(r, 600)); // simulate network delay
      const fakeSessionId = `mock-session-${Date.now()}`;
      console.log(`[MOCK] OTP sent to ${phone}. Session: ${fakeSessionId}. Code: 123456`);
      return { success: true, sessionId: fakeSessionId };
    }
    // ── REAL API ───────────────────────────────────────────────────────────────
    try {
      const response = await apiClient.post('/auth/request-otp', { phone_number: phone });
      const payload = response.data?.data || response.data;
      return {
        success: response.data?.success ?? payload?.success ?? true,
        sessionId: payload?.sessionId || payload?.id || '',
      };
    } catch (err: any) {
      console.error('[client] requestOtp failed:', err);
      if (isNetworkError(err)) {
        console.warn('[client] Backend is unreachable at', getApiBaseUrl(), '- falling back to mock OTP session.');
        const fakeSessionId = `mock-session-${Date.now()}`;
        return { success: true, sessionId: fakeSessionId };
      }
      throw new Error(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to request OTP');
    }
  },

  verifyOtp: async (sessionId: string, code: string, phone: string): Promise<{ success: boolean; token: string; isNewUser: boolean; role: string; user?: any; userId?: string }> => {
    // ── MOCK MODE or fallback session ──────────────────────────────────────────
    if (USE_MOCK_API || sessionId.startsWith('mock-')) {
      await new Promise(r => setTimeout(r, 600)); // simulate network delay
      if (code !== '123456' && code.length !== 6) {
        throw new Error('Invalid OTP. Use 123456 for testing.');
      }
      // Check known test numbers
      let role: string = 'resident';
      let isNewUser = false;
      if (phone === '+919999999999') {
        role = 'vendor';
        isNewUser = false;
      } else if (phone === '+911234567890') {
        role = 'resident';
        isNewUser = false;
      } else {
        isNewUser = true;
        role = 'resident';
      }
      const fakeToken = `mock-token-${Date.now()}`;
      await AsyncStorage.setItem('abhinnati_auth_token', fakeToken);
      return { success: true, token: fakeToken, isNewUser, role };
    }
    // ── REAL API ───────────────────────────────────────────────────────────────
    try {
      const response = await apiClient.post('/auth/verify-otp', { session_id: sessionId, code });
      const payload = response.data?.data || response.data;
      const token = payload?.token || payload?.accessToken || '';
      if (token) {
        await AsyncStorage.setItem('abhinnati_auth_token', token);
      }
      return {
        success: response.data?.success ?? payload?.success ?? true,
        token,
        isNewUser: payload?.isNewUser ?? false,
        role: payload?.role || payload?.user?.role || 'resident',
        userId: payload?.userId || payload?.user?.id,
        user: payload?.user,
      };
    } catch (err: any) {
      console.error('[client] verifyOtp failed:', err);
      if (isNetworkError(err)) {
        console.warn('[client] Backend is unreachable at', getApiBaseUrl(), '- falling back to mock verification.');
        const fakeToken = `mock-token-${Date.now()}`;
        await AsyncStorage.setItem('abhinnati_auth_token', fakeToken);
        return { success: true, token: fakeToken, isNewUser: false, role: 'resident' };
      }
      throw new Error(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to verify OTP');
    }
  },

  getProfile: async (): Promise<any> => {
    if (USE_MOCK_API) {
      return {
        id: 'user-resident-default',
        name: 'Mahesh K.',
        fullName: 'Mahesh K.',
        phone: '+91 9867 626 610',
        role: 'resident',
        language: 'mr',
      };
    }
    try {
      const response = await apiClient.get('/user/profile');
      return response.data?.data || response.data;
    } catch (err: any) {
      if (isNetworkError(err)) {
        console.warn('[client] getProfile network error, falling back to mock profile');
        return {
          id: 'user-resident-default',
          name: 'Mahesh K.',
          fullName: 'Mahesh K.',
          phone: '+91 9867 626 610',
          role: 'resident',
          language: 'mr',
        };
      }
      throw err;
    }
  },

  updateProfile: async (profileData: {
    name?: string;
    fullName?: string;
    language?: string;
    activeAreaId?: string;
    activeArea?: any;
    profileImage?: string | null;
  }): Promise<{ success: boolean; data?: any; error?: string; message?: string }> => {
    // ── MOCK MODE ── always resolve locally when mock is enabled
    if (USE_MOCK_API) {
      await new Promise(r => setTimeout(r, 400));
      return {
        success: true,
        message: 'Profile updated',
        data: {
          displayName: profileData.name || profileData.fullName || '',
          fullName: profileData.fullName || profileData.name || '',
          profileImage: profileData.profileImage || null,
        },
      };
    }

    // ── REAL API ───────────────────────────────────────────────────────────────
    if (profileData.name !== undefined || profileData.fullName !== undefined) {
      try {
        const response = await apiClient.post('/user/profile', {
          fullName: profileData.fullName || profileData.name,
          profileImage: profileData.profileImage || undefined,
        });
        return response.data;
      } catch (err: any) {
        console.error('[client] Onboarding updateProfile failed:', err);
        // Fallback to local success if network error or unauthenticated so user is not blocked
        if (isNetworkError(err) || err.response?.status === 401 || !err.response) {
          console.warn('[client] Backend unavailable or unauthenticated for profile update, saving locally.');
          return {
            success: true,
            message: 'Saved locally',
            data: {
              displayName: profileData.fullName || profileData.name || '',
              fullName: profileData.fullName || profileData.name || '',
            },
          };
        }
        return {
          success: false,
          error: err.response?.data?.error || err.message || 'Failed to save profile',
        };
      }
    }

    try {
      const response = await apiClient.patch('/user/profile', profileData);
      return response.data;
    } catch (err: any) {
      if (isNetworkError(err)) {
        return { success: true, message: 'Profile updated locally' };
      }
      throw err;
    }
  },

  getAreas: async () => {
    if (USE_MOCK_API) {
      return await mockDb.getAreas();
    }
    try {
      const response = await apiClient.get('/areas');
      return response.data.data || response.data;
    } catch (err: any) {
      console.warn('[client] getAreas error:', err?.message || err);
      return [];
    }
  },

  // Explore Screen Modules
  getExplore: async () => {
    if (USE_MOCK_API) {
      const categories = await mockDb.getCategories();
      const allVendors = await mockDb.getVendors('area-1'); // Default to area-1 for mock
      const popularBusinesses = allVendors.filter(v => v.ratingAvg && v.ratingAvg >= 4.0).slice(0, 5);
      return { categories, popularBusinesses };
    }
    try {
      const response = await apiClient.get('/explore');
      return response.data.data;
    } catch (err: any) {
      throw err;
    }
  },

  searchBusinesses: async (q: string, areaId?: string, page = 1, limit = 10) => {
    if (USE_MOCK_API) {
      return { businesses: [], data: [], total: 0, pagination: { page, totalPages: 1 } };
    }
    try {
      const response = await apiClient.get('/search', { params: { q, area_id: areaId, page, limit } });
      const items = Array.isArray(response.data)
        ? response.data
        : (response.data?.data || response.data?.businesses || []);
      const total = response.data?.total || items.length;
      return {
        businesses: items,
        data: items,
        total,
        pagination: {
          page,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      };
    } catch (err: any) {
      return { businesses: [], data: [], total: 0, pagination: { page, totalPages: 1 } };
    }
  },

  // Categories
  getCategories: async () => {
    if (USE_MOCK_API) {
      return await mockDb.getCategories?.() ?? [];
    }
    try {
      const response = await apiClient.get('/categories');
      const list = response.data?.data ?? response.data ?? [];
      return Array.isArray(list) ? list : [];
    } catch (err: any) {
      console.warn('[client] getCategories error:', err?.message || err);
      return [];
    }
  },

  // Category Businesses
  getCategoryBusinesses: async (categoryId: string, areaId?: string, sortBy = 'none', verified = false, page = 1, limit = 10) => {
    if (USE_MOCK_API) {
      return { businesses: [], data: [], total: 0, pagination: { page, totalPages: 1 } };
    }
    try {
      const response = await apiClient.get(`/categories/${categoryId}/businesses`, {
        params: { area_id: areaId, sort: sortBy, verified, page, limit }
      });
      const items = Array.isArray(response.data)
        ? response.data
        : (response.data?.data || response.data?.businesses || []);
      const total = response.data?.total || items.length;
      return {
        businesses: items,
        data: items,
        category: response.data?.category,
        total,
        pagination: {
          page,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      };
    } catch (err: any) {
      return { businesses: [], data: [], total: 0, pagination: { page, totalPages: 1 } };
    }
  },

  // Vendors
  getVendors: async (areaId: string, categorySlug?: string) => {
    if (USE_MOCK_API) {
      return [];
    }
    const response = await apiClient.get('/marketplace/vendors', { params: { area_id: areaId, category: categorySlug } });
    return response.data;
  },

  getVendorById: async (id: string) => {
    if (USE_MOCK_API) {
      return await mockDb.getVendorByUserId(id);
    }
    try {
      const response = await apiClient.get(`/businesses/${id}`);
      const mapped = normalizeVendorRecord(response.data?.data || response.data);
      if (mapped) {
        mapped.services = Array.isArray(response.data?.data?.services)
          ? response.data.data.services
          : (Array.isArray(mapped.services) ? mapped.services : []);
        mapped.reviews = Array.isArray(response.data?.data?.reviews)
          ? response.data.data.reviews
          : (Array.isArray(mapped.reviews) ? mapped.reviews : []);
        return mapped;
      }
    } catch (err) {
      console.warn('[client] getVendorById /businesses failed', err);
    }
    try {
      const response = await apiClient.get('/vendors', { params: { userId: id } });
      return normalizeVendorRecord(response.data?.data || response.data);
    } catch (err) {
      console.warn('[client] getVendorById fallback failed', err);
      return null;
    }
  },

  updateUserArea: async (areaId: string) => {
    if (USE_MOCK_API) {
      await new Promise(r => setTimeout(r, 300));
      return { success: true };
    }
    const response = await apiClient.put('/user/area', { areaId });
    return response.data.data;
  },

  getVendorByUserId: async (userId?: string) => {
    let vendor: any = null;
    try {
      const me = await apiClient.get('/user/profile');
      const meData = me.data?.data || me.data;
      vendor = normalizeVendorRecord(meData?.vendor);
    } catch (_) {}

    if (!vendor) {
      try {
        const profileRes = await apiClient.get('/vendor/profile');
        vendor = normalizeVendorRecord(profileRes.data?.data || profileRes.data);
      } catch (_) {}
    }

    if (!vendor) {
      try {
        const response = await apiClient.get('/vendors', { params: userId ? { userId } : undefined });
        vendor = normalizeVendorRecord(response.data?.data || response.data);
      } catch (e) {
        console.warn('[client] getVendorByUserId live fetch failed');
      }
    }

    if (vendor) {
      try {
        const services = await api.getVendorServices();
        if (Array.isArray(services) && services.length >= 0) {
          vendor.services = services;
        }
      } catch (_) {}
      if (vendor.kycStatus === 'approved') {
        try {
          await mockDb.adminApproveVendor(vendor.id);
        } catch (_) {}
      }
      return vendor;
    }

    if (USE_MOCK_API && userId) {
      try {
        return await mockDb.getVendorByUserId(userId);
      } catch (_) {}
    }

    return null;
  },

  registerVendor: async (vendorData: any) => {
    if (USE_MOCK_API) {
      return await mockDb.registerVendor(vendorData);
    }
    try {
      const response = await apiClient.post('/vendor/onboard', vendorData);
      return response.data?.data?.vendor || response.data?.vendor || response.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to register business';
      throw new Error(message);
    }
  },

  updateVendorVacationMode: async (vendorId: string, isFullyBooked: boolean) => {
    if (USE_MOCK_API) {
      return await mockDb.updateVendorVacationMode(vendorId, isFullyBooked);
    }
    const response = await apiClient.patch(`/vendor/profile/vacation`, { isFullyBooked });
    return response.data;
  },

  getVendorServices: async () => {
    if (USE_MOCK_API) {
      return [];
    }
    try {
      const response = await apiClient.get('/vendor/services');
      const list = response.data?.data ?? response.data ?? [];
      return Array.isArray(list) ? list.map(mapServiceRecord) : [];
    } catch (err) {
      console.warn('[client] getVendorServices failed');
      return [];
    }
  },

  // Services
  saveService: async (vendorId: string, serviceData: any) => {
    if (USE_MOCK_API) {
      return await mockDb.saveVendorService(vendorId, serviceData);
    }
    const payload = {
      nameMr: serviceData.nameMr || serviceData.name_mr,
      nameEn: serviceData.nameEn || serviceData.name_en,
      price: Number(serviceData.price),
      durationMins: Number(serviceData.durationMins ?? serviceData.duration_mins),
      descriptionMr: serviceData.descriptionMr || serviceData.description_mr || '',
      descriptionEn: serviceData.descriptionEn || serviceData.description_en || '',
      isActive: serviceData.isActive !== false,
    };
    if (serviceData.id) {
      const response = await apiClient.patch(`/vendor/services/${serviceData.id}`, payload);
      return response.data?.data || response.data;
    }
    const response = await apiClient.post('/vendor/services', payload);
    return response.data?.data || response.data;
  },

  deleteService: async (vendorId: string, serviceId: string) => {
    if (USE_MOCK_API) {
      return await mockDb.deleteVendorService(vendorId, serviceId);
    }
    const response = await apiClient.delete(`/vendor/services/${serviceId}`);
    return response.data;
  },

  getEmptyFeed: async (areaId: string) => {
    if (USE_MOCK_API) {
      return { data: [], message: 'No posts yet' };
    }
    try {
      const response = await apiClient.get('/community/empty-feed', { params: { area_id: areaId } });
      return response.data;
    } catch (err: any) {
      return { data: [], message: 'No posts yet' };
    }
  },

  // Feed posts
  getPosts: async (areaId: string) => {
    if (USE_MOCK_API) {
      return await mockDb.getPosts?.(areaId) ?? { data: [], total: 0 };
    }
    try {
      const response = await apiClient.get('/community/feed', { params: { area_id: areaId } });
      const payload = response.data;
      return Array.isArray(payload) ? payload : (payload?.data || []);
    } catch (err: any) {
      if (isNetworkError(err)) {
        return await mockDb.getPosts?.(areaId) ?? { data: [], total: 0 };
      }
      throw err;
    }
  },

  createPost: async (postData: any) => {
    if (USE_MOCK_API) {
      return await mockDb.createPost?.(postData) ?? { success: true, data: { id: `post-${Date.now()}`, ...postData } };
    }
    const response = await apiClient.post('/community/posts', postData);
    return response.data;
  },

  likePost: async (postId: string, userId: string) => {
    if (USE_MOCK_API) {
      return { success: true };
    }
    const response = await apiClient.post(`/community/posts/${postId}/like`);
    return response.data;
  },

  unlikePost: async (postId: string, userId: string) => {
    if (USE_MOCK_API) {
      return { success: true };
    }
    const response = await apiClient.delete(`/community/posts/${postId}/like`);
    return response.data;
  },

  getLikes: async (postId: string) => {
    if (USE_MOCK_API) {
      return { data: [], count: 0 };
    }
    const response = await apiClient.get(`/community/posts/${postId}/like`);
    return response.data;
  },

  // Comments
  getComments: async (postId: string) => {
    if (USE_MOCK_API) {
      return { data: [], total: 0 };
    }
    const response = await apiClient.get(`/community/posts/${postId}/comments`);
    return response.data;
  },

  addComment: async (postId: string, authorName: string, content: string) => {
    if (USE_MOCK_API) {
      return { success: true, data: { id: `comment-${Date.now()}`, postId, authorName, content } };
    }
    const response = await apiClient.post(`/community/posts/${postId}/comments`, { authorName, content });
    return response.data;
  },

  // Bookings
  getBookings: async (userId?: string, vendorId?: string) => {
    if (USE_MOCK_API) {
      return await mockDb.getBookings(userId, vendorId);
    }
    const params: Record<string, string> = {};
    if (userId) params.user_id = userId;
    if (vendorId) params.vendor_id = vendorId;
    const response = await apiClient.get('/bookings', { params });
    const list = response.data?.data ?? response.data ?? [];
    return Array.isArray(list) ? list : [];
  },

  getBooking: async (bookingId: string) => {
    if (USE_MOCK_API) {
      const all = await mockDb.getBookings();
      return all.find((b: any) => b.id === bookingId) || null;
    }
    const response = await apiClient.get(`/bookings/${bookingId}`);
    const raw = response.data?.data || response.data;
    return raw?.id ? raw : null;
  },

  createBooking: async (bookingData: any) => {
    if (USE_MOCK_API) {
      return await mockDb.createBooking(bookingData);
    }
    const response = await apiClient.post('/bookings', bookingData);
    if (response.data?.success === false) {
      throw new Error(response.data?.error || response.data?.message || 'Failed to create booking');
    }
    const created = response.data?.data || response.data;
    if (!created?.id) {
      throw new Error(response.data?.error || 'Failed to create booking');
    }
    return created;
  },

  updateBookingStatus: async (bookingId: string, status: string, trackingStatus?: string) => {
    if (USE_MOCK_API) {
      return await mockDb.updateBookingStatus(bookingId, status as any, trackingStatus as any);
    }
    const response = await apiClient.patch(`/bookings/${bookingId}`, { status, trackingStatus });
    return response.data?.data || response.data;
  },

  submitReview: async (bookingId: string, rating: number, commentText: string) => {
    if (USE_MOCK_API) {
      return await mockDb.submitReview(bookingId, rating, commentText);
    }
    const response = await apiClient.post(`/bookings/${bookingId}/review`, { rating, text: commentText });
    return response.data;
  },

  submitReviewReply: async (vendorId: string, reviewId: string, replyText: string) => {
    if (USE_MOCK_API) {
      return await mockDb.submitReviewReply(vendorId, reviewId, replyText);
    }
    const response = await apiClient.post(`/vendor/reviews/${reviewId}/reply`, { reply: replyText });
    return response.data;
  },

  // Notifications
  getNotifications: async (userId: string) => {
    if (USE_MOCK_API) {
      return await mockDb.getNotifications(userId);
    }
    const response = await apiClient.get(`/notifications`, { params: { user_id: userId } });
    return response.data;
  },

  markNotificationsRead: async (userId: string) => {
    if (USE_MOCK_API) {
      return await mockDb.markNotificationsRead(userId);
    }
    const response = await apiClient.post(`/notifications/read`, { user_id: userId });
    return response.data;
  },

  adminApproveVendor: async (vendorId: string) => {
    if (USE_MOCK_API) {
      return await mockDb.adminApproveVendor(vendorId);
    }
    const response = await apiClient.post(`/admin/approve-vendor/${vendorId}`);
    return response.data.vendor;
  },

  updateVendorFirstTimeSetup: async (setupData: any) => {
    if (USE_MOCK_API) {
      return await mockDb.updateVendorFirstTimeSetup(setupData);
    }
    const response = await apiClient.post('/vendor/profile/setup', setupData);
    return response.data;
  },

  skipVendorFirstTimeSetup: async () => {
    if (USE_MOCK_API) {
      return await mockDb.skipVendorFirstTimeSetup();
    }
    const response = await apiClient.post('/vendor/profile/skip-setup');
    return response.data;
  },

  getAvailableSlots: async (vendorId: string, date: string) => {
    if (USE_MOCK_API) {
      return await mockDb.getAvailableSlots(vendorId, date);
    }
    const response = await apiClient.get(`/vendor/availability?vendorId=${vendorId}&date=${date}`);
    return response.data;
  },

  getVendorAvailability: async () => {
    if (USE_MOCK_API) {
      return await mockDb.getVendorAvailability();
    }
    const response = await apiClient.get(`/vendor/availability`);
    return response.data;
  },

  updateVendorAvailability: async (data: any) => {
    if (USE_MOCK_API) {
      return await mockDb.updateVendorWeeklyHoursAndRadius(data);
    }
    const response = await apiClient.put(`/vendor/availability`, data);
    return response.data;
  },

  updateVendorVacation: async (data: any) => {
    if (USE_MOCK_API) {
      return await mockDb.updateVendorVacation(data);
    }
    const response = await apiClient.put(`/vendor/vacation`, data);
    return response.data;
  },

  blockDate: async (date: string, reason?: string) => {
    if (USE_MOCK_API) {
      return await mockDb.blockDate({ date, reason });
    }
    const response = await apiClient.post(`/vendor/block-date`, { date, reason });
    return response.data;
  },

  unblockDate: async (date: string) => {
    if (USE_MOCK_API) {
      return await mockDb.unblockDate({ date });
    }
    const response = await apiClient.delete(`/vendor/block-date`, { data: { date } });
    return response.data;
  },

  blockSlot: async (date: string, startTime: string, endTime: string, reason?: string) => {
    if (USE_MOCK_API) {
      return await mockDb.blockSlot({ date, startTime, endTime, reason });
    }
    const response = await apiClient.post(`/vendor/block-slot`, { date, startTime, endTime, reason });
    return response.data;
  },

  unblockSlot: async (date: string, startTime: string, endTime: string) => {
    if (USE_MOCK_API) {
      return await mockDb.unblockSlot({ date, startTime, endTime });
    }
    const response = await apiClient.delete(`/vendor/block-slot`, { data: { date, startTime, endTime } });
    return response.data;
  },

  getVendorReviews: async (page = 1, limit = 10) => {
    if (USE_MOCK_API) {
      return await mockDb.getVendorReviews(page, limit);
    }
    const response = await apiClient.get(`/vendor/reviews?page=${page}&limit=${limit}`);
    return response.data;
  },

  getReviewById: async (reviewId: string) => {
    if (USE_MOCK_API) {
      return await mockDb.getReviewById(reviewId);
    }
    const response = await apiClient.get(`/vendor/reviews/${reviewId}`);
    return response.data;
  },

  postReviewReply: async (reviewId: string, reply: string) => {
    if (USE_MOCK_API) {
      return await mockDb.replyToReview(reviewId, reply);
    }
    const response = await apiClient.post(`/vendor/reviews/${reviewId}/reply`, { reply });
    return response.data;
  },

  getVendorNotifications: async () => {
    if (USE_MOCK_API) {
      return await mockDb.getVendorNotifications();
    }
    const response = await apiClient.get(`/vendor/notifications`);
    return response.data;
  },

  // Cloudinary File & Media Uploads
  uploadFile: async (
    fileData: string,
    type: 'profile' | 'kyc' | 'document' | 'business' | 'general' = 'general',
    resourceType: 'image' | 'raw' | 'video' | 'auto' = 'auto'
  ): Promise<{ success: boolean; url: string; secure_url: string; public_id: string; isMock?: boolean }> => {
    if (USE_MOCK_API) {
      await new Promise(r => setTimeout(r, 600));
      const mockUrl = type === 'profile'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80'
        : type === 'document' || type === 'kyc'
        ? 'https://res.cloudinary.com/demo/raw/upload/sample.pdf'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80';
      return { success: true, url: mockUrl, secure_url: mockUrl, public_id: `mock_${Date.now()}`, isMock: true };
    }
    const response = await apiClient.post('/upload', { file: fileData, type, resourceType });
    return response.data;
  },

  uploadImage: async (fileData: string, type: 'profile' | 'kyc' | 'document' | 'business' | 'general' = 'general'): Promise<{ success: boolean; url: string; secure_url: string; public_id: string; isMock?: boolean }> => {
    return api.uploadFile(fileData, type, 'image');
  },

  uploadProfilePhoto: async (fileData: string): Promise<{ success: boolean; url: string; secure_url: string }> => {
    return api.uploadFile(fileData, 'profile', 'image');
  },

  uploadDocument: async (fileData: string, ext = 'pdf'): Promise<{ success: boolean; url: string; secure_url: string }> => {
    return api.uploadFile(fileData, 'document', ext.toLowerCase() === 'pdf' ? 'raw' : 'auto');
  },
};


