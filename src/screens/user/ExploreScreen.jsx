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

// CREATE: src/screens/user/ExploreScreen.jsx

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Search,
  Bell,
  Home as HomeIcon,
  Sparkles,
  Sparkle,
  Columns,
  Plus,
  Car,
  Store,
  MoreHorizontal,
  ChevronRight,
  Star,
  ChevronDown,
} from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import {
  CustomHomeIcon,
  CustomSearchIcon,
  CustomCalendarIcon,
  CustomProfileIcon,
} from '../../components/common/Icons';
import { theme } from '../../constants/theme';
import { horizontalScale, verticalScale, moderateScale } from '../../hooks/useScale';
import LanguageModal from '../../components/common/LanguageModal';

export const ExploreScreen = () => {
  const navigation = useNavigation();
  const { preferredLanguage, activeArea } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLangModalVisible, setIsLangModalVisible] = useState(false);

  const isMr = preferredLanguage === 'mr';
  const localityName = isMr ? activeArea?.name_mr : activeArea?.name_en;
  const currentLocality = localityName || 'Bandra West';

  const strings = {
    searchPlaceholder: isMr ? 'सेवा किंवा व्यवसाय शोधा' : 'Search service or business',
    browseTitle: isMr ? 'वर्गवारी ब्राउझ करा' : 'Browse categories',
    popularTitle: isMr ? 'तुमच्या जवळील लोकप्रिय' : 'Popular near you',
  };

  const categories = [
    { id: 'home', label_en: 'Home', label_mr: 'घर', icon: HomeIcon, slug: 'plumbing' },
    { id: 'events', label_en: 'Events', label_mr: 'कार्यक्रम', icon: Sparkles, slug: 'food' },
    { id: 'beauty', label_en: 'Beauty', label_mr: 'सौंदर्य', icon: Sparkle, slug: 'cleaning' },
    { id: 'tutors', label_en: 'Tutors', label_mr: 'शिक्षक', icon: Columns, slug: 'legal' },
    { id: 'health', label_en: 'Health', label_mr: 'आरोग्य', icon: Plus, slug: 'plumbing' },
    { id: 'auto', label_en: 'Auto', label_mr: 'ऑटो', icon: Car, slug: 'electric' },
    { id: 'stores', label_en: 'Stores', label_mr: 'दुकानें', icon: Store, slug: 'food' },
    { id: 'more', label_en: 'More', label_mr: 'अधिक', icon: MoreHorizontal, slug: 'plumbing' },
  ];

  const popularVendors = [
    {
      id: 'vendor-raju-electricals',
      nameEn: 'Raju Electricals',
      nameMr: 'राजू इलेक्ट्रिकल्स',
      categoryEn: 'Electricals',
      categoryMr: 'इलेक्ट्रिकल्स',
      rating: '4.6',
      reviews: '38',
      distance: isMr ? '४०० मी' : '400 m',
      logoBg: '#EAD5B7',
    },
    {
      id: 'vendor-tai-tiffin',
      nameEn: 'Tai Tiffin Service',
      nameMr: 'ताई टिफिन सर्व्हिस',
      categoryEn: 'Food',
      categoryMr: 'जेवण',
      rating: '4.6',
      reviews: '38',
      distance: isMr ? '७०० मी' : '700 m',
      logoBg: '#D3E2D8',
    },
  ];

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;
    navigation.navigate('SearchResults', { query: searchQuery.trim() });
  };

  const handleCategoryPress = (slug) => {
    navigation.navigate('SearchResults', { categorySlug: slug });
  };

  const handleSwitchArea = () => {
    const routeNames = navigation.getState()?.routeNames || [];
    const targetRoute = routeNames.includes('SwitchArea') ? 'SwitchArea' : 'LocationSelect';
    navigation.navigate(targetRoute);
  };

  const handleNotifications = () => {
    const routeNames = navigation.getState()?.routeNames || [];
    const targetRoute = routeNames.includes('Notifications')
      ? 'Notifications'
      : routeNames.includes('Alerts')
      ? 'Alerts'
      : 'LocationSelect';
    if (targetRoute !== 'LocationSelect') {
      navigation.navigate(targetRoute);
    }
  };

  const handleTabPress = (tabName) => {
    try {
      navigation.navigate(tabName);
    } catch (e) {
      navigation.navigate('ResidentMain', { screen: tabName });
    }
  };

  const VerifiedBadge = () => (
    <View style={styles.verifiedContainer}>
      <View style={styles.verifiedCheckmark} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.viewport}>
        {/* Top Header Bar */}
        <View style={styles.headerBar}>
          <Pressable onPress={handleSwitchArea} style={styles.localityFrame}>
            <Text style={styles.localityName} numberOfLines={1}>
              {currentLocality}
            </Text>
            <ChevronDown
              size={18}
              color="#8A7C66"
              strokeWidth={2.5}
              style={styles.dropdownArrow}
            />
          </Pressable>

          <View style={styles.headerActions}>
            <Pressable
              onPress={() => setIsLangModalVisible(true)}
              style={styles.langBtn}
            >
              <Text style={styles.langText}>
                {preferredLanguage === 'mr' ? 'म' : 'EN'}
              </Text>
            </Pressable>

            <Pressable onPress={handleNotifications} style={styles.bellBtn}>
              <Bell size={16} color="#E8642A" fill="#E8642A" />
            </Pressable>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Search Bar Input */}
          <View style={styles.searchBar}>
            <Search size={18} color="#8A7C66" style={styles.searchIcon} />
            <TextInput
              placeholder={strings.searchPlaceholder}
              placeholderTextColor="#8A7C66"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
              style={styles.searchInput}
            />
          </View>

          {/* Browse Categories Title */}
          <Text style={styles.sectionTitle}>{strings.browseTitle}</Text>

          {/* Categories Grid (4x2) */}
          <View style={styles.gridContainer}>
            {categories.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => handleCategoryPress(cat.slug)}
                  style={styles.gridItem}
                >
                  <View style={styles.catIconContainer}>
                    <IconComponent size={24} color="#7E5131" strokeWidth={2.2} />
                  </View>
                  <Text style={styles.catLabel} numberOfLines={1}>
                    {isMr ? cat.label_mr : cat.label_en}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Popular near you section */}
          <Text style={styles.sectionTitle}>{strings.popularTitle}</Text>

          {/* Popular near you list */}
          <View style={styles.listContainer}>
            {popularVendors.map((vendor) => (
              <Pressable
                key={vendor.id}
                onPress={() =>
                  navigation.navigate('BusinessProfile', { vendorId: vendor.id })
                }
                style={styles.vendorRow}
              >
                <View style={[styles.vendorLogo, { backgroundColor: vendor.logoBg }]} />

                <View style={styles.vendorDetails}>
                  <View style={styles.nameRow}>
                    <Text style={styles.vendorName}>
                      {isMr ? vendor.nameMr : vendor.nameEn}
                    </Text>
                    <VerifiedBadge />
                  </View>
                  <Text style={styles.vendorSubtext}>
                    <Star
                      size={11}
                      color="#E8642A"
                      fill="#E8642A"
                      style={styles.starIcon}
                    />
                    {` ${vendor.rating} (${vendor.reviews}) · ${
                      isMr ? vendor.categoryMr : vendor.categoryEn
                    } · ${vendor.distance}`}
                  </Text>
                </View>

                <ChevronRight size={14} color="#8A7C66" style={styles.chevron} />
              </Pressable>
            ))}
          </View>

          <View style={styles.spacingBottom} />
        </ScrollView>

        {/* Mock Bottom Tab Bar Container (Explore active) */}
        <View style={styles.tabBarContainer}>
          <View style={styles.activeCapsule} />

          {/* Home Tab */}
          <Pressable
            onPress={() => handleTabPress('MyArea')}
            style={[styles.tabButton, { left: horizontalScale(5) }]}
          >
            <View style={styles.iconContainer}>
              <CustomHomeIcon isFocused={false} size={20} />
            </View>
            <Text style={styles.tabLabel}>{isMr ? 'माझा परिसर' : 'Home'}</Text>
          </Pressable>

          {/* Explore Active Tab */}
          <Pressable
            onPress={() => handleTabPress('Explore')}
            style={[styles.tabButton, { left: horizontalScale(86) }]}
          >
            <View style={styles.iconContainer}>
              <CustomSearchIcon isFocused={true} size={20} />
            </View>
            <Text style={[styles.tabLabel, styles.activeTabLabel]}>
              {isMr ? 'माझा परिसर' : 'Explore'}
            </Text>
          </Pressable>

          {/* Bookings Tab */}
          <Pressable
            onPress={() => handleTabPress('BookingsList')}
            style={[styles.tabButton, { left: horizontalScale(168) }]}
          >
            <View style={styles.iconContainer}>
              <CustomCalendarIcon isFocused={false} size={20} />
            </View>
            <Text style={styles.tabLabel}>{isMr ? 'बुकिंग्स' : 'Bookings'}</Text>
          </Pressable>

          {/* Profile Tab */}
          <Pressable
            onPress={() => handleTabPress('Profile')}
            style={[styles.tabButton, { left: horizontalScale(250) }]}
          >
            <View style={styles.iconContainer}>
              <CustomProfileIcon isFocused={false} size={20} />
            </View>
            <Text style={styles.tabLabel}>{isMr ? 'प्रोफाईल' : 'Profile'}</Text>
          </Pressable>
        </View>

        <LanguageModal
          visible={isLangModalVisible}
          onClose={() => setIsLangModalVisible(false)}
          currentLanguage={preferredLanguage}
          onSelectLanguage={async (lang) => {
            await useAuthStore.getState().setLanguage(lang);
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8', // Beige/cream page background
  },
  viewport: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#F5F0E8',
  },
  headerBar: {
    height: verticalScale(52),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(18),
    backgroundColor: '#F5F0E8',
    marginTop: verticalScale(20), // Compensate for status bar spacing
  },
  localityFrame: {
    flexDirection: 'row',
    alignItems: 'center',
    height: verticalScale(30),
  },
  localityName: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    fontSize: moderateScale(20),
    color: '#3C1A00', // Dark text color as requested
    maxWidth: horizontalScale(200),
  },
  dropdownArrow: {
    marginLeft: 6,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  langBtn: {
    width: horizontalScale(44),
    height: verticalScale(28),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0CFB0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  langText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    fontSize: moderateScale(12),
    color: '#6B5F4E',
  },
  bellBtn: {
    width: horizontalScale(24),
    height: verticalScale(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(18),
    paddingTop: verticalScale(12),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    height: verticalScale(48),
    paddingHorizontal: horizontalScale(16),
    borderWidth: 1.5,
    borderColor: '#EFE3CC',
    marginBottom: verticalScale(24),
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(14),
    fontFamily: theme.typography.fontFamily.regular,
    color: '#3C1A00',
    height: '100%',
    padding: 0,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    fontSize: moderateScale(14),
    color: '#6B5F4E',
    marginBottom: verticalScale(16),
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: verticalScale(24),
    rowGap: verticalScale(16),
  },
  gridItem: {
    width: horizontalScale(76),
    alignItems: 'center',
  },
  catIconContainer: {
    width: 72, // Square size 72x72 as requested
    height: 72,
    borderRadius: 16,
    backgroundColor: '#FFF3E0', // Peach bg as requested
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  catLabel: {
    fontSize: moderateScale(11),
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: '500',
    color: '#3D362E',
    textAlign: 'center',
    width: horizontalScale(70),
  },
  listContainer: {
    width: '100%',
    gap: verticalScale(10),
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    height: verticalScale(64),
    paddingLeft: horizontalScale(12),
    paddingRight: horizontalScale(20),
    borderWidth: 1.5,
    borderColor: '#EFE3CC',
  },
  vendorLogo: {
    width: 44, // Thumbnail square 44x44
    height: 44,
    borderRadius: 12,
    marginRight: 12,
  },
  vendorDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  vendorName: {
    fontSize: moderateScale(15),
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: '600',
    color: '#3C1A00',
  },
  verifiedContainer: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#E8642A', // Orange verified badge
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  verifiedCheckmark: {
    width: 6,
    height: 4,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
    marginTop: -1,
  },
  vendorSubtext: {
    fontSize: moderateScale(13),
    fontFamily: theme.typography.fontFamily.regular,
    color: '#6B5F4E',
    lineHeight: verticalScale(16),
  },
  starIcon: {
    marginTop: -2,
  },
  chevron: {
    marginLeft: 0,
  },
  spacingBottom: {
    height: verticalScale(100),
  },
  tabBarContainer: {
    position: 'absolute',
    width: horizontalScale(361),
    height: verticalScale(70),
    left: horizontalScale(16),
    top: verticalScale(764),
    backgroundColor: '#FFFFFF',
    borderRadius: 42,
    borderWidth: 1.5,
    borderColor: '#EFE3CC',
    shadowColor: '#2A2520',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 8,
  },
  activeCapsule: {
    position: 'absolute',
    width: horizontalScale(106),
    height: verticalScale(60),
    left: horizontalScale(86), // Explore active (index 1)
    top: 5,
    backgroundColor: 'rgba(208, 208, 208, 0.7)',
    borderRadius: 30,
  },
  tabButton: {
    position: 'absolute',
    width: horizontalScale(106),
    height: verticalScale(60),
    top: 5,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    gap: 4,
  },
  tabLabel: {
    fontSize: moderateScale(11),
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: '500',
    lineHeight: verticalScale(18),
    color: '#6B5F4E',
    textAlign: 'center',
  },
  activeTabLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    color: '#3C1A00',
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ExploreScreen;
