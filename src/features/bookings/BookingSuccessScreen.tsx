import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import { useAuthStore } from '../../store/useAuthStore';
import { RootStackParamList } from '../../navigation/types';
import { api } from '../../api/client';
import { Booking } from '../../api/mockData';

type NavigationProp = StackNavigationProp<RootStackParamList, 'BookingSuccess'>;
type RouteProps = RouteProp<RootStackParamList, 'BookingSuccess'>;

export const BookingSuccessScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { bookingId } = route.params;
  const { preferredLanguage, user } = useAuthStore();

  const [booking, setBooking] = useState<Booking | null>(null);

  const isMr = preferredLanguage === 'mr';

  const strings = {
    title: isMr ? 'बुकिंगची विनंती केली!' : 'Booking Requested',
    notified: isMr ? 'व्यावसायिकाला कळवले गेले आहे आणि ते लवकरच बुकिंग विनंती स्वीकारतील' : 'The vendor has been notified and will accept booking request soon',
    btnBack: isMr ? 'परत जा' : 'Back to area',
    btnView: isMr ? 'बुकिंग तपासा' : 'View booking',
    loading: isMr ? 'तपशील लोड करत आहे...' : 'Loading details...',
  };

  const rosetteScale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const bookings = await api.getBookings(user?.id);
        const b = bookings.find((item) => item.id === bookingId);
        if (b) {
          setBooking(b);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchBooking();

    // Trigger premium animations
    rosetteScale.value = withSpring(1, { damping: 12, stiffness: 90 });
    opacity.value = withDelay(250, withSpring(1));
  }, [bookingId]);

  const rosetteAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: rosetteScale.value }],
    };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  if (!booking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E58A2B" />
        <Text style={styles.loadingText}>{strings.loading}</Text>
      </View>
    );
  }

  const formatTimeSlot = (time: string) => {
    if (time === '10:00') return '10:00 AM';
    if (time === '12:30') return '12:30 PM';
    if (time === '4:00') return '4:00 PM';
    if (time === '5:30') return '5:30 PM';
    if (time === '6:00') return '6:00 PM';
    if (time === '7:30') return '7:30 PM';
    return time;
  };

  const getFormattedDateLong = (dateStr: string) => {
    try {
      const dateObj = new Date(dateStr);
      const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const daysMr = ['रवि', 'सोम', 'मंग', 'बुध', 'गुरू', 'शुक्र', 'शनी'];
      
      const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthsMr = [
        'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 
        'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'
      ];

      const dayLabel = isMr ? daysMr[dateObj.getDay()] : daysEn[dateObj.getDay()];
      const monthLabel = isMr ? monthsMr[dateObj.getMonth()] : monthsEn[dateObj.getMonth()];
      const dayNum = dateObj.getDate();
      
      return `${dayLabel}, ${dayNum} ${monthLabel}`;
    } catch {
      return dateStr;
    }
  };

  const formattedDate = getFormattedDateLong(booking.bookingDate);
  const formattedTime = formatTimeSlot(booking.bookingTime);
  const detailsStr = `${booking.vendorName}\n${formattedDate} · ${formattedTime} · ${booking.serviceName}`;

  return (
    <View style={styles.container}>
      <View style={styles.viewport}>
        
        {/* Success Rosette (Frame 84x84) */}
        <Animated.View style={[styles.rosette, rosetteAnimatedStyle]}>
          <Svg width={37} height={30} viewBox="0 0 37 30">
            <Path
              d="M4 14.5l9 9L33 4"
              stroke="#2E7D52"
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </Animated.View>

        <Animated.View style={[{ flex: 1 }, contentAnimatedStyle]}>
          {/* Booking Confirmed Title */}
          <Text style={styles.title}>{strings.title}</Text>

          {/* Details String description */}
          <Text style={styles.detailsText}>
            {detailsStr}
          </Text>

          {/* Divider Frame line */}
          <View style={styles.divider} />

          {/* notified label */}
          <Text style={styles.notifiedText}>{strings.notified}</Text>

          {/* Back to Area Button */}
          <Pressable
            onPress={() => navigation.navigate('ResidentMain')}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>{strings.btnBack}</Text>
          </Pressable>

          {/* View Booking Button */}
          <Pressable
            onPress={() => navigation.navigate('BookingDetail', { bookingId })}
            style={styles.viewButton}
          >
            <Text style={styles.viewButtonText}>{strings.btnView}</Text>
          </Pressable>
        </Animated.View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF6EC', // Warm cream page background
  },
  viewport: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FBF6EC',
  },
  rosette: {
    position: 'absolute',
    width: 84,
    height: 84,
    left: 154.5,
    top: 140,
    backgroundColor: '#E3F0E8',
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 248,
    height: 35,
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    fontSize: 21,
    lineHeight: 35,
    color: '#2A2520',
    textAlign: 'center',
  },
  detailsText: {
    position: 'absolute',
    left: 36.5,
    right: 36.5,
    top: 286,
    height: 46,
    fontFamily: 'Mukta-Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 23,
    color: '#6B5F4E',
    textAlign: 'center',
  },
  divider: {
    position: 'absolute',
    left: 56.5,
    right: 56.5,
    top: 360,
    height: 1,
    backgroundColor: '#EFE3CC',
  },
  notifiedText: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 376,
    height: 44,
    fontFamily: 'Mukta-Regular',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 22,
    color: '#8A7C66',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 18,
    top: 724,
    width: 170,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8C29A',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 25,
    color: '#2A2520',
  },
  viewButton: {
    position: 'absolute',
    left: 205,
    top: 724,
    width: 170,
    height: 50,
    backgroundColor: '#2A2520',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewButtonText: {
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 25,
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FBF6EC',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Mukta-Medium',
    color: '#6B5F4E',
    marginTop: 12,
  },
});

export default BookingSuccessScreen;
