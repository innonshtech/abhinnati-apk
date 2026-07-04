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

// CREATE: src/screens/shared/WriteReviewScreen.jsx

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, Star, Camera, X } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { theme } from '../../constants/theme';
import { horizontalScale, verticalScale, moderateScale } from '../../hooks/useScale';
import Button from '../../components/common/Button';

export const WriteReviewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { preferredLanguage } = useAuthStore();

  const businessId = route.params?.businessId || 'vendor-raju-electricals';
  const businessName = route.params?.businessName || 'Business Name';

  const [rating, setRating] = useState(5); // default 5 stars
  const [reviewText, setReviewText] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isMr = preferredLanguage === 'mr';

  const strings = {
    title: isMr ? 'रिव्ह्यू लिहा' : 'Write Review',
    yourRating: isMr ? 'तुमचे रेटिंग' : 'Your rating',
    yourReview: isMr ? 'तुमचा अभिप्राय' : 'Your review',
    placeholder: isMr
      ? 'तुमचा अनुभव शेअर करा...'
      : 'Share your experience…',
    addPhoto: isMr ? 'फोटो जोडा' : 'Add photo',
    btnSubmit: isMr ? 'रिव्ह्यू सबमिट करा' : 'Submit review',
  };

  const handleUploadImage = async () => {
    setUploading(true);
    // Simulate image uploading latency
    await new Promise((r) => setTimeout(r, 1000));
    setImageUrl(
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&q=80'
    );
    setUploading(false);
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Simulate submission latency
      await new Promise((r) => setTimeout(r, 1000));
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
      navigation.goBack();
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
        <Text style={styles.headerTitle}>{strings.title}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Business Subtitle */}
        <Text style={styles.businessSubtitle}>{businessName}</Text>

        {/* Rating Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{strings.yourRating}</Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((num) => {
              const isSelected = num <= rating;
              return (
                <Pressable
                  key={num}
                  onPress={() => setRating(num)}
                  style={styles.starPressable}
                >
                  <Star
                    size={38}
                    color={isSelected ? '#E8642A' : '#E0CFB0'}
                    fill={isSelected ? '#E8642A' : 'transparent'}
                    strokeWidth={1.5}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Review Input Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{strings.yourReview}</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              value={reviewText}
              onChangeText={setReviewText}
              placeholder={strings.placeholder}
              placeholderTextColor="#A89A82"
              multiline
              numberOfLines={4}
              style={styles.textInput}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Add photo dashed block */}
        <View style={styles.section}>
          {imageUrl ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUrl }} style={styles.previewImage} />
              <Pressable onPress={handleRemoveImage} style={styles.removeImageBtn}>
                <X size={16} color="#FFFFFF" />
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={handleUploadImage} style={styles.uploadBlock}>
              {uploading ? (
                <ActivityIndicator size="small" color="#E8642A" />
              ) : (
                <>
                  <Camera size={20} color="#8A7C66" />
                  <Text style={styles.uploadText}>{strings.addPhoto}</Text>
                </>
              )}
            </Pressable>
          )}
        </View>

        <View style={styles.spacingBottom} />
      </ScrollView>

      {/* Footer Submit Button */}
      <View style={styles.footerBar}>
        <Button
          title={strings.btnSubmit}
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting}
          style={[styles.btn, submitting && styles.btnDisabled]}
          textStyle={styles.btnText}
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
  businessSubtitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    fontSize: moderateScale(16),
    color: '#3C1A00',
    marginBottom: verticalScale(20),
  },
  section: {
    marginBottom: verticalScale(24),
  },
  sectionLabel: {
    fontSize: moderateScale(14),
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    color: '#3C1A00',
    marginBottom: verticalScale(10),
  },
  starRow: {
    flexDirection: 'row',
    gap: horizontalScale(12),
  },
  starPressable: {
    paddingVertical: 4,
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFE3CC',
    borderRadius: 16,
    paddingHorizontal: horizontalScale(14),
    paddingVertical: verticalScale(10),
  },
  textInput: {
    fontSize: moderateScale(15),
    fontFamily: theme.typography.fontFamily.regular,
    color: '#3C1A00',
    height: verticalScale(100),
    textAlignVertical: 'top',
    padding: 0,
  },
  uploadBlock: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D8C29A',
    borderRadius: 16,
    backgroundColor: '#FAF7F2',
    height: verticalScale(60),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  uploadText: {
    fontSize: moderateScale(14),
    fontFamily: theme.typography.fontFamily.medium,
    color: '#8A7C66',
  },
  previewContainer: {
    width: horizontalScale(100),
    height: verticalScale(76),
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
  btn: {
    backgroundColor: '#000000', // Black Submit Review button
    height: verticalScale(50),
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  btnDisabled: {
    backgroundColor: '#000000',
    opacity: 0.4,
  },
  btnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    fontSize: moderateScale(15),
    color: '#FFFFFF',
  },
});

export default WriteReviewScreen;
