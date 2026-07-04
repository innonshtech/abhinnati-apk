import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Switch, ActivityIndicator, FlatList } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Star, ShieldCheck, ClipboardList, Calendar, Users, Eye, Coffee, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { theme } from '../../constants/theme';
import { horizontalScale, verticalScale, moderateScale } from '../../hooks/useScale';
import { RootStackParamList } from '../../navigation/types';
import Card from '../../components/common/Card';
import Tag from '../../components/common/Tag';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../api/client';
import { Vendor, Booking } from '../../api/mockData';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const getTodayHoursString = (weeklyHoursJson: string | null | undefined, isMr: boolean) => {
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = weekdays[new Date().getDay()];
  
  if (weeklyHoursJson) {
    try {
      const config = JSON.parse(weeklyHoursJson);
      const todayConfig = config[today];
      if (todayConfig) {
        if (todayConfig.closed) {
          return isMr ? 'आज बंद आहे' : 'Closed Today';
        }
        return `${todayConfig.startTime || '9:00 AM'} – ${todayConfig.endTime || '6:00 PM'}`;
      }
    } catch {}
  }
  
  if (today === 'Sunday') {
    return isMr ? 'आज बंद आहे' : 'Closed Today';
  }
  return '9:00 AM – 6:00 PM';
};

