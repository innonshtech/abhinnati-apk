import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuthStore } from '../../store/useAuthStore';
import { RootStackParamList } from '../../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../api/client';
import { theme } from '../../constants/theme';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface NotificationItem {
  id: string;
  type: string;
  titleEn?: string;
  titleMr?: string;
  title_en?: string;
  title_mr?: string;
  messageEn?: string;
  messageMr?: string;
  message_en?: string;
  message_mr?: string;
  timeEn?: string;
  timeMr?: string;
  createdAt?: string;
  referenceId?: string;
}

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, preferredLanguage } = useAuthStore();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      try {
        let res;
        if (user.role === 'vendor') {
          res = await api.getVendorNotifications();
        } else {
          res = await api.getNotifications(user.id);
        }
        const list = Array.isArray(res) ? res : (res?.data || []);
        setNotifications(list);
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [user]);

  const isMr = preferredLanguage === 'mr';

  const strings = {
    title: isMr ? 'सूचना' : 'Notifications',
    today: isMr ? 'आज' : 'Today',
    earlier: isMr ? 'पूर्वी' : 'Earlier',
  };

  const todayNotifications: NotificationItem[] = [
    {
      id: 'n1',
      type: 'confirm',
      titleEn: 'Booking confirmed',
      titleMr: 'बुकिंग निश्चित झाली',
      messageEn: "Aai's Bakery · Custom cake order",
      messageMr: "आईज् बेकरी · सानुकूल केक ऑर्डर",
      timeEn: '2h',
      timeMr: '२ ता.',
    },
    {
      id: 'n2',
      type: 'new_business',
      titleEn: 'New business near you',
      titleMr: 'तुमच्या जवळ नवीन व्यवसाय',
      messageEn: 'Sai Cycles just joined Bandra West',
      messageMr: 'साई सायकल नुकतेच वांद्रे पश्चिममध्ये सामील झाले',
      timeEn: '5h',
      timeMr: '५ ता.',
    },
    {
      id: 'n3',
      type: 'reply',
      titleEn: 'New reply',
      titleMr: 'नवीन उत्तर',
      messageEn: 'Mahesh replied to your water post',
      messageMr: 'महेशने तुमच्या पाण्याच्या पोस्टला उत्तर दिले',
      timeEn: '6h',
      timeMr: '६ ता.',
    },
  ];

  const earlierNotifications: NotificationItem[] = [
    {
      id: 'n4',
      type: 'reminder',
      titleEn: 'Booking reminder',
      titleMr: 'बुकिंगची आठवण',
      messageEn: 'Custom cake order · tomorrow 12:30',
      messageMr: 'सानुकूल केक ऑर्डर · उद्या १२:३०',
      timeEn: '1d',
      timeMr: '१ दि.',
    },
    {
      id: 'n5',
      type: 'payment',
      titleEn: 'Payment received',
      titleMr: 'पेमेंट प्राप्त झाले',
      messageEn: '₹600 for custom cake order',
      messageMr: '₹६०० सानुकूल केक ऑर्डरसाठी',
      timeEn: '2d',
      timeMr: '२ दि.',
    },
  ];

  const renderIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'confirm':
      case 'payment':
        return (
          <View style={[styles.iconCircle, styles.circleGreen]}>
            {/* Custom Green Checkmark */}
            <View style={styles.checkContainer}>
              <View style={styles.checkShort} />
              <View style={styles.checkLong} />
            </View>
          </View>
        );
      case 'new_business':
        return (
          <View style={[styles.iconCircle, styles.circleOrange]}>
            {/* Custom Gold Star */}
            <Text style={styles.starIcon}>★</Text>
          </View>
        );
      case 'reply':
      case 'review':
        return (
          <View style={[styles.iconCircle, styles.circleOrange]}>
            {/* Custom Message Box icon */}
            <View style={styles.replyBox}>
              <View style={styles.replyTail} />
            </View>
          </View>
        );
      case 'reminder':
        return (
          <View style={[styles.iconCircle, styles.circleLightOrange]}>
            {/* Custom Clock icon */}
            <View style={styles.clockCircle}>
              <View style={styles.clockHour} />
              <View style={styles.clockMinute} />
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  const handleNotificationPress = (item: NotificationItem) => {
    if (item.type === 'review') {
      navigation.navigate('ReviewReply', {
        reviewId: item.referenceId || item.id,
        userName: isMr ? 'ग्राहक अभिप्राय' : 'Customer',
        commentText: isMr ? (item.message_mr || item.messageMr || '') : (item.message_en || item.messageEn || ''),
      });
    }
  };

  const renderCard = (item: NotificationItem) => {
    const title = isMr 
      ? (item.title_mr || item.titleMr) 
      : (item.title_en || item.titleEn);
    const message = isMr 
      ? (item.message_mr || item.messageMr) 
      : (item.message_en || item.messageEn);
    
    let timeStr = isMr ? item.timeMr : item.timeEn;
    if (!timeStr && item.createdAt) {
      const diffHrs = Math.floor((Date.now() - new Date(item.createdAt).getTime()) / 3600000);
      if (diffHrs < 24) {
        timeStr = isMr ? `${diffHrs} ता.` : `${diffHrs}h`;
      } else {
        const days = Math.floor(diffHrs / 24);
        timeStr = isMr ? `${days} दि.` : `${days}d`;
      }
    }

    return (
      <Pressable 
        key={item.id} 
        onPress={() => handleNotificationPress(item)} 
        style={styles.card}
      >
        {renderIcon(item.type)}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardMessage}>{message}</Text>
        </View>
        <Text style={styles.cardTime}>{timeStr || ''}</Text>
      </Pressable>
    );
  };

  const todayDate = new Date();
  todayDate.setHours(0,0,0,0);

  const dynamicToday = notifications.filter(n => {
    const d = n.createdAt ? new Date(n.createdAt) : new Date();
    return d >= todayDate;
  });

  const dynamicEarlier = notifications.filter(n => {
    const d = n.createdAt ? new Date(n.createdAt) : new Date();
    return d < todayDate;
  });

  const displayToday = notifications.length > 0 ? dynamicToday : todayNotifications;
  const displayEarlier = notifications.length > 0 ? dynamicEarlier : earlierNotifications;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={15}>
          <View style={styles.backChevron} />
        </Pressable>
        <Text style={styles.headerTitle}>{strings.title}</Text>
      </View>
      <View style={styles.headerDivider} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading && notifications.length === 0 ? (
          <View style={{ paddingVertical: 20, alignItems: 'center' }}>
            <ActivityIndicator color={theme.colors.marigold || '#E58A2B'} />
          </View>
        ) : (
          <>
            {/* Today Section */}
            <Text style={styles.sectionHeader}>{strings.today}</Text>
            <View style={styles.cardGroup}>
              {displayToday.map(renderCard)}
            </View>

            {/* Earlier Section */}
            <Text style={[styles.sectionHeader, styles.marginSection]}>{strings.earlier}</Text>
            <View style={styles.cardGroup}>
              {displayEarlier.map(renderCard)}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF6EC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    height: 50,
    marginTop: 14,
  },
  backBtn: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backChevron: {
    width: 8,
    height: 8,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#2A2520',
    transform: [{ rotate: '45deg' }],
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Mukta-Bold',
    fontWeight: '700',
    color: '#2A2520',
    marginLeft: 14,
  },
  headerDivider: {
    height: 1,
    width: '100%',
    backgroundColor: '#EFE3CC',
    marginTop: 10,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 17,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 13,
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    color: '#6B5F4E',
    marginBottom: 8,
  },
  marginSection: {
    marginTop: 28,
  },
  cardGroup: {
    gap: 8,
  },
  card: {
    width: '100%',
    height: 60,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE3CC',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleGreen: {
    backgroundColor: '#E3F0E8',
  },
  circleOrange: {
    backgroundColor: '#FBE7CC',
  },
  circleLightOrange: {
    backgroundColor: '#FAEEDA',
  },
  checkContainer: {
    width: 14,
    height: 14,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkShort: {
    width: 5,
    height: 2,
    backgroundColor: '#2E7D52',
    transform: [{ rotate: '45deg' }],
    position: 'absolute',
    left: 2,
    top: 7,
  },
  checkLong: {
    width: 9,
    height: 2,
    backgroundColor: '#2E7D52',
    transform: [{ rotate: '-45deg' }],
    position: 'absolute',
    left: 4,
    top: 5,
  },
  starIcon: {
    fontSize: 20,
    color: '#9A5A12',
  },
  replyBox: {
    width: 14,
    height: 10,
    borderWidth: 2,
    borderColor: '#9A5A12',
    borderRadius: 2,
    position: 'relative',
  },
  replyTail: {
    width: 4,
    height: 4,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#9A5A12',
    transform: [{ rotate: '45deg' }],
    position: 'absolute',
    bottom: -3,
    left: 3,
    backgroundColor: '#FBE7CC',
  },
  clockCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#854F0B',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockHour: {
    width: 2,
    height: 4,
    backgroundColor: '#854F0B',
    position: 'absolute',
    top: 2,
  },
  clockMinute: {
    width: 4,
    height: 2,
    backgroundColor: '#854F0B',
    position: 'absolute',
    left: 6,
    top: 5,
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    color: '#2A2520',
  },
  cardMessage: {
    fontSize: 12,
    fontFamily: 'Mukta-Regular',
    color: '#6B5F4E',
    marginTop: -1,
  },
  cardTime: {
    fontSize: 11,
    fontFamily: 'Mukta-Regular',
    color: '#A89A82',
    alignSelf: 'flex-start',
    marginTop: 14,
    marginRight: 6,
  },
});

export default NotificationsScreen;
