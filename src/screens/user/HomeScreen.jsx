import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Bell, ChevronDown } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import {
  CustomHomeIcon,
  CustomSearchIcon,
  CustomCalendarIcon,
  CustomProfileIcon,
} from '../../components/common/Icons';
import { api } from '../../api/client';
import { geoService } from '../../api/geoService';
import { theme } from '../../constants/theme';
import { horizontalScale, verticalScale, moderateScale } from '../../hooks/useScale';
import LanguageModal from '../../components/common/LanguageModal';

export const HomeScreen = () => {
  const navigation = useNavigation();
  const { preferredLanguage, activeArea, deviceGps, setDeviceGps } = useAuthStore();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLangModalVisible, setIsLangModalVisible] = useState(false);

  const isMr = preferredLanguage === 'mr';
  const localityName = isMr ? activeArea?.name_mr : activeArea?.name_en;
  const currentLocality = localityName || 'Bandra west';

  const strings = {
    title: isMr
      ? `${currentLocality} मध्ये नुकतीच सुरुवात झाली आहे`
      : `${currentLocality} is just getting started`,
    subtitle: isMr
      ? 'तुमच्या परिसरातील पहिली पोस्ट लिहिणारे व्हा आणि संवाद सुरू करा.'
      : 'Be the first to share something, or discover new businesses opening near you.',
    btnPost: isMr ? 'पोस्ट' : 'Post',
    btnNearby: isMr ? 'जवळचे परिसर' : 'Nearby areas',
    sectionTitle: isMr ? 'तुमच्या जवळील नवीन व्यवसाय' : 'New businesses near you',
  };

  // Silent GPS background update — no permission prompt, updates deviceGps only
  useEffect(() => {
    const silentGpsRefresh = async () => {
      try {
        const result = await geoService.silentUpdate();
        if (result.success && result.latitude !== null && result.longitude !== null) {
          const locality =
            result.localityLabel || result.address?.city || activeArea?.name_en || '';
          const areaObj = {
            id: `gps_${result.latitude.toFixed(5)}_${result.longitude.toFixed(5)}`,
            name_en: locality,
            name_mr: locality,
            latitude: result.latitude,
            longitude: result.longitude,
            locality,
            city: result.address?.city || '',
          };
          await setDeviceGps(areaObj);
        }
      } catch (err) {
        // Silent — never show errors to the user for background GPS
        console.log('[HomeScreen] Silent GPS refresh skipped:', err);
      }
    };
    silentGpsRefresh();
  }, []);

  useEffect(() => {
    const loadVendors = async () => {
      const targetAreaId = deviceGps?.id || activeArea?.id;
      if (!targetAreaId) {
        setLoading(false);
        return;
      }
      try {
        const areaVendors = await api.getVendors(targetAreaId);
        setVendors(areaVendors);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadVendors();
  }, [deviceGps, activeArea]);

  // Fallback static business info to match figma requirements
  const fallbackVendors = [
    {
      id: 'vendor-cycles',
      businessNameEn: 'Sai Cycles',
      businessNameMr: 'साई सायकल्स',
      categoryNameEn: 'Repair',
      categoryNameMr: 'दुरुस्ती',
      distance: '1.2 km',
      bannerColor: '#FBE7CC', // Peach tone
    },
    {
      id: 'vendor-tiffins',
      businessNameEn: 'Reshma Tiffin',
      businessNameMr: 'रेश्मा टिफिन',
      categoryNameEn: 'Food',
      categoryNameMr: 'जेवण',
      distance: '1.8 km',
      bannerColor: '#E8EFE9', // Light green tone
    },
    {
      id: 'vendor-electricals',
      businessNameEn: 'Nova Electricals',
      businessNameMr: 'नोव्हा इलेक्ट्रिकल्स',
      categoryNameEn: 'Electricals',
      categoryNameMr: 'इलेक्ट्रिकल्स',
      distance: '100 m',
      bannerColor: '#E8EFE9',
    },
    {
      id: 'vendor-water',
      businessNameEn: 'Water Supplier',
      businessNameMr: 'पाणी पुरवठा',
      categoryNameEn: 'General',
      categoryNameMr: 'जनरल',
      distance: '1.2 km',
      bannerColor: '#FBE7CC',
    },
  ];

  const getDisplayVendors = () => {
    if (vendors.length >= 4) {
      return vendors.slice(0, 4).map((v, i) => ({
        id: v.id,
        businessNameEn: v.businessNameEn,
        businessNameMr: v.businessNameMr,
        categoryNameEn: v.categoryNameEn,
        categoryNameMr: v.categoryNameMr,
        distance: v.distance,
        bannerColor: i === 0 || i === 3 ? '#FBE7CC' : '#E8EFE9',
      }));
    }
    return fallbackVendors;
  };

  const displayVendors = getDisplayVendors();

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
      : 'LocationSelect'; // Fallback
    if (targetRoute !== 'LocationSelect') {
      navigation.navigate(targetRoute);
    }
  };

  const handleNewPost = () => {
    const routeNames = navigation.getState()?.routeNames || [];
    const targetRoute = routeNames.includes('NewPost')
      ? 'NewPost'
      : routeNames.includes('CreatePost')
      ? 'CreatePost'
      : 'LocationSelect'; // Fallback
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E8642A" />
      </View>
    );
  }

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

        {/* Seedling Illustration inside Peach Circle */}
        <View style={styles.seedlingCircle}>
          <View style={styles.seedlingLeftLeaf} />
          <View style={styles.seedlingRightLeaf} />
          <View style={styles.seedlingStem} />
        </View>

        {/* Title & Subtitle */}
        <Text style={styles.title}>{strings.title}</Text>
        <Text style={styles.subtitle}>{strings.subtitle}</Text>

        {/* Action Buttons: Post & Nearby areas */}
        <Pressable onPress={handleNewPost} style={styles.postButton}>
          <Text style={styles.postButtonText}>{strings.btnPost}</Text>
        </Pressable>

        <Pressable onPress={handleSwitchArea} style={styles.nearbyButton}>
          <Text style={styles.nearbyButtonText}>{strings.btnNearby}</Text>
        </Pressable>

        {/* Section title */}
        <Text style={styles.sectionTitle}>{strings.sectionTitle}</Text>

        {/* Sai Cycles Card */}
        <Pressable
          onPress={() =>
            navigation.navigate('BusinessProfile', { vendorId: displayVendors[0].id })
          }
          style={styles.businessCard}
        >
          <View
            style={[
              styles.cardCover,
              { backgroundColor: displayVendors[0].bannerColor },
            ]}
          />
          <Text style={styles.cardName} numberOfLines={1}>
            {isMr ? displayVendors[0].businessNameMr : displayVendors[0].businessNameEn}
          </Text>
          <Text style={styles.cardInfo} numberOfLines={1}>
            {isMr ? displayVendors[0].categoryNameMr : displayVendors[0].categoryNameEn} ·{' '}
            {displayVendors[0].distance}
          </Text>
        </Pressable>

        {/* Reshma Tiffin Card */}
        <Pressable
          onPress={() =>
            navigation.navigate('BusinessProfile', { vendorId: displayVendors[1].id })
          }
          style={[styles.businessCard, { left: horizontalScale(205) }]}
        >
          <View
            style={[
              styles.cardCover,
              { backgroundColor: displayVendors[1].bannerColor },
            ]}
          />
          <Text style={styles.cardName} numberOfLines={1}>
            {isMr ? displayVendors[1].businessNameMr : displayVendors[1].businessNameEn}
          </Text>
          <Text style={styles.cardInfo} numberOfLines={1}>
            {isMr ? displayVendors[1].categoryNameMr : displayVendors[1].categoryNameEn} ·{' '}
            {displayVendors[1].distance}
          </Text>
        </Pressable>

        {/* Nova Electricals Card */}
        <Pressable
          onPress={() =>
            navigation.navigate('BusinessProfile', { vendorId: displayVendors[2].id })
          }
          style={[styles.businessCard, { top: verticalScale(560) }]}
        >
          <View
            style={[
              styles.cardCover,
              { backgroundColor: displayVendors[2].bannerColor },
            ]}
          />
          <Text style={styles.cardName} numberOfLines={1}>
            {isMr ? displayVendors[2].businessNameMr : displayVendors[2].businessNameEn}
          </Text>
          <Text style={styles.cardInfo} numberOfLines={1}>
            {isMr ? displayVendors[2].categoryNameMr : displayVendors[2].categoryNameEn} ·{' '}
            {displayVendors[2].distance}
          </Text>
        </Pressable>

        {/* Water Supplier Card */}
        <Pressable
          onPress={() =>
            navigation.navigate('BusinessProfile', { vendorId: displayVendors[3].id })
          }
          style={[
            styles.businessCard,
            { left: horizontalScale(205), top: verticalScale(560) },
          ]}
        >
          <View
            style={[
              styles.cardCover,
              { backgroundColor: displayVendors[3].bannerColor },
            ]}
          />
          <Text style={styles.cardName} numberOfLines={1}>
            {isMr ? displayVendors[3].businessNameMr : displayVendors[3].businessNameEn}
          </Text>
          <Text style={styles.cardInfo} numberOfLines={1}>
            {isMr ? displayVendors[3].categoryNameMr : displayVendors[3].categoryNameEn} ·{' '}
            {displayVendors[3].distance}
          </Text>
        </Pressable>

        {/* Mock Bottom Tab Bar Container */}
        <View style={styles.tabBarContainer}>
          <View style={styles.activeCapsule} />

          {/* Home Active Tab */}
          <Pressable
            onPress={() => handleTabPress('MyArea')}
            style={[styles.tabButton, { left: horizontalScale(5) }]}
          >
            <View style={styles.iconContainer}>
              <CustomHomeIcon isFocused={true} size={20} />
            </View>
            <Text style={[styles.tabLabel, styles.activeTabLabel]}>
              {isMr ? 'माझा परिसर' : 'Home'}
            </Text>
          </Pressable>

          {/* Explore Tab */}
          <Pressable
            onPress={() => handleTabPress('Explore')}
            style={[styles.tabButton, { left: horizontalScale(86) }]}
          >
            <View style={styles.iconContainer}>
              <CustomSearchIcon isFocused={false} size={20} />
            </View>
            <Text style={styles.tabLabel}>{isMr ? 'शोधा' : 'Explore'}</Text>
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
    backgroundColor: '#F5F0E8', // Beige background
  },
  viewport: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#F5F0E8',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F0E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBar: {
    position: 'absolute',
    left: horizontalScale(18),
    top: verticalScale(66),
    width: horizontalScale(358),
    height: verticalScale(30),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  localityFrame: {
    flexDirection: 'row',
    alignItems: 'center',
    height: verticalScale(30),
  },
  localityName: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: '600',
    fontSize: moderateScale(18),
    lineHeight: verticalScale(30),
    color: '#3C1A00', // Dark text as requested
    maxWidth: horizontalScale(200),
  },
  dropdownArrow: {
    marginLeft: 6,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    height: verticalScale(26),
    gap: 12,
  },
  langBtn: {
    width: horizontalScale(40),
    height: verticalScale(26),
    backgroundColor: '#F5F0E8',
    borderWidth: 1,
    borderColor: '#E0CFB0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  langText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: '600',
    fontSize: moderateScale(12),
    lineHeight: verticalScale(20),
    color: '#6B5F4E',
  },
  bellBtn: {
    width: horizontalScale(20),
    height: verticalScale(26),
    justifyContent: 'center',
    alignItems: 'center',
  },
  seedlingCircle: {
    position: 'absolute',
    width: 76,
    height: 76,
    left: horizontalScale(158),
    top: verticalScale(120),
    backgroundColor: '#FBE7CC', // Peach circle
    borderRadius: 38,
  },
  seedlingStem: {
    position: 'absolute',
    width: 3,
    height: verticalScale(22),
    left: 37,
    top: 32,
    backgroundColor: '#9A5A12',
    borderRadius: 1.5,
  },
  seedlingLeftLeaf: {
    position: 'absolute',
    width: 22,
    height: verticalScale(13),
    left: 15,
    top: 30,
    backgroundColor: '#E8642A', // Orange leaf
    borderRadius: 6.5,
  },
  seedlingRightLeaf: {
    position: 'absolute',
    width: 22,
    height: verticalScale(13),
    left: 39,
    top: 24,
    backgroundColor: '#C9760F',
    borderRadius: 6.5,
  },
  title: {
    position: 'absolute',
    width: horizontalScale(283),
    height: verticalScale(32),
    left: horizontalScale(55),
    top: verticalScale(216),
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: '600',
    fontSize: moderateScale(19),
    lineHeight: verticalScale(32),
    color: '#3C1A00',
    textAlign: 'center',
  },
  subtitle: {
    position: 'absolute',
    width: horizontalScale(300),
    height: verticalScale(44),
    left: horizontalScale(46.5),
    top: verticalScale(250),
    fontFamily: theme.typography.fontFamily.regular,
    fontWeight: '400',
    fontSize: moderateScale(14),
    lineHeight: verticalScale(22),
    color: '#6B5F4E',
    textAlign: 'center',
  },
  postButton: {
    position: 'absolute',
    width: horizontalScale(170),
    height: verticalScale(48),
    left: horizontalScale(18),
    top: verticalScale(316),
    backgroundColor: '#000000', // Black Continue/Post button
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postButtonText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: '600',
    fontSize: moderateScale(15),
    lineHeight: verticalScale(25),
    color: '#FFFFFF',
  },
  nearbyButton: {
    position: 'absolute',
    width: horizontalScale(170),
    height: verticalScale(48),
    left: horizontalScale(205),
    top: verticalScale(316),
    backgroundColor: 'transparent', // outlined button
    borderWidth: 1.5,
    borderColor: '#3C1A00',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nearbyButtonText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: '600',
    fontSize: moderateScale(15),
    lineHeight: verticalScale(25),
    color: '#3C1A00',
  },
  sectionTitle: {
    position: 'absolute',
    width: horizontalScale(200),
    height: verticalScale(23),
    left: horizontalScale(18),
    top: verticalScale(398),
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: '600',
    fontSize: moderateScale(14),
    lineHeight: verticalScale(23),
    color: '#6B5F4E',
  },
  businessCard: {
    position: 'absolute',
    width: horizontalScale(170),
    height: verticalScale(116),
    left: horizontalScale(18),
    top: verticalScale(426),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE3CC',
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardCover: {
    position: 'absolute',
    width: '100%',
    height: verticalScale(64),
    left: 0,
    top: 0,
  },
  cardName: {
    position: 'absolute',
    width: horizontalScale(148),
    height: verticalScale(23),
    left: 11,
    top: verticalScale(74),
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: '600',
    fontSize: moderateScale(14),
    lineHeight: verticalScale(23),
    color: '#3C1A00',
  },
  cardInfo: {
    position: 'absolute',
    width: horizontalScale(148),
    height: verticalScale(20),
    left: 11,
    top: verticalScale(94),
    fontFamily: theme.typography.fontFamily.regular,
    fontWeight: '400',
    fontSize: moderateScale(12),
    lineHeight: verticalScale(20),
    color: '#8A7C66',
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
    left: horizontalScale(5),
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

export default HomeScreen;