export const VendorDashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, preferredLanguage, setUserMode } = useAuthStore();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const isMr = preferredLanguage === 'mr';

  const strings = {
    title: isMr ? 'माझे दुकान' : 'Vendor Dashboard',
    btnSwitchMode: isMr ? 'ग्राहक मोड' : 'Resident Mode',
    statPending: isMr ? 'नवीन ऑर्डर्स' : 'Pending Jobs',
    statTotal: isMr ? 'एकूण बुकिंग्स' : 'Total Bookings',
    statRating: isMr ? 'रेटिंग' : 'Rating',
    vacationTitle: isMr ? 'सुट्टी मोड (Vacation Mode)' : 'Vacation Mode',
    vacationSub: isMr ? 'सुरू असताना ग्राहक नवीन बुकिंग करू शकणार नाहीत.' : 'When active, residents cannot place new bookings.',
    pendingAlert: isMr ? 'प्रलंबित ऑर्डर्स मंजूर करा' : 'Pending Booking Approvals',
    pendingBtn: isMr ? 'तपासा' : 'Review',
    scheduleHeader: isMr ? 'आजचे वेळापत्रक' : 'Today\'s Schedule',
    emptySchedule: isMr ? 'आज कोणतीही बुकिंग नाही.' : 'No bookings scheduled for today.',
    priceLabel: isMr ? 'शुल्क' : 'Cost',
    loading: isMr ? 'डेटा लोड होत आहे...' : 'Loading dashboard...',
    noVendor: isMr ? 'नोंदणीकृत व्यवसाय आढळला नाही.' : 'No vendor profile associated with this account.',
  };

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      const v = await api.getVendorByUserId(user.id);
      if (v) {
        setVendor(v);
        
        // Load vendor specific bookings
        const b = await api.getBookings(undefined, v.id);
        setBookings(b);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadDashboardData();
    }, [user])
  );

  const handleSwitchToResident = () => {
    setUserMode('resident');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.marigold} />
        <Text style={styles.loadingText}>{strings.loading}</Text>
      </SafeAreaView>
    );
  }

  if (!vendor) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{strings.noVendor}</Text>
      </SafeAreaView>
    );
  }

  // Calculate metrics
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const totalCount = bookings.length;
  
  // Filter today's bookings (we will assume any booking with date matching the first seeded booking is today, or just render active bookings)
  const todayBookings = bookings.filter(b => b.status === 'accepted');

  const areaName = vendor.areaId === 'area-bandra' ? 'Bandra West' : 'Ravet';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Navigation Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerBusinessName}>{isMr ? (vendor.businessNameMr || vendor.businessNameEn) : vendor.businessNameEn}</Text>
          <View style={styles.verifiedRow}>
            <View style={styles.verifiedDot} />
            <Text style={styles.verifiedText}>
              {isMr ? `वांद्रे पश्चिम मध्ये सक्रिय · पडताळणीकृत` : `Live in ${areaName} · Verified`}
            </Text>
          </View>
        </View>
        
        <Pressable onPress={handleSwitchToResident} style={styles.switchBtn}>
          <Users size={12} color="#6B5F4E" />
          <Text style={styles.switchBtnText}>{isMr ? 'ग्राहक मोड' : 'User mode'}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Pending bookings alert banner */}
        {pendingCount > 0 && (
          <Card style={styles.alertCard}>
            <View style={styles.alertLeft}>
              <View style={styles.alertBulletIcon} />
              <Text style={styles.alertText}>
                {isMr ? `${pendingCount} नवीन बुकिंग विनंत्या` : `${pendingCount} new booking requests`}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                const firstPending = bookings.find(b => b.status === 'pending');
                if (firstPending) {
                  navigation.navigate('BookingAction', { bookingId: firstPending.id });
                }
              }}
              style={styles.alertBtn}
            >
              <Text style={styles.alertBtnText}>{isMr ? 'तपासा' : 'Review'}</Text>
              <ChevronRight size={14} color="#9A5A12" />
            </Pressable>
          </Card>
        )}

        {/* Today's Schedule */}
        <Text style={styles.sectionTitle}>{isMr ? 'आज' : 'Today'}</Text>
        
        {todayBookings.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Coffee size={20} color="#8A7C66" style={{ marginRight: 10 }} />
            <Text style={styles.emptyText}>{isMr ? 'आज कोणतीही बुकिंग नाही.' : 'No bookings scheduled for today.'}</Text>
          </Card>
        ) : (
          (() => {
            const nextBooking = todayBookings[0];
            return (
              <Pressable
                onPress={() => navigation.navigate('BookingAction', { bookingId: nextBooking.id })}
                style={styles.todayScheduleCard}
              >
                <Calendar size={20} color="#8A7C66" style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.todayScheduleTitle}>{nextBooking.serviceName}</Text>
                  <Text style={styles.todayScheduleSub}>{nextBooking.bookingTime} · {nextBooking.userName}</Text>
                </View>
              </Pressable>
            );
          })()
        )}

        {/* Statistics Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statVal}>128</Text>
            <Text style={styles.statLabel}>{isMr ? 'व्ह्यूज' : 'Views'}</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statVal}>{totalCount}</Text>
            <Text style={styles.statLabel}>{isMr ? 'बुकिंग्स' : 'Bookings'}</Text>
          </Card>

          <Pressable onPress={() => navigation.navigate('VendorReviews')} style={{ flex: 1 }}>
            <Card style={styles.statCard}>
              <View style={styles.ratingRow}>
                <Text style={styles.statVal}>{vendor.ratingAvg > 0 ? vendor.ratingAvg : 'नवीन'}</Text>
                {vendor.ratingAvg > 0 && <Star size={16} color={theme.colors.marigold} fill={theme.colors.marigold} />}
              </View>
              <Text style={styles.statLabel}>{isMr ? 'रेटिंग' : 'Rating'}</Text>
            </Card>
          </Pressable>
        </View>

        {/* Availability Card */}
        <Card style={styles.availabilityCard}>
          <View style={styles.availabilityRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.availabilityTitle}>Availability</Text>
              {vendor.vacationMode ? (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.availabilityStatusRed}>🔴 Currently Unavailable</Text>
                  <Text style={styles.availabilitySubText}>Vacation Mode Enabled</Text>
                  {vendor.vacationEnd ? (
                    <Text style={styles.availabilitySubText}>
                      Available again on: {new Date(vendor.vacationEnd).toLocaleDateString(isMr ? 'mr-IN' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Text>
                  ) : null}
                </View>
              ) : (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.availabilityStatusGreen}>🟢 Available Today</Text>
                  <Text style={styles.availabilityTimeText}>
                    {getTodayHoursString(vendor.weeklyHours, isMr)}
                  </Text>
                </View>
              )}
            </View>
            <Pressable onPress={() => navigation.navigate('ManageAvailability')} style={styles.availabilityEditBtn}>
              <Text style={styles.availabilityEditText}>{isMr ? 'सुधारा →' : 'Edit →'}</Text>
            </Pressable>
          </View>
        </Card>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>{isMr ? 'जलद कृती' : 'Quick actions'}</Text>
        <View style={styles.quickActionsGrid}>
          {/* Row 1 */}
          <View style={styles.quickActionsRow}>
            <Pressable 
              onPress={() => (navigation as any).navigate('ManageServices')} 
              style={styles.quickActionCard}
            >
              <View style={styles.quickActionIconContainer}>
                <View style={styles.menuIconBar} />
                <View style={styles.menuIconBar} />
                <View style={styles.menuIconBar} />
              </View>
              <Text style={styles.quickActionText}>{isMr ? 'सेवा व्यवस्थापन' : 'Manage services'}</Text>
            </Pressable>

            <Pressable 
              onPress={() => navigation.navigate('ManageBusiness')} 
              style={styles.quickActionCard}
            >
              <View style={styles.quickActionIconContainer}>
                <View style={styles.pencilIconBody} />
              </View>
              <Text style={styles.quickActionText}>{isMr ? 'व्यवसाय संपादन' : 'Edit business'}</Text>
            </Pressable>
          </View>

          {/* Row 2 */}
          <View style={styles.quickActionsRow}>
            <Pressable 
              onPress={() => {
                navigation.navigate('VendorReviews');
              }} 
              style={styles.quickActionCard}
            >
              <View style={styles.quickActionIconContainer}>
                <View style={styles.linkIconSquare} />
              </View>
              <Text style={styles.quickActionText}>{isMr ? 'प्रोफाइल पहा' : 'View listing'}</Text>
            </Pressable>

            <Pressable 
              onPress={() => {}} 
              disabled={true}
              style={[styles.quickActionCard, { opacity: 0.7 }]}
            >
              <View style={styles.quickActionIconContainer}>
                <Text style={{ fontSize: 14, color: '#B6A98F' }}>✦</Text>
              </View>
              <Text style={[styles.quickActionText, { color: '#A89A82' }]}>
                {isMr ? 'जाहिरात · P2' : 'Promote · P2'}
              </Text>
            </Pressable>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.cream,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.cream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: moderateScale(14),
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textSecondary,
  },
  header: {
    paddingHorizontal: horizontalScale(18),
    height: 70,
    paddingTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FBF6EC',
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    color: theme.colors.charcoal,
  },
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    width: 100,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0CFB0',
    backgroundColor: '#FFFFFF',
  },
  switchBtnText: {
    fontSize: moderateScale(11),
    fontFamily: 'Mukta-Medium',
    fontWeight: '500',
    color: '#6B5F4E',
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(18),
    paddingVertical: verticalScale(14),
  },
  statsGrid: {
    flexDirection: 'row',
    gap: horizontalScale(8),
    marginBottom: verticalScale(16),
  },
  statCard: {
    flex: 1,
    padding: horizontalScale(12),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  statVal: {
    fontSize: moderateScale(22),
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    color: theme.colors.charcoal,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    fontSize: moderateScale(11),
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  vacationCard: {
    padding: horizontalScale(14),
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    marginBottom: verticalScale(16),
  },
  vacationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vacationTextContainer: {
    flex: 0.8,
  },
  vacationTitle: {
    fontSize: moderateScale(14),
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    color: theme.colors.charcoal,
    marginBottom: 2,
  },
  vacationSub: {
    fontSize: moderateScale(11),
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textSecondary,
    lineHeight: 15,
  },
  alertCard: {
    padding: horizontalScale(14),
    borderColor: theme.colors.marigold,
    borderWidth: 1.5,
    backgroundColor: '#FFFDF9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(18),
  },
  alertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertText: {
    fontSize: moderateScale(13),
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    color: theme.colors.charcoal,
  },
  alertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  alertBtnText: {
    fontSize: moderateScale(12),
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    color: theme.colors.marigold,
  },
  sectionTitle: {
    fontSize: moderateScale(15),
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    color: theme.colors.charcoal,
    marginBottom: verticalScale(10),
  },
  emptyCard: {
    padding: horizontalScale(24),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  emptyIcon: {
    marginBottom: 8,
  },
  emptyText: {
    fontSize: moderateScale(13),
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textSecondary,
  },
  bookingItemCard: {
    padding: horizontalScale(14),
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    marginVertical: verticalScale(4),
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  clientName: {
    fontSize: moderateScale(14),
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    color: theme.colors.charcoal,
  },
  serviceName: {
    fontSize: moderateScale(12),
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: verticalScale(8),
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressLabel: {
    fontSize: moderateScale(11),
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textSecondary,
    flex: 0.8,
  },
  priceValue: {
    fontSize: moderateScale(14),
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    color: theme.colors.charcoal,
  },
  availabilityCard: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE3CC',
    borderRadius: 12,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  availabilityTitle: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: theme.typography.fontFamily.bold,
    color: '#8A7C66',
    textTransform: 'uppercase',
  },
  availabilityStatusGreen: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2E7D52',
    fontFamily: theme.typography.fontFamily.semiBold,
  },
  availabilityStatusRed: {
    fontSize: 15,
    fontWeight: '600',
    color: '#C0392B',
    fontFamily: theme.typography.fontFamily.semiBold,
  },
  availabilitySubText: {
    fontSize: 12,
    color: '#6B5F4E',
    marginTop: 2,
    fontFamily: theme.typography.fontFamily.regular,
  },
  availabilityTimeText: {
    fontSize: 13,
    color: '#2A2520',
    fontWeight: '600',
    marginTop: 4,
    fontFamily: theme.typography.fontFamily.medium,
  },
  availabilityEditBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  availabilityEditText: {
    fontSize: 13,
    color: '#E58A2B',
    fontWeight: '600',
    fontFamily: theme.typography.fontFamily.semiBold,
  },
  headerLeft: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  headerBusinessName: {
    fontFamily: 'Mukta-Bold',
    fontWeight: '700',
    fontSize: 18,
    color: '#2A2520',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  verifiedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2E7D52',
    marginRight: 6,
  },
  verifiedText: {
    fontFamily: 'Mukta-Medium',
    fontWeight: '500',
    fontSize: 12,
    color: '#2E7D52',
  },
  alertBulletIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E58A2B',
    marginRight: 10,
  },
  todayScheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE3CC',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  todayScheduleTitle: {
    fontFamily: 'Mukta-Bold',
    fontWeight: '700',
    fontSize: 14,
    color: '#2A2520',
  },
  todayScheduleSub: {
    fontFamily: 'Mukta-Regular',
    fontWeight: '400',
    fontSize: 12,
    color: '#8A7C66',
    marginTop: 2,
  },
  quickActionsGrid: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 4,
    marginBottom: 20,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickActionCard: {
    flex: 1,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE3CC',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  quickActionIconContainer: {
    width: 24,
    height: 24,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    fontFamily: 'Mukta-Medium',
    fontWeight: '500',
    fontSize: 13,
    color: '#2A2520',
    flex: 1,
  },
  menuIconBar: {
    width: 14,
    height: 2.2,
    backgroundColor: '#9A5A12',
    marginVertical: 1.5,
    borderRadius: 1,
  },
  pencilIconBody: {
    width: 12,
    height: 12,
    borderWidth: 1.6,
    borderColor: '#9A5A12',
    borderRadius: 2,
  },
  linkIconSquare: {
    width: 11,
    height: 11,
    borderWidth: 1.6,
    borderColor: '#9A5A12',
    borderRadius: 1.5,
  },
});

export default VendorDashboardScreen;
