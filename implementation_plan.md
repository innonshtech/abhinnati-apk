# Implementation Plan - Abhinnati React Native Mobile App

This implementation plan details the steps to build **Abhinnati** ("Abhijat Unnati"), a bilingual (Marathi-first) hyperlocal platform combining a service marketplace and local community feed, built using React Native and Expo.

The goal is to deliver a complete, production-ready, pixel-perfect Android application conforming to the Figma design tokens, screen mappings, and detailed user flows defined in the design specifications. This revision adds the implementation of four missing screens to perfectly match the Figma page definitions.

---

## User Review Required

Please review the proposed architecture, file layout, and implementation steps. We require your approval before proceeding to the code generation phase.

> [!IMPORTANT]
> - **Self-Contained Persistent Mock Database**: To make the app fully functional and testable immediately without requiring a backend server, we will implement a robust mock service interceptor layer using **AsyncStorage**. The database state (bookings, vendors, posts, comments, KYC statuses, notifications) will be persisted locally. Booking a plumber, approving them in vendor mode, and checking comments on feed posts will work dynamically.
> - **Marathi-First Alignment**: All typography is bound to the **Mukta** Google Font. Text containers will use flexible wraps, paddings, and heights to handle Devanagari text expansion (which takes up to 20% more horizontal space than English) without clipping or ellipsis truncation.
> - **Responsive Design**: We will use responsive width/height scaling utilities based on screen dimensions to support a wide range of Android screens while maintaining pixel-perfect fidelity compared to the reference 393x852 layout.

---

## Open Questions

> [!NOTE]
> 1. **Expo SDK Version**: We plan to initialize the project using the latest stable Expo release (SDK 51 or 52). Please confirm if you have any constraints on the Expo SDK version.
> 2. **Mock Authentication**: The OTP verification will allow any valid 10-digit mobile number, automatically verifying it with a default passcode (e.g., `123456`), and will auto-generate a persistent session profile. Let us know if this works for your testing flow.

---

## Proposed Changes

We will initialize the React Native project directly in the user's workspace at `c:\Users\ADMIN\Desktop\Abhinnati` and implement the structured code under the `src/` folder.

```
c:\Users\ADMIN\Desktop\Abhinnati\
├── assets/                 # Brand logos, default icons, and fonts
├── src/
│   ├── api/                # Axios configuration and mock API intercepts
│   ├── assets/             # Local asset wrappers and vectors
│   ├── components/         # Atomic reusable UI components (common, buttons, forms, cards, modals)
│   ├── constants/          # Application-wide constants (theme tokens, static categories)
│   ├── features/           # Feature modules (auth, onboarding, feed, marketplace, bookings, vendor)
│   ├── hooks/              # Global custom hooks (useKeyboard, useScale, useMockDb)
│   ├── navigation/         # Navigators (Root, Auth Stack, Resident Tabs, Vendor Tabs)
│   ├── services/           # API fetch wrappers and state mutation services
│   ├── store/              # Zustand global state stores (auth, area, bookings, feed, vendor)
│   ├── theme/              # Centralized theme config (colors, spacing, typography, shadow utilities)
│   ├── types/              # Global TypeScript interfaces
│   └── utils/              # Helper utilities (date formatter, text validators)
├── App.tsx                 # Root entrypoint
├── app.json                # Expo config
└── package.json            # Dependencies manifest
```

---

### 1. Initialization and Design System
Set up project infrastructure and establish design tokens as code.

#### [NEW] [package.json](file:///c:/Users/ADMIN/Desktop/Abhinnati/package.json)
Configure all dependencies (React Navigation, TanStack Query, Zustand, Axios, Reanimated, Gesture Handler, React Hook Form, Zod).

#### [NEW] [src/constants/theme.ts](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/constants/theme.ts)
Implement precise design tokens for colours, typography scale, spacing multiplier, border radii, and soft charcoal-tinted shadows.

#### [NEW] [src/hooks/useScale.ts](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/hooks/useScale.ts)
Fidelity scaling utility to resize padding, font-sizes, and widths depending on device screen dimensions.

---

### 2. Core Reusable UI Components
Build base components using style guides matching Figma parameters.

#### [NEW] [src/components/common/Button.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/components/common/Button.tsx)
Primary Charcoal (`#2A2520`) with white text and Secondary Outline with 1px border. Includes pressing micro-animations.

#### [NEW] [src/components/common/Card.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/components/common/Card.tsx)
Standard elevation container supporting custom soft warm-tint shadows, borders, and Cream (`#FBF6EC`) backgrounds.

#### [NEW] [src/components/common/Tag.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/components/common/Tag.tsx)
Status pills (e.g. Marigold `#E58A2B` tints, Neutral sands). Handles text and icons.

#### [NEW] [src/components/common/InputField.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/components/common/InputField.tsx)
Standardized input box, label, errors, focus effects, and secure entries.

#### [NEW] [src/components/common/VerifiedBadge.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/components/common/VerifiedBadge.tsx)
Verified checkmark rosette in charcoal.

