import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '../store/useAuthStore';
import { initMockDatabase } from '../api/mockDb';
import { RootStackParamList } from './types';
import { View, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import { theme } from '../constants/theme';

// Import Navigators
import ResidentTabNavigator from './ResidentTabNavigator';
import VendorTabNavigator from './VendorTabNavigator';

// Import Screens
import SplashScreen from '../features/auth/SplashScreen';
import LanguageSelectScreen from '../features/auth/LanguageSelectScreen';
import OtpVerifyScreen from '../features/auth/OtpVerifyScreen';
import NameSelectScreen from '../features/onboarding/NameSelectScreen';
import LocationSelectScreen from '../features/onboarding/LocationSelectScreen';
import PermissionsScreen from '../features/onboarding/PermissionsScreen';
import EmptyFeedScreen from '../features/feed/EmptyFeedScreen';

import PostDetailScreen from '../features/feed/PostDetailScreen';
import CreatePostScreen from '../features/feed/CreatePostScreen';
import SearchResultsScreen from '../features/marketplace/SearchResultsScreen';
import BusinessProfileScreen from '../features/marketplace/BusinessProfileScreen';
import BookingScreen from '../features/bookings/BookingScreen';
import PaymentGatewayScreen from '../features/bookings/PaymentGatewayScreen';
import BookingSuccessScreen from '../features/bookings/BookingSuccessScreen';
import BookingFailedScreen from '../features/bookings/BookingFailedScreen';
import BookingDetailScreen from '../features/bookings/BookingDetailScreen';
import WriteReviewScreen from '../features/bookings/WriteReviewScreen';
import NotificationsScreen from '../features/bookings/NotificationsScreen';
import EditProfileScreen from '../features/bookings/EditProfileScreen';
import SettingsScreen from '../features/bookings/SettingsScreen';
import HelpSupportScreen from '../features/bookings/HelpSupportScreen';

import KycRegistrationScreen from '../features/vendor/KycRegistrationScreen';
import KycStatusScreen from '../features/vendor/KycStatusScreen';
import BookingRequestsScreen from '../features/vendor/BookingRequestsScreen';
import ManageServicesScreen from '../features/vendor/ManageServicesScreen';
import VendorReviewsScreen from '../features/vendor/VendorReviewsScreen';
import BookingActionScreen from '../features/vendor/BookingActionScreen';
import EditServiceScreen from '../features/vendor/EditServiceScreen';
import ReviewReplyScreen from '../features/vendor/ReviewReplyScreen';
import VendorFirstTimeSetupScreen from '../features/vendor/VendorFirstTimeSetupScreen';
import ManageAvailabilityScreen from '../features/vendor/ManageAvailabilityScreen';
import ManageBusinessScreen from '../features/vendor/ManageBusinessScreen';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const {
    isAuthenticated,
    userMode,
    activeArea,
    initializeAuth,
    isLoading: isAuthLoading,
    isNewUser,
    vendorProfile,
  } = useAuthStore();

  const [isDbLoading, setIsDbLoading] = useState(true);

  // Initialize DB and Auth Stores on startup
  useEffect(() => {
    const startup = async () => {
      await Promise.all([
        initMockDatabase(),
        initializeAuth(),
      ]);
      setIsDbLoading(false);
    };
    startup();
  }, []);

  if (isAuthLoading || isDbLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Auth Stack
        <>
          <Stack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
          <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
          <Stack.Screen name="NameSelect" component={NameSelectScreen} />
          <Stack.Screen name="LocationSelect" component={LocationSelectScreen} />
          <Stack.Screen name="Permissions" component={PermissionsScreen} />
        </>
      ) : !activeArea ? (
        // Onboarding flow: Area must be selected before loading main app
        <>
          <Stack.Screen name="NameSelect" component={NameSelectScreen} />
          <Stack.Screen name="Permissions" component={PermissionsScreen} />
          <Stack.Screen name="LocationSelect" component={LocationSelectScreen} />
        </>
      ) : (
        // Main Authenticated Stack
        <>
          {userMode === 'vendor' ? (
            vendorProfile?.firstApprovedLogin ? (
              <>
                <Stack.Screen name="VendorFirstTimeSetup" component={VendorFirstTimeSetupScreen} />
                <Stack.Screen name="VendorMain" component={VendorTabNavigator} />
              </>
            ) : (
              <>
                <Stack.Screen name="VendorMain" component={VendorTabNavigator} />
                <Stack.Screen name="VendorFirstTimeSetup" component={VendorFirstTimeSetupScreen} />
              </>
            )
          ) : isNewUser ? (
            <>
              <Stack.Screen name="EmptyFeed" component={EmptyFeedScreen} />
              <Stack.Screen name="ResidentMain" component={ResidentTabNavigator} />
            </>
          ) : (
            <>
              <Stack.Screen name="ResidentMain" component={ResidentTabNavigator} />
              <Stack.Screen name="EmptyFeed" component={EmptyFeedScreen} />
            </>
          )}

          {/* Global Resident Screens */}
          <Stack.Screen name="LocationSelect" component={LocationSelectScreen} />
          <Stack.Screen name="PostDetail" component={PostDetailScreen} />
          <Stack.Screen name="CreatePost" component={CreatePostScreen} />
          <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
          <Stack.Screen name="BusinessProfile" component={BusinessProfileScreen} />
          <Stack.Screen name="Booking" component={BookingScreen} />
          <Stack.Screen name="Alerts" component={NotificationsScreen} />
          
          {/* Booking & Transaction screens */}
          <Stack.Screen name="PaymentGateway" component={PaymentGatewayScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} />
          <Stack.Screen name="BookingFailed" component={BookingFailedScreen} />
          <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
          <Stack.Screen name="WriteReview" component={WriteReviewScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />

          {/* Global Vendor Screens */}
          <Stack.Screen name="KycRegistration" component={KycRegistrationScreen} />
          <Stack.Screen name="KycStatus" component={KycStatusScreen} />
          <Stack.Screen name="VendorReviews" component={VendorReviewsScreen} />
          <Stack.Screen name="BookingAction" component={BookingActionScreen} />
          <Stack.Screen name="EditService" component={EditServiceScreen} />
          <Stack.Screen name="ReviewReply" component={ReviewReplyScreen} />
          <Stack.Screen name="ManageAvailability" component={ManageAvailabilityScreen} />
          <Stack.Screen name="ManageBusiness" component={ManageBusinessScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
