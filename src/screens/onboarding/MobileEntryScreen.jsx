// PASTE THIS HEADER ONCE PER SESSION
// React Native app: Abhinnati (local area + booking app)
// Stack: React Native + React Navigation native-stack
// Colors: orange #E8642A, bg #F5F0E8, dark text #3C1A00
// DO NOT modify any existing files.
// Create ONLY the file named below.

// ROUTES (user mode):
// Onboarding: LanguageSelect > MobileEntry > OTPVerify > NameEntry > Permissions > AreaSelect
// Main tabs: Home | Explore | Bookings | Profile
// Screens: BusinessProfile, SearchResults, SlotPicker, Payment, BookingConfirmed, BookingDetail, PostDetail, NewPost, WriteReview, Notifications, EditProfile, Settings, HelpSupport, SwitchArea(modal), LanguageModal

// ROUTES (vendor mode):
// Main tabs: Home | Services | Bookings | Profile
// Screens: RegisterBusiness, VerificationPending, VendorLive, VendorServices, VendorBookings, VendorProfile, VendorReviews

// CREATE: src/screens/onboarding/MobileEntryScreen.jsx

import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { theme } from '../../constants/theme';
import { horizontalScale, verticalScale, moderateScale } from '../../hooks/useScale';
import Button from '../../components/common/Button';