#### [NEW] [src/components/cards/SpotlightCard.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/components/cards/SpotlightCard.tsx)
Main dashboard card showing newly verified local business highlights, ratings, distance, and quick booking triggers.

---

### 3. Persistent Local Database & API Interceptor
Simulate full client-server database transactions with local storage fallback.

#### [NEW] [src/api/mockData.ts](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/api/mockData.ts)
Pre-populated seeds for operational areas, service providers, categories, community feed posts, comments, and notifications.

#### [NEW] [src/api/mockDb.ts](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/api/mockDb.ts)
Local database wrapper using AsyncStorage to simulate backend queries (CRUD for posts, status updates for bookings, KYC workflow transitions).

#### [NEW] [src/api/client.ts](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/api/client.ts)
Axios setup with mock-interceptor logic checking the `USE_MOCK_API` environment toggle.

---

### 4. Zustand State Management & Navigation Maps
Setup state stores and routing pipelines for Auth, Resident Tabs, and Vendor Mode.

#### [NEW] [src/store/useAuthStore.ts](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/store/useAuthStore.ts)
Stores token session details, current selected language (Marathi first), user profile role, active Area ID, and active profile mode (Resident vs Vendor).

#### [NEW] [src/store/useBookingStore.ts](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/store/useBookingStore.ts)
Manages booking queues, time-slot caching, and tracking states.

#### [NEW] [src/navigation/RootNavigator.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/navigation/RootNavigator.tsx)
Top-level stack handler managing routing between Onboarding Stack, Resident Tab Navigator, and Vendor Tab Navigator.

#### [NEW] [src/navigation/ResidentTabNavigator.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/navigation/ResidentTabNavigator.tsx)
Tabs: Feed (Home) | Explore | Bookings | Alerts | Profile.

#### [NEW] [src/navigation/VendorTabNavigator.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/navigation/VendorTabNavigator.tsx)
Tabs: Dashboard | Manage Bookings | Services | Profile.

---

### 5. Onboarding & Auth Flow Screens
Implement entry journey flows.

#### [NEW] [src/features/auth/LanguageSelectScreen.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/features/auth/LanguageSelectScreen.tsx)
Marathi default language chooser.

#### [NEW] [src/features/auth/OtpVerifyScreen.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/features/auth/OtpVerifyScreen.tsx)
Phone inputs with animations and mock OTP verification fields.

#### [NEW] [src/features/onboarding/LocationSelectScreen.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/features/onboarding/LocationSelectScreen.tsx)
Area pickers, listing available operational circles (GPS mock + search bar).

#### [NEW] [src/features/onboarding/PermissionsScreen.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/features/onboarding/PermissionsScreen.tsx)
Safe toggles for location access and push alerts.

---

### 6. Hyperlocal Resident App Screens
Main service directory and community forums.

#### [NEW] [src/features/feed/MyAreaFeedScreen.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/features/feed/MyAreaFeedScreen.tsx)
Infinite scroll of community posts, pinned Spotlights, empty cold-start seedling visuals, and local area selector dropdown.

#### [NEW] [src/features/feed/PostDetailScreen.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/features/feed/PostDetailScreen.tsx)
Threads page showing details, likes, comment logs, and input composer.

#### [NEW] [src/features/feed/CreatePostScreen.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/features/feed/CreatePostScreen.tsx)
Form uploader for community topics, using React Hook Form, image mock selections, and category tags.

#### [NEW] [src/features/marketplace/ExploreScreen.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/features/marketplace/ExploreScreen.tsx)
Marketplace search bar, category grid icons, and rating tags.

#### [NEW] [src/features/marketplace/SearchResultsScreen.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/features/marketplace/SearchResultsScreen.tsx)
Query result listing with selective filters.

#### [NEW] [src/features/marketplace/BusinessProfileScreen.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/features/marketplace/BusinessProfileScreen.tsx)
Business bio cards, active list of services, ratings reviews, and dynamic status checker (e.g. Fully Booked banner).

#### [NEW] [src/features/bookings/BookingScreen.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/features/bookings/BookingScreen.tsx)
Interactive calendar dates and hourly slot grids.

#### [NEW] [src/features/bookings/PaymentGatewayScreen.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/features/bookings/PaymentGatewayScreen.tsx)
Razorpay processing modal overlay.

#### [NEW] [src/features/bookings/BookingSuccessScreen.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/features/bookings/BookingSuccessScreen.tsx)
Animated success marks, receipts, and direction coordinates.

#### [NEW] [src/features/bookings/BookingFailedScreen.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/features/bookings/BookingFailedScreen.tsx)
Failed alert layouts, cash fallback selections, and retry triggers.

#### [NEW] [src/features/bookings/BookingsListScreen.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/features/bookings/BookingsListScreen.tsx)
Category tabs grouping ongoing, upcoming, and finished bookings.

#### [NEW] [src/features/bookings/BookingDetailScreen.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/features/bookings/BookingDetailScreen.tsx)
Progress maps tracing stages: En Route -> In Progress -> Completed.

#### [NEW] [src/features/bookings/WriteReviewScreen.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/features/bookings/WriteReviewScreen.tsx)
5-star feedback editor.

