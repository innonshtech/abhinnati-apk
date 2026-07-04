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

// CREATE: src/screens/user/SlotPickerScreen.jsx

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
import { ChevronLeft } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useBookingStore } from '../../store/useBookingStore';
import { api } from '../../api/client';
import { theme } from '../../constants/theme';
import { horizontalScale, verticalScale, moderateScale } from '../../hooks/useScale';
import Button from '../../components/common/Button';

export const SlotPickerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { preferredLanguage } = useAuthStore();
  const { setBookingDateTime, setBookingVendor } = useBookingStore();

  const businessId = route.params?.businessId || 'vendor-raju-electricals';
  const serviceName = route.params?.serviceName || 'Electrical Service';

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [dateList, setDateList] = useState([]);

  const isMr = preferredLanguage === 'mr';

  const strings = {
    title: isMr ? 'वेळ निवडा' : 'Choose a slot',
    dateLabel: isMr ? 'तारीख' : 'Date',
    timeLabel: isMr ? 'वेळ' : 'Time',
    btnContinue: isMr ? 'पुढे जा' : 'Continue',
  };

  const timeSlots = ['10:00', '12:30', '4:00', '5:30', '6:00', '7:30'];

  // Generate next 7 days
  useEffect(() => {
    const dates = [];
    const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysMr = ['रवि', 'सोम', 'मंग', 'बुध', 'गुरू', 'शुक्र', 'शनी'];

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${date}`;

      const dayLabel = isMr ? daysMr[d.getDay()] : daysEn[d.getDay()];
      const dayNumber = String(d.getDate());

      dates.push({ dateString, dayLabel, dayNumber });
    }

    setDateList(dates);
    if (dates.length > 0) {
      setSelectedDate(dates[0].dateString);
    }
  }, [preferredLanguage]);

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

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) return;

    const slotStr = `${selectedDate} ${selectedTime}`;

    // Update global store
    if (vendor) {
      setBookingVendor(vendor.id, isMr ? vendor.businessNameMr : vendor.businessNameEn);
    }
    setBookingDateTime(selectedDate, selectedTime);

    const routeNames = navigation.getState()?.routeNames || [];
    const targetRoute = routeNames.includes('Payment') ? 'Payment' : 'PaymentGateway';

    navigation.navigate(targetRoute, {
      businessId,
      vendorId: businessId,
      serviceName,
      slot: slotStr,
      date: selectedDate,
      time: selectedTime,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E8642A" />
      </View>
    );
  }

  const businessName = vendor
    ? isMr
      ? vendor.businessNameMr
      : vendor.businessNameEn
    : 'Business';

  const isBtnDisabled = !selectedDate || !selectedTime;

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
        showsVerticalScrollIndicator={false}
      >
        {/* Service summary header below title */}
        <View style={styles.summaryContainer}>
          <Text style={styles.serviceName}>{serviceName}</Text>
          <Text style={styles.businessNameSub}>{businessName}</Text>
        </View>

        {/* Date Section */}
        <Text style={styles.sectionHeader}>{strings.dateLabel}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.datesScroll}
        >
          {dateList.map((item) => {
            const isSelected = selectedDate === item.dateString;
            return (
              <Pressable
                key={item.dateString}
                onPress={() => setSelectedDate(item.dateString)}
                style={[styles.dateCard, isSelected && styles.dateCardSelected]}
              >
                <Text style={[styles.dayLabel, isSelected && styles.textSelected]}>
                  {item.dayLabel}
                </Text>
                <Text style={[styles.dayNumber, isSelected && styles.textSelected]}>
                  {item.dayNumber}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Time section */}
        <Text style={styles.sectionHeader}>{strings.timeLabel}</Text>
        <View style={styles.timeGrid}>
          {timeSlots.map((time) => {
            const isSelected = selectedTime === time;
            return (
              <Pressable
                key={time}
                onPress={() => setSelectedTime(time)}
                style={[styles.timeBox, isSelected && styles.timeBoxSelected]}
              >
                <Text style={[styles.timeText, isSelected && styles.textSelected]}>
                  {time}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.spacingBottom} />
      </ScrollView>

      {/* Footer Continue Button */}
      <View style={styles.footerBar}>
        <Button
          title={strings.btnContinue}
          onPress={handleContinue}
          disabled={isBtnDisabled}
          style={[styles.btn, isBtnDisabled && styles.btnDisabled]}
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F0E8',
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#3C1A00',
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(22),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(100),
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFE3CC',
    borderRadius: 16,
    padding: horizontalScale(16),
    marginBottom: verticalScale(24),
  },
  serviceName: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    fontSize: moderateScale(18),
    color: '#3C1A00',
    marginBottom: 4,
  },
  businessNameSub: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: '500',
    fontSize: moderateScale(14),
    color: '#8A7C66',
  },
  sectionHeader: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    fontSize: moderateScale(16),
    color: '#3C1A00',
    marginBottom: verticalScale(12),
  },
  datesScroll: {
    gap: 10,
    marginBottom: verticalScale(28),
    paddingBottom: 4,
  },
  dateCard: {
    width: horizontalScale(64),
    height: verticalScale(74),
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#EFE3CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateCardSelected: {
    backgroundColor: '#E8642A', // Orange selected date
    borderColor: '#E8642A',
  },
  dayLabel: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: moderateScale(13),
    color: '#6B5F4E',
    marginBottom: 2,
  },
  dayNumber: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    fontSize: moderateScale(18),
    color: '#3C1A00',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: verticalScale(12),
    columnGap: horizontalScale(8),
  },
  timeBox: {
    width: horizontalScale(108),
    height: verticalScale(46),
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#EFE3CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeBoxSelected: {
    backgroundColor: '#E8642A', // Orange selected time
    borderColor: '#E8642A',
  },
  timeText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: '600',
    fontSize: moderateScale(14),
    color: '#3C1A00',
  },
  textSelected: {
    color: '#FFFFFF',
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
    backgroundColor: '#000000', // Black Continue button
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

export default SlotPickerScreen;
