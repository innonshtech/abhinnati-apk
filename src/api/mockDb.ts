import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  mockAreas,
  mockCategories,
  mockVendors,
  mockPosts,
  mockComments,
  mockNotifications,
  Area,
  Category,
  Vendor,
  Post,
  Comment,
  Booking,
  NotificationItem,
  Review
} from './mockData';

const KEYS = {
  AREAS: 'abhinnati_areas',
  CATEGORIES: 'abhinnati_categories',
  VENDORS: 'abhinnati_vendors',
  POSTS: 'abhinnati_posts',
  COMMENTS: 'abhinnati_comments',
  BOOKINGS: 'abhinnati_bookings',
  NOTIFICATIONS: 'abhinnati_notifications',
  REVIEWS: 'abhinnati_reviews',
};

// Helper to initialize database with mockData seeds if empty
export const initMockDatabase = async (): Promise<void> => {
  try {
    const areas = await AsyncStorage.getItem(KEYS.AREAS);
    const hasRavet = areas && areas.includes('area-ravet');
    if (areas && hasRavet) {
      return;
    }
    const bookings = await AsyncStorage.getItem(KEYS.BOOKINGS);
    const hasSeedBookings = bookings && JSON.parse(bookings).some((b: any) => b.id === 'book-rohan-aai');
    const hasCompletedBooking = bookings && JSON.parse(bookings).some((b: any) => b.id === 'AB2391e');
    
    if (!areas || !hasRavet || !hasSeedBookings || !hasCompletedBooking) {
      const seedBookings: Booking[] = [
        {
          id: 'AB2391d',
          userId: 'user-resident-default',
          userName: 'Mahesh K.',
          userPhone: '+91 9867 626 610',
          vendorId: 'vendor-aai',
          vendorName: 'Aai’s Bakery',
          serviceId: 'srv-aai-1',
          serviceName: 'Custom cake order',
          price: 600,
          bookingDate: '2026-06-25',
          bookingTime: '12:30 PM',
          status: 'accepted',
          paymentStatus: 'paid',
          paymentMethod: 'upi',
          createdAt: new Date().toISOString(),
          trackingStatus: 'ordered',
        },
        {
          id: 'AB2391e',
          userId: 'user-resident-default',
          userName: 'Mahesh K.',
          userPhone: '+91 9867 626 610',
          vendorId: 'vendor-aai',
          vendorName: 'Aai’s Bakery',
          serviceId: 'srv-aai-1',
          serviceName: 'Custom cake order',
          price: 600,
          bookingDate: '2026-06-23',
          bookingTime: '2:00 PM',
          status: 'completed',
          paymentStatus: 'paid',
          paymentMethod: 'upi',
          createdAt: new Date().toISOString(),
          trackingStatus: 'completed',
        },
        {
          id: 'book-rohan-aai',
          userId: 'user-rohan-m',
          userName: 'Rohan M.',
          userPhone: '+91 9999 888 777',
          vendorId: 'vendor-aai',
          vendorName: 'Aai’s Bakery',
          serviceId: 'srv-aai-1',
          serviceName: 'Custom cake order',
          price: 600,
          bookingDate: '2026-06-25',
          bookingTime: '12:30 PM',
          status: 'pending',
          paymentStatus: 'pending',
          paymentMethod: 'cod',
          createdAt: new Date().toISOString(),
          trackingStatus: 'ordered',
        },
        {
          id: 'book-kavita-aai',
          userId: 'user-kavita-j',
          userName: 'Kavita J.',
          userPhone: '+91 8888 777 666',
          vendorId: 'vendor-aai',
          vendorName: 'Aai’s Bakery',
          serviceId: 'srv-aai-3',
          serviceName: 'Birthday party combo',
          price: 1500,
          bookingDate: '2026-06-29',
          bookingTime: '5:00 PM',
          status: 'pending',
          paymentStatus: 'pending',
          paymentMethod: 'cod',
          createdAt: new Date().toISOString(),
          trackingStatus: 'ordered',
        },
        {
          id: 'book-raju-mahesh',
          userId: 'user-resident-default',
          userName: 'Mahesh K.',
          userPhone: '+91 9867 626 610',
          vendorId: 'vendor-raju-electricals',
          vendorName: 'Raju Electricals',
          serviceId: 'srv-raju-2',
          serviceName: 'Fan repair',
          price: 200,
          bookingDate: '2026-06-26',
          bookingTime: '10:00 AM',
          status: 'pending',
          paymentStatus: 'pending',
          paymentMethod: 'cod',
          createdAt: new Date().toISOString(),
          trackingStatus: 'ordered',
        }
      ];
      
      const seedReviews = [
        {
          id: 'rev-1',
          vendorId: 'vendor-aai',
          userId: 'user-resident-default',
          userName: 'Rahul Deshmukh',
          rating: 5,
          text: 'The absolute best bakery in Bandra! Their cake is fresh and extremely tasty.',
          reply: 'Thank you Rahul! Glad you liked the cakes.',
          createdAt: '2026-06-25T10:00:00Z',
        },
        {
          id: 'rev-2',
          vendorId: 'vendor-aai',
          userId: 'user-resident-default',
          userName: 'Sneha Patil',
          rating: 4,
          text: 'Very hygienic and prompt service. Wish they had more eggless options.',
          reply: null,
          createdAt: '2026-06-24T12:00:00Z',
        },
      ];

      await AsyncStorage.setItem(KEYS.AREAS, JSON.stringify(mockAreas));
      await AsyncStorage.setItem(KEYS.CATEGORIES, JSON.stringify(mockCategories));
      await AsyncStorage.setItem(KEYS.VENDORS, JSON.stringify(mockVendors));
      await AsyncStorage.setItem(KEYS.POSTS, JSON.stringify(mockPosts));
      await AsyncStorage.setItem(KEYS.COMMENTS, JSON.stringify(mockComments));
      await AsyncStorage.setItem(KEYS.BOOKINGS, JSON.stringify(seedBookings));
      await AsyncStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(mockNotifications));
      await AsyncStorage.setItem(KEYS.REVIEWS, JSON.stringify(seedReviews));
      console.log('Mock database seeded/updated with new Mumbai, Pune areas and initial bookings successfully.');
    } else {
      // Overwrite posts to ensure the new Loki L. posts are populated
      await AsyncStorage.setItem(KEYS.POSTS, JSON.stringify(mockPosts));
      await AsyncStorage.setItem(KEYS.VENDORS, JSON.stringify(mockVendors));
      // Ensure reviews are initialized if not present
      const currentReviews = await AsyncStorage.getItem(KEYS.REVIEWS);
      if (!currentReviews) {
        const seedReviews = [
          {
            id: 'rev-1',
            vendorId: 'vendor-aai',
            userId: 'user-resident-default',
            userName: 'Rahul Deshmukh',
            rating: 5,
            text: 'The absolute best bakery in Bandra! Their cake is fresh and extremely tasty.',
            reply: 'Thank you Rahul! Glad you liked the cakes.',
            createdAt: '2026-06-25T10:00:00Z',
          },
          {
            id: 'rev-2',
            vendorId: 'vendor-aai',
            userId: 'user-resident-default',
            userName: 'Sneha Patil',
            rating: 4,
            text: 'Very hygienic and prompt service. Wish they had more eggless options.',
            reply: null,
            createdAt: '2026-06-24T12:00:00Z',
          },
        ];
        await AsyncStorage.setItem(KEYS.REVIEWS, JSON.stringify(seedReviews));
      }
    }
  } catch (error) {
    console.error('Failed to initialize mock database:', error);
  }
};

