export type RootStackParamList = {
  // Loading / Splash
  Splash: undefined;
  
  // Auth Stack
  LanguageSelect: undefined;
  OtpVerify: { phone: string };
  NameSelect: undefined;
  LocationSelect: undefined;
  Permissions: undefined;

  // Main Tab Containers
  ResidentMain: undefined;
  VendorMain: undefined;
  EmptyFeed: undefined;

  // Global Resident screens (Accessible from anywhere)
  PostDetail: { postId: string };
  CreatePost: undefined;
  SearchResults: { categorySlug?: string; query?: string };
  BusinessProfile: { vendorId: string };
  Booking: { vendorId: string };
  PaymentGateway: undefined;
  BookingSuccess: { bookingId: string };
  BookingFailed: undefined;
  BookingDetail: { bookingId: string };
  WriteReview: { bookingId: string; initialRating?: number; businessName?: string };
  HelpSupport: undefined;
  Alerts: undefined;
  EditProfile: undefined;
  Settings: undefined;
  
  // Global Vendor screens
  KycRegistration: undefined;
  KycStatus: undefined;
  BookingAction: { bookingId: string };
  EditService: { serviceId?: string };
  VendorReviews: undefined;
  ReviewReply: { reviewId: string; userName: string; commentText: string };
  VendorFirstTimeSetup: { editMode?: boolean; initialStep?: number } | undefined;
  ManageAvailability: undefined;
  ManageBusiness: undefined;
};

export type ResidentTabParamList = {
  MyArea: undefined;
  Explore: undefined;
  BookingsList: undefined;
  Profile: undefined;
};

export type VendorTabParamList = {
  VendorDashboard: undefined;
  VendorBookings: undefined;
  ManageServices: undefined;
  VendorProfile: undefined;
};
