import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ChevronRight, Inbox, Calendar } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { theme } from '../../constants/theme';
import { horizontalScale, verticalScale, moderateScale } from '../../hooks/useScale';
import { RootStackParamList } from '../../navigation/types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../api/client';
import { Booking } from '../../api/mockData';

type NavigationProp = StackNavigationProp<RootStackParamList>;
type TabType = 'upcoming' | 'past';

export const BookingsListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { preferredLanguage, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const isMr = preferredLanguage === 'mr';

  const strings = {
    title: isMr ? 'बुकिंग्स' : 'Bookings',
    tabUpcoming: isMr ? 'नवीन' : 'Upcoming',
    tabPast: isMr ? 'मागील' : 'Past',
    emptyTitle: isMr ? 'कोणतीही बुकिंग नाही!' : 'No bookings found!',
    emptySub: isMr ? 'आपल्या परिसरातील सेवा बुक करा.' : 'Book verified local service providers in your neighborhood.',
    btnExplore: isMr ? 'सेवा शोधा' : 'Explore Services',
    statusPending: isMr ? 'प्रलंबित' : 'Pending',
    statusConfirmed: isMr ? 'निश्चित' : 'Confirmed',
    statusCompleted: isMr ? 'पूर्ण' : 'Completed',
    statusCancelled: isMr ? 'रद्द' : 'Cancelled',
    statusDeclined: isMr ? 'नाकारली' : 'Declined',
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await api.getBookings(user?.id);
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchBookings();
    }, [])
  );

  const getFilteredBookings = () => {
    if (activeTab === 'upcoming') {
      return bookings.filter(b => b.status === 'pending' || b.status === 'accepted');
    } else {
      return bookings.filter(b => b.status === 'completed' || b.status === 'cancelled' || b.status === 'declined');
    }
  };

  const getStatusStyle = (status: Booking['status']) => {
    if (status === 'accepted') {
      return {
        bg: theme.colors.successBg,
        text: theme.colors.success,
        label: strings.statusConfirmed
      };
    }
    if (status === 'pending') {
      return {
        bg: theme.colors.marigoldSoftBg,
        text: theme.colors.marigold,
        label: strings.statusPending
      };
    }
    if (status === 'completed') {
      return {
        bg: theme.colors.successBg,
        text: theme.colors.success,
        label: strings.statusCompleted
      };
    }
    return {
      bg: theme.colors.dangerBg,
      text: theme.colors.danger,
      label: status === 'cancelled' ? strings.statusCancelled : strings.statusDeclined
    };
  };

  const formatBookingDate = (dateStr: string, timeStr: string) => {
    try {
      const date = new Date(dateStr);
      const weekday = date.toLocaleDateString(isMr ? 'mr-IN' : 'en-US', { weekday: 'short' });
      const day = date.getDate();
      const month = date.toLocaleDateString(isMr ? 'mr-IN' : 'en-US', { month: 'short' });
      return `${weekday}, ${day} ${month} · ${timeStr}`;
    } catch {
      return `${dateStr} · ${timeStr}`;
    }
  };

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const statusConfig = getStatusStyle(item.status);
    
    return (
      <Card
        onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id })}
        style={styles.bookingCard}
      >
        <View style={styles.cardContent}>
          <View style={styles.leftColumn}>
            <Text style={styles.vendorName} numberOfLines={1}>
              {item.vendorName}
            </Text>
            <Text style={styles.serviceName} numberOfLines={1}>
              {item.serviceName}
            </Text>
            <View style={styles.scheduleRow}>
              <Calendar size={13} color={theme.colors.textTertiary} style={styles.scheduleIcon} />
              <Text style={styles.scheduleText}>
                {formatBookingDate(item.bookingDate, item.bookingTime)}
              </Text>
            </View>
          </View>
          <View style={styles.rightColumn}>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
              <Text style={[styles.statusBadgeText, { color: statusConfig.text }]}>
                {statusConfig.label}
              </Text>
            </View>
            <ChevronRight size={18} color={theme.colors.textTertiary} />
          </View>
        </View>
      </Card>
    );
  };

  const filteredData = getFilteredBookings();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{strings.title}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Pressable
          onPress={() => setActiveTab('upcoming')}
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            {strings.tabUpcoming}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('past')}
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
            {strings.tabPast}
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.marigold} />
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={item => item.id}
          renderItem={renderBookingItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Inbox size={32} color={theme.colors.textTertiary} />
              </View>
              <Text style={styles.emptyTitle}>{strings.emptyTitle}</Text>
              <Text style={styles.emptySub}>{strings.emptySub}</Text>
              {activeTab === 'upcoming' && (
                <Button
                  title={strings.btnExplore}
                  onPress={() => navigation.navigate('ResidentMain')}
                  style={styles.exploreBtn}
                />
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.cream,
  },
  header: {
    paddingHorizontal: horizontalScale(18),
    height: verticalScale(56),
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    color: theme.colors.charcoal,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    paddingHorizontal: horizontalScale(18),
  },
  tab: {
    flex: 1,
    paddingVertical: verticalScale(14),
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.marigold,
  },
  tabText: {
    fontSize: moderateScale(14),
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    color: theme.colors.marigold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: horizontalScale(18),
    paddingVertical: verticalScale(14),
    flexGrow: 1,
    paddingBottom: verticalScale(100), // bottom nav space buffer
  },
  bookingCard: {
    padding: horizontalScale(16),
    marginVertical: verticalScale(6),
    borderWidth: 1.5,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.radii.card,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftColumn: {
    flex: 0.7,
  },
  vendorName: {
    fontSize: moderateScale(16),
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    color: theme.colors.charcoal,
    marginBottom: verticalScale(2),
  },
  serviceName: {
    fontSize: moderateScale(13),
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textSecondary,
    marginBottom: verticalScale(6),
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleIcon: {
    marginRight: 4,
  },
  scheduleText: {
    fontSize: moderateScale(12),
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textTertiary,
  },
  rightColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
  },
  statusBadge: {
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: moderateScale(11),
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(36),
    paddingVertical: verticalScale(80),
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  emptyTitle: {
    fontSize: moderateScale(16),
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    color: theme.colors.charcoal,
    marginBottom: verticalScale(6),
  },
  emptySub: {
    fontSize: moderateScale(13),
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: verticalScale(20),
  },
  exploreBtn: {
    paddingHorizontal: horizontalScale(20),
    backgroundColor: theme.colors.charcoal,
  },
});

export default BookingsListScreen;