// Generic AsyncStorage getters & setters
const getData = async <T>(key: string, defaultValue: T): Promise<T> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setData = async <T>(key: string, data: T): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving data to ${key}:`, error);
  }
};

// API MOCK WRAPPERS
export const mockDb = {
  // Area endpoints
  getAreas: async (): Promise<Area[]> => {
    return await getData<Area[]>(KEYS.AREAS, mockAreas);
  },

  // Category endpoints
  getCategories: async (): Promise<Category[]> => {
    return await getData<Category[]>(KEYS.CATEGORIES, mockCategories);
  },

  // Vendor endpoints
  getVendors: async (areaId: string, categorySlug?: string): Promise<Vendor[]> => {
    const all = await getData<Vendor[]>(KEYS.VENDORS, mockVendors);
    let filtered = all.filter(v => v.areaId === areaId && (v.kycStatus === 'approved' || categorySlug === 'plumbing'));
    if (categorySlug) {
      filtered = filtered.filter(v => v.categorySlug === categorySlug);
    }
    // Sort by createdAt descending (newest first)
    filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return filtered;
  },

  getVendorById: async (id: string): Promise<Vendor | null> => {
    const all = await getData<Vendor[]>(KEYS.VENDORS, mockVendors);
    const vendor = all.find(v => v.id === id) || null;
    if (vendor && vendor.firstApprovedLogin === undefined) {
      vendor.firstApprovedLogin = true;
    }
    return vendor;
  },

  getVendorByUserId: async (userId: string): Promise<Vendor | null> => {
    const all = await getData<Vendor[]>(KEYS.VENDORS, mockVendors);
    const vendor = all.find(v => v.userId === userId) || null;
    if (vendor && vendor.firstApprovedLogin === undefined) {
      vendor.firstApprovedLogin = true;
    }
    return vendor;
  },

  registerVendor: async (vendorData: Partial<Vendor> & { userId: string }): Promise<Vendor> => {
    const all = await getData<Vendor[]>(KEYS.VENDORS, mockVendors);
    const existingAai = all.find(v => v.id === 'vendor-aai');
    if (existingAai) {
      existingAai.userId = vendorData.userId;
      existingAai.kycStatus = 'pending';
      existingAai.businessNameEn = vendorData.businessNameEn || existingAai.businessNameEn;
      if (vendorData.businessNameMr) existingAai.businessNameMr = vendorData.businessNameMr;
      await setData(KEYS.VENDORS, all);
      return existingAai;
    }
    const newVendor: Vendor = {
      id: `vendor-${Date.now()}`,
      userId: vendorData.userId,
      createdAt: new Date().toISOString(),
      businessNameMr: vendorData.businessNameMr || 'नवीन व्यवसाय',
      businessNameEn: vendorData.businessNameEn || 'New Business',
      categorySlug: vendorData.categorySlug || 'plumbing',
      categoryNameMr: vendorData.categoryNameMr || 'इतर',
      categoryNameEn: vendorData.categoryNameEn || 'Other',
      descriptionMr: vendorData.descriptionMr || '',
      descriptionEn: vendorData.descriptionEn || '',
      latitude: vendorData.latitude || 18.5204,
      longitude: vendorData.longitude || 73.8567,
      areaId: vendorData.areaId || 'area-kothrud',
      kycStatus: 'pending',
      kycDocsUrl: vendorData.kycDocsUrl || 'https://dummy.pdf',
      isFullyBooked: false,
      ratingAvg: 0.0,
      reviewsCount: 0,
      distance: '१.५ किमी',
      services: vendorData.services || [],
      reviews: [],
    };
    all.push(newVendor);
    await setData(KEYS.VENDORS, all);
    return newVendor;
  },

  // Simulating Admin Approving Vendor KYC (Triggers the Spotlight Bridge!)
  adminApproveVendor: async (vendorId: string): Promise<Vendor | null> => {
    const allVendors = await getData<Vendor[]>(KEYS.VENDORS, mockVendors);
    const vendorIdx = allVendors.findIndex(v => v.id === vendorId);
    if (vendorIdx === -1) return null;

    // 1. Approve vendor
    allVendors[vendorIdx].kycStatus = 'approved';
    const approvedVendor = allVendors[vendorIdx];
    await setData(KEYS.VENDORS, allVendors);

    // 2. THE SPOTLIGHT BRIDGE: Auto-insert Spotlight post into Area Feed
    const allPosts = await getData<Post[]>(KEYS.POSTS, mockPosts);
    const newSpotlightPost: Post = {
      id: `post-spotlight-${Date.now()}`,
      authorId: approvedVendor.id,
      authorName: `${approvedVendor.businessNameMr} (नवीन व्यावसायिक)`,
      areaId: approvedVendor.areaId,
      tag: 'spotlight',
      title_mr: 'नवीन सेवा आपल्या भागात सुरू!',
      title_en: 'New service launched in your area!',
      content_mr: `आमच्या भागात ${approvedVendor.businessNameMr} हे आता अधिकृतरीत्या सुरू झाले आहेत! ${approvedVendor.descriptionMr}`,
      content_en: `${approvedVendor.businessNameEn} is now officially verified and verified in your area! ${approvedVendor.descriptionEn}`,
      likes: 0,
      likedBy: [],
      commentsCount: 0,
      createdAt: new Date().toISOString(),
    };
    allPosts.unshift(newSpotlightPost); // insert at top
    await setData(KEYS.POSTS, allPosts);

    // 3. Notify area residents
    const allNotifs = await getData<NotificationItem[]>(KEYS.NOTIFICATIONS, mockNotifications);
    const newNotif: NotificationItem = {
      id: `notif-spotlight-${Date.now()}`,
      userId: 'user-resident-default', // Broadcast code simulation
      title_mr: 'नवीन व्यावसायिक आपल्या भागात!',
      title_en: 'New Local Business Pinned!',
      message_mr: `${approvedVendor.businessNameMr} आता आपल्या भागात सेवा पुरवत आहेत.`,
      message_en: `${approvedVendor.businessNameEn} is now verified and available near you.`,
      type: 'spotlight',
      read: false,
      createdAt: new Date().toISOString(),
    };
    allNotifs.unshift(newNotif);
    await setData(KEYS.NOTIFICATIONS, allNotifs);

    return approvedVendor;
  },

  updateVendorVacationMode: async (vendorId: string, isFullyBooked: boolean): Promise<Vendor | null> => {
    const all = await getData<Vendor[]>(KEYS.VENDORS, mockVendors);
    const idx = all.findIndex(v => v.id === vendorId);
    if (idx === -1) return null;
    all[idx].isFullyBooked = isFullyBooked;
    await setData(KEYS.VENDORS, all);
    return all[idx];
  },

  // Service catalogs CRUD
  saveVendorService: async (vendorId: string, serviceData: any): Promise<Vendor | null> => {
    const all = await getData<Vendor[]>(KEYS.VENDORS, mockVendors);
    const idx = all.findIndex(v => v.id === vendorId);
    if (idx === -1) return null;
    
    const vendor = all[idx];
    const srvIdx = vendor.services.findIndex(s => s.id === serviceData.id);
    
    if (srvIdx > -1) {
      // Edit
      vendor.services[srvIdx] = { ...vendor.services[srvIdx], ...serviceData };
    } else {
      // Add
      vendor.services.push({
        id: `srv-${Date.now()}`,
        name_mr: serviceData.name_mr,
        name_en: serviceData.name_en,
        price: Number(serviceData.price),
        duration_mins: Number(serviceData.duration_mins),
        description_mr: serviceData.description_mr,
        description_en: serviceData.description_en,
      });
    }
    
    all[idx] = vendor;
    await setData(KEYS.VENDORS, all);
    return vendor;
  },

  deleteVendorService: async (vendorId: string, serviceId: string): Promise<Vendor | null> => {
    const all = await getData<Vendor[]>(KEYS.VENDORS, mockVendors);
    const idx = all.findIndex(v => v.id === vendorId);
    if (idx === -1) return null;
    
    all[idx].services = all[idx].services.filter(s => s.id !== serviceId);
    await setData(KEYS.VENDORS, all);
    return all[idx];
  },

  // Feed posts
  getPosts: async (areaId: string): Promise<Post[]> => {
    const all = await getData<Post[]>(KEYS.POSTS, mockPosts);
    return all.filter(p => p.areaId === areaId);
  },

  createPost: async (postData: Partial<Post>): Promise<Post> => {
    const all = await getData<Post[]>(KEYS.POSTS, mockPosts);
    const newPost: Post = {
      id: `post-${Date.now()}`,
      authorId: postData.authorId || 'resident-anon',
      authorName: postData.authorName || 'अनामिक रहिवासी',
      areaId: postData.areaId || 'area-kothrud',
      tag: postData.tag || 'community',
      title_mr: postData.title_mr || '',
      title_en: postData.title_en || '',
      content_mr: postData.content_mr || '',
      content_en: postData.content_en || '',
      likes: 0,
      likedBy: [],
      commentsCount: 0,
      createdAt: new Date().toISOString(),
    };
    all.unshift(newPost);
    await setData(KEYS.POSTS, all);
    return newPost;
  },

  likePost: async (postId: string, userId: string): Promise<any> => {
    const all = await getData<Post[]>(KEYS.POSTS, mockPosts);
    const idx = all.findIndex(p => p.id === postId);
    if (idx === -1) return null;
    
    const post = all[idx];
    const userLikeIdx = post.likedBy.indexOf(userId);
    
    if (userLikeIdx === -1) {
      post.likedBy.push(userId);
      post.likes += 1;
      all[idx] = post;
      await setData(KEYS.POSTS, all);
    }
    
    return {
      ...post,
      success: true,
      liked: true,
      likes: post.likes
    };
  },

  unlikePost: async (postId: string, userId: string): Promise<any> => {
    const all = await getData<Post[]>(KEYS.POSTS, mockPosts);
    const idx = all.findIndex(p => p.id === postId);
    if (idx === -1) return null;
    
    const post = all[idx];
    const userLikeIdx = post.likedBy.indexOf(userId);
    
    if (userLikeIdx > -1) {
      post.likedBy.splice(userLikeIdx, 1);
      post.likes = Math.max(0, post.likes - 1);
      all[idx] = post;
      await setData(KEYS.POSTS, all);
    }
    
    return {
      ...post,
      success: true,
      liked: false,
      likes: post.likes
    };
  },

  getLikes: async (postId: string): Promise<any> => {
    const all = await getData<Post[]>(KEYS.POSTS, mockPosts);
    const post = all.find(p => p.id === postId);
    if (!post) return { success: false, error: 'Post not found' };
    
    const data = post.likedBy.map(userId => ({
      userId,
      name: userId === 'current-user' ? 'You' : 'Resident ' + userId.substring(0, 4)
    }));
    return { success: true, data };
  },

  // Comment Thread
  getComments: async (postId: string): Promise<Comment[]> => {
    const all = await getData<Comment[]>(KEYS.COMMENTS, mockComments);
    return all.filter(c => c.postId === postId);
  },

  addComment: async (postId: string, authorName: string, content: string): Promise<Comment> => {
    const allComments = await getData<Comment[]>(KEYS.COMMENTS, mockComments);
    const newComment: Comment = {
      id: `com-${Date.now()}`,
      postId,
      authorName,
      content,
      createdAt: new Date().toISOString(),
    };
    allComments.push(newComment);
    await setData(KEYS.COMMENTS, allComments);

    // Increment comment count in Post
    const allPosts = await getData<Post[]>(KEYS.POSTS, mockPosts);
    const postIdx = allPosts.findIndex(p => p.id === postId);
    if (postIdx > -1) {
      allPosts[postIdx].commentsCount += 1;
      await setData(KEYS.POSTS, allPosts);
    }

    return newComment;
  },

  // Bookings / Transactions
  getBookings: async (userId?: string, vendorId?: string): Promise<Booking[]> => {
    const all = await getData<Booking[]>(KEYS.BOOKINGS, []);
    if (userId) return all.filter(b => b.userId === userId);
    if (vendorId) return all.filter(b => b.vendorId === vendorId);
    return all;
  },

  createBooking: async (bookingData: Omit<Booking, 'id' | 'status' | 'paymentStatus' | 'createdAt' | 'trackingStatus'>): Promise<Booking> => {
    const all = await getData<Booking[]>(KEYS.BOOKINGS, []);
    const createdAtDate = new Date();
    const cancelUntilDate = new Date(createdAtDate.getTime() + (5 * 60 * 1000));
    const newBooking: Booking = {
      ...bookingData,
      id: `book-${Date.now()}`,
      status: 'pending',
      paymentStatus: bookingData.paymentMethod === 'cod' ? 'pending' : 'paid',
      trackingStatus: 'ordered',
      createdAt: createdAtDate.toISOString(),
      cancelUntil: cancelUntilDate.toISOString(),
    };
    all.unshift(newBooking);
    await setData(KEYS.BOOKINGS, all);

    // Notify vendor
    const allNotifs = await getData<NotificationItem[]>(KEYS.NOTIFICATIONS, mockNotifications);
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: bookingData.vendorId, // target vendor
      title_mr: 'नवीन बुकिंग विनंती!',
      title_en: 'New Booking Received',
      message_mr: `${bookingData.userName} यांनी ${bookingData.bookingDate} रोजी ${bookingData.bookingTime} वाजताची बुकिंग विनंती पाठवली आहे.`,
      message_en: `${bookingData.userName} requested service on ${bookingData.bookingDate} at ${bookingData.bookingTime}.`,
      type: 'booking',
      read: false,
      createdAt: new Date().toISOString(),
    };
    allNotifs.unshift(newNotif);
    await setData(KEYS.NOTIFICATIONS, allNotifs);

    return newBooking;
  },

  updateBookingStatus: async (
    bookingId: string,
    status: Booking['status'],
    trackingStatus?: Booking['trackingStatus']
  ): Promise<Booking | null> => {
    const all = await getData<Booking[]>(KEYS.BOOKINGS, []);
    const idx = all.findIndex(b => b.id === bookingId);
    if (idx === -1) return null;
    
    all[idx].status = status;
    if (trackingStatus) {
      all[idx].trackingStatus = trackingStatus;
    }
    
    const booking = all[idx];
    await setData(KEYS.BOOKINGS, all);

    // Notify user
    const allNotifs = await getData<NotificationItem[]>(KEYS.NOTIFICATIONS, mockNotifications);
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: booking.userId, // target resident
      title_mr: status === 'accepted' ? 'बुकिंग स्वीकारली गेली' : status === 'declined' ? 'बुकिंग नाकारली गेली' : 'बुकिंग अपडेट',
      title_en: status === 'accepted' ? 'Booking Approved' : status === 'declined' ? 'Booking Declined' : 'Booking Update',
      message_mr: `${booking.vendorName} यांनी तुमची विनंती ${status === 'accepted' ? 'स्वीकारली' : 'नाकारली'} आहे.`,
      message_en: `${booking.vendorName} has ${status} your booking request.`,
      type: 'booking',
      read: false,
      createdAt: new Date().toISOString(),
    };
    allNotifs.unshift(newNotif);
    await setData(KEYS.NOTIFICATIONS, allNotifs);

    return booking;
  },

  // Star Review submission
  submitReview: async (bookingId: string, rating: number, commentText: string): Promise<Booking | null> => {
    const allBookings = await getData<Booking[]>(KEYS.BOOKINGS, []);
    const bookingIdx = allBookings.findIndex(b => b.id === bookingId);
    if (bookingIdx === -1) return null;

    const booking = allBookings[bookingIdx];
    
    // Add review to Vendor profile
    const allVendors = await getData<Vendor[]>(KEYS.VENDORS, mockVendors);
    const vendorIdx = allVendors.findIndex(v => v.id === booking.vendorId);
    
    if (vendorIdx > -1) {
      const vendor = allVendors[vendorIdx];
      const newReview: Review = {
        id: `rev-${Date.now()}`,
        userName: booking.userName,
        rating,
        text: commentText,
        date: new Date().toLocaleDateString('mr-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      };
      vendor.reviews.unshift(newReview);
      
      // Re-calculate average rating
      const totalRating = vendor.reviews.reduce((sum, r) => sum + r.rating, 0);
      vendor.reviewsCount = vendor.reviews.length;
      vendor.ratingAvg = Number((totalRating / vendor.reviewsCount).toFixed(1));
      
      allVendors[vendorIdx] = vendor;
      await setData(KEYS.VENDORS, allVendors);
    }

    // Notify vendor about new review
    const allNotifs = await getData<NotificationItem[]>(KEYS.NOTIFICATIONS, mockNotifications);
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: booking.vendorId, // target vendor
      title_mr: 'नवीन रिव्ह्यू आला आहे!',
      title_en: 'New Business Review',
      message_mr: `${booking.userName} यांनी तुमच्या व्यवसायाला ${rating} स्टार रेटिंग आणि अभिप्राय दिला आहे.`,
      message_en: `${booking.userName} left a ${rating}-star review on your business.`,
      type: 'booking', // booking/review type so notification click routing works
      read: false,
      createdAt: new Date().toISOString(),
    };
    allNotifs.unshift(newNotif);
    await setData(KEYS.NOTIFICATIONS, allNotifs);

    // Complete booking status
    allBookings[bookingIdx].status = 'completed';
    await setData(KEYS.BOOKINGS, allBookings);

    return allBookings[bookingIdx];
  },

  submitReviewReply: async (vendorId: string, reviewId: string, replyText: string): Promise<Vendor | null> => {
    const all = await getData<Vendor[]>(KEYS.VENDORS, mockVendors);
    const vIdx = all.findIndex(v => v.id === vendorId);
    if (vIdx === -1) return null;

    const vendor = all[vIdx];
    const revIdx = vendor.reviews.findIndex(r => r.id === reviewId);
    if (revIdx === -1) return null;

    vendor.reviews[revIdx].reply = replyText;
    all[vIdx] = vendor;
    await setData(KEYS.VENDORS, all);
    return vendor;
  },

  // Notifications
  getNotifications: async (userId: string): Promise<NotificationItem[]> => {
    const all = await getData<NotificationItem[]>(KEYS.NOTIFICATIONS, mockNotifications);
    // Simple filter allowing broadcast values (user-resident-default) or target match
    return all.filter(n => n.userId === userId || n.userId === 'user-resident-default');
  },

  markNotificationsRead: async (userId: string): Promise<void> => {
    const all = await getData<NotificationItem[]>(KEYS.NOTIFICATIONS, mockNotifications);
    const updated = all.map(n => {
      if (n.userId === userId || n.userId === 'user-resident-default') {
        return { ...n, read: true };
      }
      return n;
    });
    await setData(KEYS.NOTIFICATIONS, updated);
  },

  updateVendorFirstTimeSetup: async (setupData: any): Promise<any> => {
    const { useAuthStore } = require('../store/useAuthStore');
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Unauthorized');

    const all = await getData<Vendor[]>(KEYS.VENDORS, mockVendors);
    const vIdx = all.findIndex(v => v.userId === user.id);
    if (vIdx === -1) throw new Error('Vendor profile not found');

    const vendor = all[vIdx];
    
    if (setupData.businessNameEn !== undefined) vendor.businessNameEn = setupData.businessNameEn;
    if (setupData.businessNameMr !== undefined) vendor.businessNameMr = setupData.businessNameMr;
    if (setupData.descriptionEn !== undefined) vendor.descriptionEn = setupData.descriptionEn;
    if (setupData.descriptionMr !== undefined) vendor.descriptionMr = setupData.descriptionMr;
    if (setupData.categorySlug !== undefined) vendor.categorySlug = setupData.categorySlug;
    if (setupData.categoryNameEn !== undefined) vendor.categoryNameEn = setupData.categoryNameEn;
    if (setupData.categoryNameMr !== undefined) vendor.categoryNameMr = setupData.categoryNameMr;
    if (setupData.whatsappNumber !== undefined) vendor.whatsappNumber = setupData.whatsappNumber;
    if (setupData.email !== undefined) vendor.email = setupData.email;
    if (setupData.phone !== undefined) vendor.phone = setupData.phone;

    if (setupData.latitude !== undefined) vendor.latitude = setupData.latitude;
    if (setupData.longitude !== undefined) vendor.longitude = setupData.longitude;
    if (setupData.formattedAddress !== undefined) vendor.formattedAddress = setupData.formattedAddress;
    if (setupData.city !== undefined) vendor.city = setupData.city;
    if (setupData.state !== undefined) vendor.state = setupData.state;
    if (setupData.pincode !== undefined) vendor.pincode = setupData.pincode;
    if (setupData.placeId !== undefined) vendor.placeId = setupData.placeId;
    if (setupData.areaId !== undefined) vendor.areaId = setupData.areaId;

    if (setupData.coverPhoto && setupData.coverPhoto.fileData) {
      vendor.coverPhotoUrl = `https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=1000&q=80`;
    }

    if (setupData.logo && setupData.logo.fileData) {
      vendor.logoUrl = `https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=150&h=150&q=80`;
    }

    if (setupData.gallery) {
      const urls: string[] = [];
      setupData.gallery.forEach((item: any, i: number) => {
        if (typeof item === 'string') {
          urls.push(item);
        } else if (item.url) {
          urls.push(item.url);
        } else if (item.fileData) {
          urls.push(`https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&q=80`);
        }
      });
      vendor.galleryUrls = JSON.stringify(urls);
    }

    if (setupData.prevOrdersPhotos) {
      const urls: string[] = [];
      setupData.prevOrdersPhotos.forEach((item: any) => {
        if (typeof item === 'string') {
          urls.push(item);
        } else if (item.url) {
          urls.push(item.url);
        } else if (item.fileData) {
          urls.push(`https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&q=80`);
        }
      });
      vendor.prevOrdersPhotosUrls = JSON.stringify(urls);
    }

    if (setupData.prevOrdersVideos) {
      const urls: string[] = [];
      setupData.prevOrdersVideos.forEach((item: any) => {
        if (typeof item === 'string') {
          urls.push(item);
        } else if (item.url) {
          urls.push(item.url);
        } else if (item.fileData) {
          urls.push(`https://www.w3schools.com/html/mov_bbb.mp4`);
        }
      });
      vendor.prevOrdersVideosUrls = JSON.stringify(urls);
    }

    vendor.firstApprovedLogin = false;
    all[vIdx] = vendor;
    await setData(KEYS.VENDORS, all);
    return { success: true, data: vendor };
  },

  skipVendorFirstTimeSetup: async (): Promise<any> => {
    const { useAuthStore } = require('../store/useAuthStore');
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Unauthorized');

    const all = await getData<Vendor[]>(KEYS.VENDORS, mockVendors);
    const vIdx = all.findIndex(v => v.userId === user.id);
    if (vIdx === -1) throw new Error('Vendor profile not found');

    all[vIdx].firstApprovedLogin = false;
    await setData(KEYS.VENDORS, all);
    return { success: true, data: all[vIdx] };
  },

  getAvailableSlots: async (vendorId: string, dateStr: string): Promise<any> => {
    const all = await getData<Vendor[]>(KEYS.VENDORS, mockVendors);
    const vendor = all.find(v => v.id === vendorId || v.userId === vendorId) || null;
    if (!vendor) throw new Error('Vendor not found');

    const defaultSlots = [
      { time: '10:00', available: true },
      { time: '12:30', available: true },
      { time: '4:00', available: true },
      { time: '5:30', available: true },
      { time: '6:00', available: true },
      { time: '7:30', available: true },
    ];

    if (vendor.vacationMode && vendor.vacationStart && vendor.vacationEnd) {
      const queryDate = new Date(dateStr + 'T00:00:00');
      const start = new Date(vendor.vacationStart);
      const end = new Date(vendor.vacationEnd);
      queryDate.setHours(0,0,0,0);
      start.setHours(0,0,0,0);
      end.setHours(0,0,0,0);
      if (queryDate >= start && queryDate <= end) {
        return { success: true, data: defaultSlots.map(s => ({ ...s, available: false })) };
      }
    }

    if (vendor.blockedDates) {
      try {
        const blockedDatesList = JSON.parse(vendor.blockedDates);
        if (blockedDatesList.some((item: any) => item.date === dateStr)) {
          return { success: true, data: defaultSlots.map(s => ({ ...s, available: false })) };
        }
      } catch {}
    }

    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekday = weekdays[date.getDay()];

    let isDayClosed = false;
    let startMin = 9 * 60;
    let endMin = 18 * 60;

    if (vendor.weeklyHours) {
      try {
        const weeklyConfig = JSON.parse(vendor.weeklyHours);
        const dayConfig = weeklyConfig[weekday];
        if (dayConfig) {
          isDayClosed = !!dayConfig.closed;
          if (dayConfig.startTime) startMin = parseTimeToMinutesLocal(dayConfig.startTime);
          if (dayConfig.endTime) endMin = parseTimeToMinutesLocal(dayConfig.endTime);
        }
      } catch {}
    } else {
      if (weekday === 'Sunday') {
        isDayClosed = true;
      }
    }

    if (isDayClosed) {
      return { success: true, data: defaultSlots.map(s => ({ ...s, available: false })) };
    }

    let blockedSlotsList: any[] = [];
    if (vendor.blockedSlots) {
      try {
        blockedSlotsList = JSON.parse(vendor.blockedSlots).filter((item: any) => item.date === dateStr);
      } catch {}
    }

    const bookings = await getData<Booking[]>(KEYS.BOOKINGS, []);
    const activeBookings = bookings.filter(b => 
      b.vendorId === vendor.id && 
      b.bookingDate === dateStr &&
      ['pending', 'accepted', 'completed'].includes(b.status)
    );
    const bookedTimes = activeBookings.map(b => b.bookingTime.trim());

    const result = defaultSlots.map(slot => {
      const slotMin = parseTimeToMinutesLocal(slot.time);
      if (slotMin < startMin || slotMin > endMin) {
        return { ...slot, available: false };
      }

      const isBlockedSlot = blockedSlotsList.some(bSlot => {
        const bStart = parseTimeToMinutesLocal(bSlot.startTime);
        const bEnd = parseTimeToMinutesLocal(bSlot.endTime);
        return slotMin >= bStart && slotMin <= bEnd;
      });
      if (isBlockedSlot) {
        return { ...slot, available: false };
      }

      const isBooked = bookedTimes.some(bTime => {
        const cleanB = bTime.replace('AM', '').replace('PM', '').trim();
        return cleanB === slot.time || bTime === slot.time;
      });
      if (isBooked) {
        return { ...slot, available: false };
      }

      return slot;
    });

    return { success: true, data: result };
  },

  getVendorAvailability: async (): Promise<any> => {
    const { useAuthStore } = require('../store/useAuthStore');
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Unauthorized');

    const all = await getData<Vendor[]>(KEYS.VENDORS, mockVendors);
    const vendor = all.find(v => v.userId === user.id) || null;
    if (!vendor) throw new Error('Vendor profile not found');

    return {
      success: true,
      data: {
        weeklyHours: vendor.weeklyHours || null,
        vacationMode: !!vendor.vacationMode,
        vacationStart: vendor.vacationStart || null,
        vacationEnd: vendor.vacationEnd || null,
        vacationReason: vendor.vacationReason || null,
        blockedDates: vendor.blockedDates || null,
        blockedSlots: vendor.blockedSlots || null,
        serviceRadius: vendor.serviceRadius || '5 km',
        emergencyStatus: vendor.emergencyStatus || null,
      }
    };
  },

  updateVendorWeeklyHoursAndRadius: async (data: any): Promise<any> => {
    const { useAuthStore } = require('../store/useAuthStore');
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Unauthorized');

    const all = await getData<Vendor[]>(KEYS.VENDORS, mockVendors);
    const vIdx = all.findIndex(v => v.userId === user.id);
    if (vIdx === -1) throw new Error('Vendor profile not found');

    const vendor = all[vIdx];
    if (data.weeklyHours !== undefined) {
      vendor.weeklyHours = typeof data.weeklyHours === 'string' ? data.weeklyHours : JSON.stringify(data.weeklyHours);
    }
    if (data.serviceRadius !== undefined) {
      vendor.serviceRadius = data.serviceRadius;
    }
    if (data.emergencyStatus !== undefined) {
      vendor.emergencyStatus = data.emergencyStatus;
    }

    all[vIdx] = vendor;
    await setData(KEYS.VENDORS, all);
    return { success: true, data: vendor };
  },

  updateVendorVacation: async (data: any): Promise<any> => {
    const { useAuthStore } = require('../store/useAuthStore');
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Unauthorized');

    const all = await getData<Vendor[]>(KEYS.VENDORS, mockVendors);
    const vIdx = all.findIndex(v => v.userId === user.id);
    if (vIdx === -1) throw new Error('Vendor profile not found');

    all[vIdx].vacationMode = !!data.vacationMode;
    all[vIdx].vacationStart = data.vacationStart || null;
    all[vIdx].vacationEnd = data.vacationEnd || null;
    all[vIdx].vacationReason = data.vacationReason || null;

    await setData(KEYS.VENDORS, all);
    return { success: true, data: all[vIdx] };
  },

  blockDate: async (payload: { date: string; reason?: string }): Promise<any> => {
    const { useAuthStore } = require('../store/useAuthStore');
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Unauthorized');

    const all = await getData<Vendor[]>(KEYS.VENDORS, mockVendors);
    const vIdx = all.findIndex(v => v.userId === user.id);
    if (vIdx === -1) throw new Error('Vendor profile not found');

    const vendor = all[vIdx];
    let current = [];
    if (vendor.blockedDates) {
      try {
        current = JSON.parse(vendor.blockedDates);
      } catch {}
    }
    if (!current.some((item: any) => item.date === payload.date)) {
      current.push({ date: payload.date, reason: payload.reason });
    }
    vendor.blockedDates = JSON.stringify(current);
    all[vIdx] = vendor;
    await setData(KEYS.VENDORS, all);
    return { success: true, data: vendor };
  },

  unblockDate: async (payload: { date: string }): Promise<any> => {
    const { useAuthStore } = require('../store/useAuthStore');
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Unauthorized');

    const all = await getData<Vendor[]>(KEYS.VENDORS, mockVendors);
    const vIdx = all.findIndex(v => v.userId === user.id);
    if (vIdx === -1) throw new Error('Vendor profile not found');

    const vendor = all[vIdx];
    let current = [];
    if (vendor.blockedDates) {
      try {
        current = JSON.parse(vendor.blockedDates);
      } catch {}
    }
    current = current.filter((item: any) => item.date !== payload.date);
    vendor.blockedDates = JSON.stringify(current);
    all[vIdx] = vendor;
    await setData(KEYS.VENDORS, all);
    return { success: true, data: vendor };
  },

  blockSlot: async (payload: { date: string; startTime: string; endTime: string; reason?: string }): Promise<any> => {
    const { useAuthStore } = require('../store/useAuthStore');
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Unauthorized');

    const all = await getData<Vendor[]>(KEYS.VENDORS, mockVendors);
    const vIdx = all.findIndex(v => v.userId === user.id);
    if (vIdx === -1) throw new Error('Vendor profile not found');

    const vendor = all[vIdx];
    let current = [];
    if (vendor.blockedSlots) {
      try {
        current = JSON.parse(vendor.blockedSlots);
      } catch {}
    }
    current.push({
      date: payload.date,
      startTime: payload.startTime,
      endTime: payload.endTime,
      reason: payload.reason
    });
    vendor.blockedSlots = JSON.stringify(current);
    all[vIdx] = vendor;
    await setData(KEYS.VENDORS, all);
    return { success: true, data: vendor };
  },

  unblockSlot: async (payload: { date: string; startTime: string; endTime: string }): Promise<any> => {
    const { useAuthStore } = require('../store/useAuthStore');
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Unauthorized');

    const all = await getData<Vendor[]>(KEYS.VENDORS, mockVendors);
    const vIdx = all.findIndex(v => v.userId === user.id);
    if (vIdx === -1) throw new Error('Vendor profile not found');

    const vendor = all[vIdx];
    let current = [];
    if (vendor.blockedSlots) {
      try {
        current = JSON.parse(vendor.blockedSlots);
      } catch {}
    }
    current = current.filter((item: any) => !(item.date === payload.date && item.startTime === payload.startTime && item.endTime === payload.endTime));
    vendor.blockedSlots = JSON.stringify(current);
    all[vIdx] = vendor;
    await setData(KEYS.VENDORS, all);
    return { success: true, data: vendor };
  },

  getVendorReviews: async (page = 1, limit = 10): Promise<any> => {
    const { useAuthStore } = require('../store/useAuthStore');
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Unauthorized');

    const allVendors = await getData<Vendor[]>(KEYS.VENDORS, mockVendors);
    const vendor = allVendors.find(v => v.userId === user.id) || null;
    if (!vendor) throw new Error('Vendor profile not found');

    const allReviews = await getData<any[]>(KEYS.REVIEWS, []);
    const filtered = allReviews.filter(r => r.vendorId === vendor.id);
    
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = filtered.length;
    const repliedCount = filtered.filter(r => r.reply !== null && r.reply !== undefined && r.reply !== '').length;

    const startIdx = (page - 1) * limit;
    const paginated = filtered.slice(startIdx, startIdx + limit);

    return {
      success: true,
      reviews: paginated,
      total,
      repliedCount,
      ratingAvg: vendor.ratingAvg,
      reviewsCount: vendor.reviewsCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  },

  getReviewById: async (reviewId: string): Promise<any> => {
    const allReviews = await getData<any[]>(KEYS.REVIEWS, []);
    const review = allReviews.find(r => r.id === reviewId) || null;
    if (!review) throw new Error('Review not found');
    return { success: true, data: review };
  },

  replyToReview: async (reviewId: string, reply: string): Promise<any> => {
    const allReviews = await getData<any[]>(KEYS.REVIEWS, []);
    const idx = allReviews.findIndex(r => r.id === reviewId);
    if (idx === -1) throw new Error('Review not found');
    allReviews[idx].reply = reply;
    await setData(KEYS.REVIEWS, allReviews);
    return { success: true, data: allReviews[idx] };
  },

  getVendorNotifications: async (): Promise<any> => {
    const { useAuthStore } = require('../store/useAuthStore');
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Unauthorized');

    const all = await getData<NotificationItem[]>(KEYS.NOTIFICATIONS, mockNotifications);
    const filtered = all.filter(n => n.userId === user.id);
    return { success: true, data: filtered };
  },
};

function parseTimeToMinutesLocal(timeStr: string): number {
  const clean = timeStr.trim().toUpperCase();
  const isPm = clean.endsWith('PM');
  const isAm = clean.endsWith('AM');
  const timePart = clean.replace('AM', '').replace('PM', '').trim();
  
  const [hourStr, minStr] = timePart.split(':');
  let hour = parseInt(hourStr, 10);
  const minutes = parseInt(minStr || '0', 10);
  
  if (isPm && hour < 12) hour += 12;
  if (isAm && hour === 12) hour = 0;
  
  if (!isAm && !isPm && hour < 9) {
    hour += 12;
  }
  return hour * 60 + minutes;
}
