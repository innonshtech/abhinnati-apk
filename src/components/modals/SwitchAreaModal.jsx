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

// CREATE: src/components/modals/SwitchAreaModal.jsx

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Search, MapPin } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../api/client';
import { locationService } from '../../api/locationService';
import { theme } from '../../constants/theme';
import { horizontalScale, verticalScale, moderateScale } from '../../hooks/useScale';

export const SwitchAreaModal = ({ visible, onClose }) => {
  if (!visible) return null;

  const { preferredLanguage, activeArea, setActiveArea } = useAuthStore();
  const [selectedArea, setSelectedArea] = useState(activeArea);
  const [searchQuery, setSearchQuery] = useState('');
  const [areasList, setAreasList] = useState([]);
  const [gpsLoading, setGpsLoading] = useState(false);

  const isMr = preferredLanguage === 'mr';

  const strings = {
    title: isMr ? 'परिसर बदला' : 'Switch area',
    searchPlaceholder: isMr ? 'परिसर शोधा' : 'Search locality',
    useCurrentLocation: isMr ? 'माझे चालू स्थान वापरा' : 'Use current location',
    btnDone: isMr ? 'पूर्ण झाले' : 'Done',
  };

  useEffect(() => {
    if (visible) {
      setSelectedArea(activeArea);
      setSearchQuery('');
    }
  }, [visible, activeArea]);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const list = await api.getAreas();
        setAreasList(list || []);
      } catch (err) {
        console.error('Error fetching areas in SwitchAreaModal:', err);
      }
    };
    fetchAreas();
  }, []);

  const handleSelectArea = (area) => {
    setSelectedArea(area);
  };

  const handleUseCurrentLocation = async () => {
    setGpsLoading(true);
    try {
      const details = await locationService.getCurrentLocation();
      const existing = areasList.find(a => a.id === details.placeId);
      let detectedArea;
      if (existing) {
        detectedArea = existing;
      } else {
        detectedArea = {
          id: details.placeId,
          name_en: details.locality ? `${details.locality}, ${details.city}` : details.city,
          name_mr: details.locality ? `${details.locality}, ${details.city}` : details.city,
          latitude: details.latitude,
          longitude: details.longitude,
          radius_km: 5.0,
          locality: details.locality,
          city: details.city,
        };
      }
      setSelectedArea(detectedArea);
      const { setDeviceGps } = useAuthStore.getState();
      await setDeviceGps(detectedArea);
    } catch (err) {
      console.error('Error fetching current location:', err);
    } finally {
      setGpsLoading(false);
    }
  };

  const handleDone = async () => {
    if (selectedArea) {
      await setActiveArea(selectedArea);
    }
    onClose();
  };

  // Filter area list based on query
  const filteredAreas = areasList.filter((area) => {
    const name = (isMr ? area.name_mr : area.name_en || '').toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.backdropPressable} onPress={onClose} />

        <View style={styles.bottomSheet}>
          {/* Top handle bar */}
          <View style={styles.handleBar} />

          {/* Title */}
          <Text style={styles.title}>{strings.title}</Text>

          {/* Search locality */}
          <View style={styles.searchBar}>
            <Search size={18} color="#8A7C66" style={styles.searchIcon} />
            <TextInput
              placeholder={strings.searchPlaceholder}
              placeholderTextColor="#8A7C66"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
          </View>

          {/* Use current location link */}
          <Pressable
            onPress={handleUseCurrentLocation}
            disabled={gpsLoading}
            style={styles.locationLinkRow}
          >
            {gpsLoading ? (
              <ActivityIndicator size="small" color="#E8642A" style={{ marginRight: 6 }} />
            ) : (
              <MapPin size={16} color="#E8642A" />
            )}
            <Text style={styles.locationLinkText}>{strings.useCurrentLocation}</Text>
          </Pressable>

          {/* Areas ScrollList */}
          <ScrollView
            style={styles.listScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.listContainer}>
              {filteredAreas.map((area) => {
                const isSelected = selectedArea?.id === area.id;
                const displayName = isMr ? area.name_mr : area.name_en;

                return (
                  <Pressable
                    key={area.id}
                    onPress={() => handleSelectArea(area)}
                    style={[
                      styles.areaRow,
                      isSelected ? styles.areaRowSelected : styles.areaRowUnselected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.areaNameText,
                        isSelected && styles.areaNameTextSelected,
                      ]}
                    >
                      {displayName}
                    </Text>

                    {isSelected ? (
                      <Svg width={16} height={12} viewBox="0 0 16 12" fill="none">
                        <Path
                          d="M1.5 6L5.5 10L14.5 1.5"
                          stroke="#E8642A"
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Black Done Button */}
          <Pressable onPress={handleDone} style={styles.doneBtn}>
            <Text style={styles.doneBtnText}>{strings.btnDone}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(26, 23, 20, 0.55)', // Dim overlay behind sheet
    justifyContent: 'flex-end',
  },
  backdropPressable: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF', // White sheet background
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: horizontalScale(22),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(34),
    maxHeight: verticalScale(550), // prevent covering full screen
  },
  handleBar: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#C4B49C',
    alignSelf: 'center',
    marginBottom: verticalScale(20),
    opacity: 0.6,
  },
  title: {
    fontSize: moderateScale(18),
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    color: '#3C1A00', // Dark text as requested
    marginBottom: verticalScale(14),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0', // Peach background as requested
    borderRadius: 12,
    height: verticalScale(44),
    paddingHorizontal: horizontalScale(14),
    marginBottom: verticalScale(14),
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(14),
    fontFamily: theme.typography.fontFamily.regular,
    color: '#3C1A00',
    height: '100%',
    padding: 0,
  },
  locationLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: verticalScale(16),
  },
  locationLinkText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: '600',
    fontSize: moderateScale(14),
    color: '#E8642A', // Orange text as requested
  },
  listScroll: {
    maxHeight: verticalScale(220),
    marginBottom: verticalScale(20),
  },
  listContainer: {
    gap: 8,
  },
  areaRow: {
    height: verticalScale(50),
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(16),
  },
  areaRowSelected: {
    borderWidth: 1.5,
    borderColor: '#E8642A', // Orange border selected row
    backgroundColor: '#FAF7F2',
  },
  areaRowUnselected: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#FAF7F2',
  },
  areaNameText: {
    fontSize: moderateScale(14),
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: '500',
    color: '#3C1A00',
  },
  areaNameTextSelected: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    color: '#E8642A', // Selected text color
  },
  doneBtn: {
    width: '100%',
    backgroundColor: '#000000', // Black Done button
    height: verticalScale(50),
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: moderateScale(14),
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
  },
});

export default SwitchAreaModal;
