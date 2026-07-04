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

// CREATE: src/screens/user/BusinessProfileScreen.jsx

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, Star, MapPin, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useBookingStore } from '../../store/useBookingStore';
import { api } from '../../api/client';
import { theme } from '../../constants/theme';
import { horizontalScale, verticalScale, moderateScale } from '../../hooks/useScale';
import VerifiedBadge from '../../components/common/VerifiedBadge';

export const BusinessProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { preferredLanguage } = useAuthStore();
  const { setBookingVendor, setBookingService } = useBookingStore();

  const businessId = route.params?.businessId || route.params?.vendorId || 'vendor-raju-electricals';

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState([]);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);

  const isMr = preferredLanguage === 'mr';

  const strings = {
    about: isMr ? 'माहिती' : 'About',
    services: isMr ? 'सेवांची यादी' : 'Services',
    photos: isMr ? 'छायाचित्रे' : 'Photos',
    reviews: isMr ? 'प्रतिक्रिया' : 'Reviews',
    location: isMr ? 'स्थान आणि वेळ' : 'Location & hours',
    readMore: isMr ? 'अधिक वाचा' : 'Read more',
    readLess: isMr ? 'कमी वाचा' : 'Read less',
    seeAll: isMr ? 'सर्व पहा' : 'See all',
    book: isMr ? 'बुक करा' : 'Book',
    add: isMr ? 'निवडा' : 'Add',
    added: isMr ? 'निवडले' : 'Added',
    openStatus: isMr ? 'रात्री ९ वाजेपर्यंत सुरू' : 'Open till 9 PM',
    address: isMr
      ? 'दुकान क्र. ४, लिंकिंग रोड, वांद्रे पश्चिम, मुंबई'
      : 'Shop 4, Linking Road, Bandra West, Mumbai',
    selectServicePrompt: isMr ? 'एक सेवा निवडा' : 'Select a service',
  };

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const data = await api.getVendorById(businessId);
        setVendor(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendor();
  }, [businessId]);

  const handleToggleService = (service) => {
    const exists = selectedServices.some((s) => s.id === service.id);
    if (exists) {
      setSelectedServices(selectedServices.filter((s) => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleBook = () => {
    if (selectedServices.length === 0) return;

    if (vendor) {
      // Compatibility with existing stores
      setBookingVendor(vendor.id, isMr ? vendor.businessNameMr : vendor.businessNameEn);
      setBookingService(selectedServices[0]);
    }

    const routeNames = navigation.getState()?.routeNames || [];
    const targetRoute = routeNames.includes('SlotPicker') ? 'SlotPicker' : 'Booking';

    const serviceNameText = selectedServices
      .map((s) => (isMr ? s.name_mr : s.name_en))
      .join(', ');

    navigation.navigate(targetRoute, {
      businessId,
      vendorId: businessId,
      serviceName: serviceNameText,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E8642A" />
      </View>
    );
  }

  if (!vendor) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>व्यावसायिक सापडला नाही</Text>
      </View>
    );
  }

  const selectedServiceNames = selectedServices
    .map((s) => (isMr ? s.name_mr : s.name_en))
    .join(', ');

  const reviewsList = vendor.reviews || [];
  const displayReview = reviewsList[0] || {
    id: 'rev-default',
    userName: isMr ? 'गोपाळ नाईक' : 'Gopal Naik',
    rating: 5,
    date: '24 Jun 2026',
    text: isMr ? 'खूप उत्कृष्ट सेवा आणि योग्य किंमत!' : 'Excellent service and fair pricing!',
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Section (200px) */}
        <View style={styles.bannerContainer}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={15}
          >
            <ChevronLeft size={24} color="#3C1A00" strokeWidth={2.5} />
          </Pressable>

          {/* Top-Right '✦ New' Badge */}
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>✦ New</Text>
          </View>
        </View>

        {/* Business Title Info Block */}
        <View style={styles.infoBlock}>
          <View style={styles.nameRow}>
            <Text style={styles.businessName}>
              {isMr ? vendor.businessNameMr : vendor.businessNameEn}
            </Text>
            <VerifiedBadge size={18} style={styles.verifiedBadge} />
          </View>

          <Text style={styles.metaText}>
            <Star size={14} color="#E8642A" fill="#E8642A" />
            {` ${vendor.ratingAvg} (${vendor.reviewsCount}) · ${
              isMr ? vendor.categoryNameMr : vendor.categoryNameEn
            } · ${vendor.distance}`}
          </Text>

          <Text style={styles.openStatusText}>{strings.openStatus}</Text>
        </View>

        {/* About Section (expandable) */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{strings.about}</Text>
          <Text
            numberOfLines={isAboutExpanded ? undefined : 3}
            style={styles.aboutText}
          >
            {isMr ? vendor.descriptionMr : vendor.descriptionEn}
          </Text>
          <Pressable onPress={() => setIsAboutExpanded(!isAboutExpanded)}>
            <Text style={styles.readMoreBtn}>
              {isAboutExpanded ? strings.readLess : strings.readMore}
            </Text>
          </Pressable>
        </View>

        {/* Services List Grid Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{strings.services}</Text>
          <View style={styles.servicesGrid}>
            {vendor.services.map((service) => {
              const isAdded = selectedServices.some((s) => s.id === service.id);
              const priceLabel = isMr
                ? `₹${service.price} · ${service.duration_mins} मि`
                : `₹${service.price} · ${service.duration_mins} mins`;

              return (
                <View key={service.id} style={styles.serviceCard}>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceNameText}>
                      {isMr ? service.name_mr : service.name_en}
                    </Text>
                    <Text style={styles.servicePrice}>{priceLabel}</Text>
                  </View>

                  <Pressable
                    onPress={() => handleToggleService(service)}
                    style={[
                      styles.addBtn,
                      isAdded ? styles.addBtnAdded : styles.addBtnUnadded,
                    ]}
                  >
                    <Text
                      style={[
                        styles.addBtnText,
                        isAdded ? styles.addBtnTextAdded : styles.addBtnTextUnadded,
                      ]}
                    >
                      {isAdded ? strings.added : strings.add}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>

        {/* Photos Section (horizontal ScrollView) */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{strings.photos}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photosScroll}
          >
            <View style={[styles.photoCard, { backgroundColor: '#FBE7CC' }]} />
            <View style={[styles.photoCard, { backgroundColor: '#E8EFE9' }]} />
            <View style={[styles.photoCard, { backgroundColor: '#E0CFB0' }]} />
            <View style={[styles.photoCard, { backgroundColor: '#F6D2C4' }]} />
          </ScrollView>
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          <View style={styles.reviewsHeaderRow}>
            <Text style={styles.sectionHeader}>{strings.reviews}</Text>
            <Pressable>
              <Text style={styles.seeAllText}>{strings.seeAll}</Text>
            </Pressable>
          </View>

          <View style={styles.reviewsMetaRow}>
            <Text style={styles.bigRatingText}>{vendor.ratingAvg}</Text>
            <View style={styles.starsRow}>
              {Array.from({ length: 5 }).map((_, i) => {
                const filled = i < Math.floor(vendor.ratingAvg);
                return (
                  <Star
                    key={i}
                    size={16}
                    color="#E8642A"
                    fill={filled ? '#E8642A' : 'transparent'}
                  />
                );
              })}
            </View>
          </View>

          {/* One Review Card */}
          <View style={styles.reviewCard}>
            <View style={styles.reviewerHeader}>
              <Text style={styles.reviewerName}>{displayReview.userName}</Text>
              <Text style={styles.reviewDate}>{displayReview.date}</Text>
            </View>
            <View style={styles.reviewerStars}>
              {Array.from({ length: displayReview.rating }).map((_, i) => (
                <Star key={i} size={12} color="#E8642A" fill="#E8642A" />
              ))}
            </View>
            <Text style={styles.reviewBody}>{displayReview.text}</Text>
          </View>
        </View>

        {/* Location & Hours Map Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{strings.location}</Text>
          <View style={styles.mapCard}>
            {/* Map Image Mockup */}
            <View style={styles.mapImagePlaceholder}>
              <View style={styles.mapPinContainer}>
                <MapPin size={28} color="#E8642A" />
              </View>
            </View>
            <View style={styles.addressBlock}>
              <MapPin size={16} color="#6B5F4E" />
              <Text style={styles.addressText} numberOfLines={2}>
                {strings.address}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.spacingBottom} />
      </ScrollView>

      {/* Fixed bottom bar */}
      <View style={styles.bottomBookBar}>
        <Text style={styles.selectedServiceLabel} numberOfLines={1}>
          {selectedServiceNames || strings.selectServicePrompt}
        </Text>
        <Pressable
          onPress={handleBook}
          disabled={selectedServices.length === 0}
          style={[
            styles.bookButton,
            selectedServices.length === 0 && styles.bookButtonDisabled,
          ]}
        >
          <Text style={styles.bookButtonText}>{strings.book}</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8', // Beige background
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F0E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#F5F0E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: moderateScale(16),
    fontFamily: theme.typography.fontFamily.semiBold,
    color: '#3C1A00',
  },
  scrollContent: {
    paddingBottom: verticalScale(120),
  },
  bannerContainer: {
    width: '100%',
    height: 200, // 200px Banner Image
    backgroundColor: '#F6E2C4',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: horizontalScale(22),
    top: verticalScale(54),
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  newBadge: {
    position: 'absolute',
    right: horizontalScale(22),
    top: verticalScale(54),
    backgroundColor: '#3C1A00',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    zIndex: 10,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    fontSize: moderateScale(11),
  },
  infoBlock: {
    paddingHorizontal: horizontalScale(22),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(12),
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(6),
  },
  businessName: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    fontSize: moderateScale(22),
    color: '#3C1A00',
  },
  verifiedBadge: {
    marginLeft: 6,
  },
  metaText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: moderateScale(14),
    color: '#6B5F4E',
    marginBottom: verticalScale(6),
  },
  openStatusText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: '500',
    fontSize: moderateScale(14),
    color: '#2E7D52', // Green status
  },
  section: {
    paddingHorizontal: horizontalScale(22),
    marginTop: verticalScale(20),
  },
  sectionHeader: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    fontSize: moderateScale(16),
    color: '#3C1A00',
    marginBottom: verticalScale(10),
  },
  aboutText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: moderateScale(14),
    lineHeight: verticalScale(22),
    color: '#6B5F4E',
  },
  readMoreBtn: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: '600',
    fontSize: moderateScale(14),
    color: '#E8642A',
    marginTop: verticalScale(4),
  },
  servicesGrid: {
    gap: verticalScale(12),
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFE3CC',
    borderRadius: 16,
    padding: horizontalScale(16),
  },
  serviceInfo: {
    flex: 1,
    paddingRight: 8,
  },
  serviceNameText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: '600',
    fontSize: moderateScale(15),
    color: '#3C1A00',
    marginBottom: 4,
  },
  servicePrice: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: moderateScale(13),
    color: '#8A7C66',
  },
  addBtn: {
    width: horizontalScale(80),
    height: verticalScale(36),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnAdded: {
    backgroundColor: '#E8642A', // Orange added state
  },
  addBtnUnadded: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#E8642A', // Orange outline unadded state
  },
  addBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    fontSize: moderateScale(13),
  },
  addBtnTextAdded: {
    color: '#FFFFFF',
  },
  addBtnTextUnadded: {
    color: '#E8642A',
  },
  photosScroll: {
    gap: 12,
  },
  photoCard: {
    width: 120, // 120x90 photos list
    height: 90,
    borderRadius: 12,
  },
  reviewsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAllText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: '600',
    fontSize: moderateScale(14),
    color: '#E8642A',
  },
  reviewsMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  bigRatingText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    fontSize: moderateScale(30),
    color: '#3C1A00',
    marginRight: 10,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFE3CC',
    borderRadius: 14,
    padding: horizontalScale(14),
  },
  reviewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  reviewerName: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: '600',
    fontSize: moderateScale(14),
    color: '#3C1A00',
  },
  reviewDate: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: moderateScale(12),
    color: '#A89A82',
  },
  reviewerStars: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 8,
  },
  reviewBody: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: moderateScale(13),
    lineHeight: verticalScale(20),
    color: '#6B5F4E',
  },
  mapCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFE3CC',
    borderRadius: 16,
    overflow: 'hidden',
  },
  mapImagePlaceholder: {
    height: verticalScale(120),
    backgroundColor: '#EFE6D4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPinContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2A2520',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addressBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: horizontalScale(14),
    gap: 8,
  },
  addressText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: moderateScale(13),
    color: '#6B5F4E',
  },
  spacingBottom: {
    height: verticalScale(40),
  },
  bottomBookBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: verticalScale(80),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderTopColor: '#EFE3CC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(22),
    paddingBottom: verticalScale(10), // Padding to account for gesture bar
  },
  selectedServiceLabel: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: moderateScale(14),
    color: '#8A7C66', // Muted service name
    paddingRight: 12,
  },
  bookButton: {
    width: horizontalScale(120),
    height: verticalScale(48),
    backgroundColor: '#000000', // Black book button
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: '#000000',
    opacity: 0.4,
  },
  bookButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    fontSize: moderateScale(15),
    color: '#FFFFFF',
  },
});

export default BusinessProfileScreen;