export const MobileEntryScreen = () => {
  const navigation = useNavigation();
  const { preferredLanguage } = useAuthStore();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const phoneInputRef = useRef(null);

  const isMr = preferredLanguage === 'mr';

  const strings = {
    title: isMr ? 'मोबाईल नंबर प्रविष्ट करा' : 'Enter your mobile number',
    subtitle: isMr
      ? 'पडताळणी करण्यासाठी आम्ही SMS द्वारे एक कोड पाठवू.'
      : "We'll send a code by SMS to verify it's you.",
    placeholder: '9876 543 210',
    caption: isMr ? 'प्रमाणित SMS दर लागू होऊ शकतात.' : 'Standard SMS rates may apply.',
    btnContinue: isMr ? 'पुढे जा' : 'Continue',
  };

  const handleContinue = () => {
    if (phoneNumber.length !== 10) return;

    // Detect state route name to avoid crashing if registered as OtpVerify or OTPVerify
    const routeNames = navigation.getState()?.routeNames || [];
    const targetRoute = routeNames.includes('OTPVerify') ? 'OTPVerify' : 'OtpVerify';

    navigation.navigate(targetRoute, { phone: phoneNumber });
  };

  const isButtonDisabled = phoneNumber.length !== 10;

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.viewport}>
          {/* Back chevron button */}
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={15}
          >
            <ChevronLeft size={24} color="#3C1A00" />
          </Pressable>

          {/* Screen Title */}
          <Text style={styles.title}>{strings.title}</Text>

          {/* Onboarding content wrapper */}
          <View style={styles.stepContainer}>
            {/* Subtitle */}
            <Text style={styles.subtitle}>{strings.subtitle}</Text>

            {/* Input Row Box Container */}
            <Pressable
              onPress={() => phoneInputRef.current?.focus()}
              style={[
                styles.inputContainer,
                isFocused && styles.inputContainerFocused,
              ]}
            >
              <Text style={styles.countryCode}>+91</Text>
              <View style={styles.separator} />
              <TextInput
                ref={phoneInputRef}
                value={phoneNumber}
                onChangeText={(val) => {
                  setPhoneNumber(val.replace(/[^0-9]/g, '').slice(0, 10));
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={strings.placeholder}
                placeholderTextColor="#A89A82"
                keyboardType="phone-pad"
                maxLength={10}
                style={styles.phoneInput}
                autoFocus
              />
            </Pressable>

            {/* SMS Rates Caption */}
            <Text style={styles.ratesNote}>{strings.caption}</Text>
          </View>

          {/* Black Continue Button */}
          <Button
            title={strings.btnContinue}
            onPress={handleContinue}
            disabled={isButtonDisabled}
            style={[
              styles.submitButton,
              isButtonDisabled && styles.submitButtonDisabled,
            ]}
            textStyle={styles.submitButtonText}
          />

          {/* 6-Dot Onboarding Indicators (Dot 2 is Active) */}
          <View style={styles.indicatorWrapper}>
            {Array.from({ length: 6 }).map((_, idx) => {
              const isActive = idx === 1; // 2nd dot is active
              return (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    isActive ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              );
            })}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8', // Beige/cream background as requested
  },
  flex: {
    flex: 1,
  },
  viewport: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#F5F0E8',
  },
  backButton: {
    position: 'absolute',
    left: horizontalScale(22),
    top: verticalScale(66),
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  title: {
    position: 'absolute',
    left: horizontalScale(52),
    top: verticalScale(54),
    height: verticalScale(37),
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: '600',
    fontSize: moderateScale(22),
    lineHeight: verticalScale(37),
    color: '#3C1A00', // Dark text as requested
    right: horizontalScale(22),
  },
  stepContainer: {
    flex: 1,
    position: 'relative',
  },
  subtitle: {
    position: 'absolute',
    left: horizontalScale(22),
    right: horizontalScale(22),
    top: verticalScale(259),
    fontFamily: theme.typography.fontFamily.regular,
    fontWeight: '400',
    fontSize: moderateScale(14),
    lineHeight: verticalScale(21),
    color: '#6B5F4E',
  },
  inputContainer: {
    position: 'absolute',
    left: horizontalScale(22),
    width: horizontalScale(349),
    height: verticalScale(54),
    top: verticalScale(288),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0CFB0',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainerFocused: {
    borderColor: '#E8642A', // Orange border focus as requested
    borderWidth: 1.5,
  },
  countryCode: {
    position: 'absolute',
    left: horizontalScale(16),
    top: verticalScale(8),
    height: verticalScale(37),
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: '600',
    fontSize: moderateScale(22),
    lineHeight: verticalScale(37),
    color: '#3C1A00',
  },
  separator: {
    position: 'absolute',
    left: horizontalScale(64),
    top: verticalScale(12),
    width: 1,
    height: verticalScale(28),
    backgroundColor: '#E0CFB0',
  },
  phoneInput: {
    position: 'absolute',
    left: horizontalScale(80),
    right: horizontalScale(16),
    top: verticalScale(8),
    height: verticalScale(37),
    fontFamily: theme.typography.fontFamily.regular,
    fontWeight: '400',
    fontSize: moderateScale(22),
    lineHeight: verticalScale(37),
    color: '#3C1A00',
    letterSpacing: 2,
    padding: 0,
  },
  ratesNote: {
    position: 'absolute',
    left: horizontalScale(22),
    top: verticalScale(348),
    height: verticalScale(20),
    fontFamily: theme.typography.fontFamily.regular,
    fontWeight: '400',
    fontSize: moderateScale(12),
    lineHeight: verticalScale(20),
    color: '#A89A82',
  },
  submitButton: {
    position: 'absolute',
    left: horizontalScale(22),
    width: horizontalScale(349),
    height: verticalScale(50),
    top: verticalScale(724),
    backgroundColor: '#000000', // Black Continue button as requested
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#000000',
    opacity: 0.4, // Disabled look using low opacity
  },
  submitButtonText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: '600',
    fontSize: moderateScale(15),
    lineHeight: verticalScale(25),
    color: '#FFFFFF',
  },
  indicatorWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: verticalScale(792),
    height: verticalScale(7),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
  activeDot: {
    width: 20,
    backgroundColor: '#E8642A', // Active orange dot as requested
  },
  inactiveDot: {
    width: 7,
    backgroundColor: '#E0CFB0',
  },
});

export default MobileEntryScreen;
