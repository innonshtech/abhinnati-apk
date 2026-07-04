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

// CREATE: src/screens/vendor/RegisterBusinessScreen.jsx

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, ChevronDown, Check, Trash2 } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { theme } from '../../constants/theme';
import { horizontalScale, verticalScale, moderateScale } from '../../hooks/useScale';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import { api } from '../../api/client';

export const RegisterBusinessScreen = () => {
  const navigation = useNavigation();
  const { user, preferredLanguage, activeArea } = useAuthStore();

  const [bizName, setBizName] = useState("Aai's Bakery");
  const [selectedCat, setSelectedCat] = useState('Bakery');
  const [selectedArea, setSelectedArea] = useState('Bandra West');

  const [uploadedPan, setUploadedPan] = useState(true);
  const [uploadedShopAct, setUploadedShopAct] = useState(false);
  const [loading, setLoading] = useState(false);

  const isMr = preferredLanguage === 'mr';

  const strings = {
    back: isMr ? 'व्यवसाय नोंदणी' : 'Register your business',
    bizNameLabel: isMr ? 'व्यवसायाचे नाव' : 'Business name',
    categoryLabel: isMr ? 'श्रेणी' : 'Category',
    areaLabel: isMr ? 'परिसर' : 'Area',
    docsLabel: isMr ? 'दस्तऐवज (KYC, शॉप ॲक्ट)' : 'Documents (KYC, Shop Act)',
    uploadShopAct: isMr ? 'शॉप ॲक्ट लायसन्स अपलोड करा' : 'Upload Shop Act licence',
    btnSubmit: isMr ? 'पुनरावलोकनासाठी सबमिट करा' : 'Submit for review',
    successMsg: isMr ? 'नोंदणी यशस्वीरित्या सबमिट केली!' : 'Registration submitted for review!',
  };

  const handleRegisterSubmit = async () => {
    setLoading(true);
    try {
      if (user && activeArea) {
        await api.registerVendor({
          userId: user.id,
          businessNameMr: isMr ? bizName : 'आयझ बेकरी',
          businessNameEn: bizName,
          categorySlug: 'food',
          categoryNameMr: 'बेकरी',
          categoryNameEn: 'Bakery',
          descriptionMr: 'ताज्या बेकरी वस्तू.',
          descriptionEn: 'Freshly baked customized cakes and bread.',
          kycDocsUrl: 'https://abhinnati.com/kyc/PAN_card.pdf',
          latitude: activeArea.latitude + 0.001,
          longitude: activeArea.longitude + 0.001,
          areaId: activeArea.id,
          services: [],
        });
      }

      const routeNames = navigation.getState()?.routeNames || [];
      const targetRoute = routeNames.includes('VerificationPending')
        ? 'VerificationPending'
        : 'KycStatus';

      navigation.navigate(targetRoute);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Navigation Header */}
      <View style={styles.navigationHeader}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={15}
        >
          <ChevronLeft size={24} color="#3C1A00" strokeWidth={2.5} />
        </Pressable>
        <Text style={styles.headerTitle}>{strings.back}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Business Name Field */}
        <InputField
          label={strings.bizNameLabel}
          placeholder=""
          value={bizName}
          onChangeText={setBizName}
          style={styles.inputStyle}
          labelStyle={styles.labelStyle}
        />

        {/* Category Dropdown Selector */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{strings.categoryLabel}</Text>
          <Pressable style={styles.dropdownTrigger}>
            <Text style={styles.dropdownText}>{selectedCat}</Text>
            <ChevronDown size={18} color="#8A7C66" />
          </Pressable>
        </View>

        {/* Area Dropdown Selector */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{strings.areaLabel}</Text>
          <Pressable style={styles.dropdownTrigger}>
            <Text style={styles.dropdownText}>{selectedArea}</Text>
            <ChevronDown size={18} color="#8A7C66" />
          </Pressable>
        </View>

        {/* Documents Section */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{strings.docsLabel}</Text>

          {/* Pre-uploaded PAN card card */}
          {uploadedPan && (
            <View style={styles.uploadedFileRow}>
              <Text style={styles.uploadedFileName}>PAN_card.pdf</Text>
              <Pressable
                onPress={() => setUploadedPan(false)}
                style={styles.removeFileBtn}
              >
                <Trash2 size={16} color="#C0392B" />
              </Pressable>
            </View>
          )}

          {/* Upload Shop Act dashed button */}
          <Pressable
            onPress={() => setUploadedShopAct(true)}
            style={[
              styles.uploadBox,
              uploadedShopAct && styles.uploadBoxUploaded,
            ]}
          >
            <Text
              style={[
                styles.uploadPlaceholderText,
                uploadedShopAct && styles.uploadPlaceholderTextUploaded,
              ]}
            >
              {uploadedShopAct
                ? 'Shop_Act_licence.pdf'
                : strings.uploadShopAct}
            </Text>
            {uploadedShopAct ? (
              <View style={styles.checkCircle}>
                <Check size={12} color="#2E7D52" strokeWidth={3} />
              </View>
            ) : null}
          </Pressable>
        </View>

        <View style={styles.spacingBottom} />
      </ScrollView>

      {/* Footer Submit button */}
      <View style={styles.footerBar}>
        <Button
          title={strings.btnSubmit}
          onPress={handleRegisterSubmit}
          loading={loading}
          style={styles.submitBtn}
          textStyle={styles.submitBtnText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8', // Beige background
  },
  navigationHeader: {
    height: verticalScale(56),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(22),
    borderBottomWidth: 1,
    borderBottomColor: '#EFE3CC',
    backgroundColor: '#F5F0E8',
    marginTop: verticalScale(20),
  },
  backButton: {
    marginRight: horizontalScale(16),
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    fontSize: moderateScale(20),
    color: '#3C1A00', // Dark text as requested
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(22),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(100),
  },
  inputStyle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: moderateScale(15),
    color: '#3C1A00',
  },
  labelStyle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    color: '#3C1A00',
  },
  fieldContainer: {
    marginVertical: verticalScale(10),
    width: '100%',
  },
  fieldLabel: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    fontFamily: theme.typography.fontFamily.bold,
    color: '#3C1A00',
    marginBottom: verticalScale(6),
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFE3CC',
    borderRadius: 12,
    height: verticalScale(50),
    paddingHorizontal: horizontalScale(16),
  },
  dropdownText: {
    fontSize: moderateScale(15),
    fontFamily: theme.typography.fontFamily.regular,
    color: '#3C1A00',
  },
  uploadedFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFE3CC',
    borderRadius: 12,
    height: verticalScale(50),
    paddingHorizontal: horizontalScale(16),
    marginBottom: verticalScale(10),
  },
  uploadedFileName: {
    fontSize: moderateScale(15),
    fontFamily: theme.typography.fontFamily.medium,
    color: '#3C1A00',
  },
  removeFileBtn: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D8C29A',
    borderRadius: 12,
    height: verticalScale(52),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    flexDirection: 'row',
    paddingHorizontal: horizontalScale(16),
  },
  uploadBoxUploaded: {
    borderStyle: 'solid',
    borderColor: '#EFE3CC',
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  uploadPlaceholderText: {
    fontSize: moderateScale(14),
    fontFamily: theme.typography.fontFamily.medium,
    color: '#8A7C66',
  },
  uploadPlaceholderTextUploaded: {
    color: '#3C1A00',
    fontFamily: theme.typography.fontFamily.medium,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E3F0E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacingBottom: {
    height: verticalScale(40),
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderTopColor: '#EFE3CC',
    paddingHorizontal: horizontalScale(22),
    paddingTop: verticalScale(14),
    paddingBottom: verticalScale(24),
  },
  submitBtn: {
    backgroundColor: '#000000', // Black Continue button
    height: verticalScale(50),
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  submitBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    fontSize: moderateScale(15),
    color: '#FFFFFF',
  },
});

export default RegisterBusinessScreen;