#### [NEW] [src/features/bookings/NotificationsScreen.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/features/bookings/NotificationsScreen.tsx)
Hyperlocal notification inbox feed.

#### [NEW] [src/features/bookings/ProfileDashboardScreen.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/features/bookings/ProfileDashboardScreen.tsx)
Bilingual language selection, personal info sheets, and Vendor Mode registers.

---

### 7. Hyperlocal Vendor Mode Screens
Catalog editors and booking management dashboards.

#### [NEW] [src/features/vendor/KycRegistrationScreen.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/features/vendor/KycRegistrationScreen.tsx)
Form for business setup: uploads, categories, name inputs, and GPS pins.

#### [NEW] [src/features/vendor/KycStatusScreen.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/features/vendor/KycStatusScreen.tsx)
State boards for "Reviewing docs" or "Approval / Rejection" cards. Approving updates vendor role immediately.

#### [NEW] [src/features/vendor/VendorDashboardScreen.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/features/vendor/VendorDashboardScreen.tsx)
Stat tracking, schedule, and pending booking count actions.

#### [NEW] [src/features/vendor/ManageServicesScreen.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/features/vendor/ManageServicesScreen.tsx)
Service catalog management (Create / Edit / Pause services).

#### [NEW] [src/features/vendor/BookingRequestsScreen.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/features/vendor/BookingRequestsScreen.tsx)
Tabs for bookings (New requests with Accept/Decline, Upcoming tracker, History).

#### [NEW] [src/features/vendor/VendorReviewsScreen.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/features/vendor/VendorReviewsScreen.tsx)
List of reviews with reply action composer.

#### [NEW] [src/features/vendor/VendorProfileScreen.tsx](file:///c:/Users/ADMIN/Desktop/Abhinnati/src/features/vendor/VendorProfileScreen.tsx)
Store config (Business hours, vacation mode toggles, and switch back to resident mode).

### 8. Missing Navigation Screens (Figma and Route Alignment)
Implement the screens defined in `types.ts` that are currently missing from the codebase.

#### [NEW] [SplashScreen.tsx](file:///d:/Abhinnati/src/features/auth/SplashScreen.tsx)
A premium branded splash screen showing the logo and localizing title ("अभिजात उन्नती") with a loading indicator during AsyncStorage / mock database initialization.

#### [NEW] [BookingActionScreen.tsx](file:///d:/Abhinnati/src/features/vendor/BookingActionScreen.tsx)
A detailed booking view for service providers. Displays all booking information (client, slot, payment, instructions) and allows the vendor to accept/decline or transition tracking status (Start Travel -> Start Work -> Complete).

#### [NEW] [EditServiceScreen.tsx](file:///d:/Abhinnati/src/features/vendor/EditServiceScreen.tsx)
A dedicated page for creating and editing service offerings (replacing the inline modal in ManageServicesScreen), allowing clean input validation for both English and Marathi fields.

#### [NEW] [ReviewReplyScreen.tsx](file:///d:/Abhinnati/src/features/vendor/ReviewReplyScreen.tsx)
A dedicated page for responding to customer reviews, showing details of the review (reviewer name, rating stars, comment text) and providing a secure text input for submitting replies.

#### [MODIFY] [RootNavigator.tsx](file:///d:/Abhinnati/src/navigation/RootNavigator.tsx)
Register all four new screens in the `Stack.Navigator`. Integrate the `Splash` screen as a conditional route during auth and database loading state.

#### [MODIFY] [ManageServicesScreen.tsx](file:///d:/Abhinnati/src/features/vendor/ManageServicesScreen.tsx)
Transition the edit/create service trigger buttons to navigate to `EditServiceScreen` instead of opening the inline modal.

#### [MODIFY] [VendorReviewsScreen.tsx](file:///d:/Abhinnati/src/features/vendor/VendorReviewsScreen.tsx)
Transition the reply button on review cards to navigate to `ReviewReplyScreen` instead of using the inline text composer.

#### [MODIFY] [BookingRequestsScreen.tsx](file:///d:/Abhinnati/src/features/vendor/BookingRequestsScreen.tsx)
Update the bookings list so that tapping on any customer booking card navigates the vendor to `BookingActionScreen` to view detailed info and perform actions.

#### [MODIFY] [VendorDashboardScreen.tsx](file:///d:/Abhinnati/src/features/vendor/VendorDashboardScreen.tsx)
Update the today's schedule list and pending approvals notification banner to navigate to `BookingActionScreen` for the specific booking instead of navigating directly to the tab container.

---

## Verification Plan

### Automated Tests
- Run TypeScript compiler checks:
  ```powershell
  npx tsc --noEmit
  ```
- Run unit and logic tests (e.g. language translation fallbacks, scale helper outputs, mock DB state integrity):
  ```powershell
  npm run test
  ```

### Manual Verification
- Launch the development server:
  ```powershell
  npm run android
  ```
- Verify exact layouts and padding scaling on different screen resolutions.
- Test localization toggles, confirming that Marathi conjunct text wraps nicely and does not clip or overflow.
- Perform end-to-end testing of booking, paying, switching to vendor mode, accepting the booking, and verifying notifications.
