import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, ActivityIndicator, Alert, BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { useBookingStore } from '../../store/useBookingStore';
import { api } from '../../api/client';
import { theme } from '../../constants/theme';
import { moderateScale } from '../../hooks/useScale';
import { RootStackParamList } from '../../navigation/types';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import { CustomChevronLeft } from '../../components/common/Icons';
import { SafeAreaView } from 'react-native-safe-area-context';

type NavigationProp = StackNavigationProp<RootStackParamList, 'ConfirmBooking'>;

export const ConfirmBookingScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { preferredLanguage } = useAuthStore();
  const {
    selectedVendorId,
    selectedVendorName,
    selectedService,
    selectedDate,
    selectedTime,
    notes,
    setNotes,
    clearBookingState,
  } = useBookingStore();

  const [localNotes, setLocalNotes] = useState(notes);
  const [submitting, setSubmitting] = useState(false);
  const isMr = preferredLanguage === 'mr';

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else (navigation as any).navigate('ResidentMain');
  };

  React.useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => sub.remove();
  }, [navigation]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(isMr ? 'mr-IN' : 'en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  const handleConfirm = async () => {
    if (!selectedVendorId || !selectedService || !selectedDate || !selectedTime) {
      Alert.alert(
        isMr ? 'त्रुटी' : 'Error',
        isMr ? 'कृपया सेवा, तारीख आणि वेळ निवडा.' : 'Please select a service, date, and time.'
      );
      return;
    }

    setSubmitting(true);
    setNotes(localNotes);
    try {
      const newBooking = await api.createBooking({
        vendorId: selectedVendorId,
        serviceId: selectedService.id,
        serviceName: isMr ? selectedService.name_mr : selectedService.name_en,
        vendorName: selectedVendorName,
        price: selectedService.price || 0,
        bookingDate: selectedDate,
        bookingTime: selectedTime,
        notes: localNotes || undefined,
      });
      navigation.replace('BookingSuccess', { bookingId: newBooking.id, booking: newBooking });
      clearBookingState();
    } catch (err: any) {
      Alert.alert(
        isMr ? 'बुकिंग अयशस्वी' : 'Could not send request',
        err?.response?.data?.error || err?.message || t('bookings.bookingError')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const serviceName = selectedService
    ? (isMr ? selectedService.name_mr || selectedService.name_en : selectedService.name_en || selectedService.name_mr)
    : '';

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <View style={styles.navigationHeader}>
        <Pressable onPress={handleBack} style={styles.backRow} accessibilityLabel="Go back">
          <CustomChevronLeft size={20} color="#2A2520" strokeWidth={3} />
          <Text style={styles.headerTitle}>{t('bookings.confirmTitle')}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.lead}>{t('bookings.confirmLead')}</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>{t('bookings.vendorLabel')}</Text>
            <Text style={styles.value}>{selectedVendorName || (isMr ? 'व्यवसाय' : 'Business')}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>{t('bookings.service')}</Text>
            <Text style={styles.value}>{serviceName}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>{t('bookings.when')}</Text>
            <Text style={styles.value}>{formatDate(selectedDate)} · {selectedTime}</Text>
          </View>
          {!!selectedService?.price && (
            <>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>{t('bookings.listedPrice')}</Text>
                <Text style={styles.value}>₹{selectedService.price}</Text>
              </View>
            </>
          )}
        </View>

        <InputField
          label={t('bookings.notesHeader')}
          placeholder={t('bookings.notesPlaceholder')}
          value={localNotes}
          onChangeText={setLocalNotes}
          containerStyle={styles.notes}
        />
      </ScrollView>

      <View style={styles.footer}>
        {submitting ? (
          <ActivityIndicator color="#E58A2B" />
        ) : (
          <Button
            title={t('bookings.btnConfirmBooking')}
            onPress={handleConfirm}
            style={styles.btn}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBF6EC' },
  navigationHeader: {
    paddingTop: 66,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#EFE3CC',
  },
  backRow: {
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: moderateScale(17),
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: '600',
    color: '#2A2520',
    marginLeft: 6,
  },
  scroll: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 40 },
  lead: {
    fontSize: moderateScale(14),
    fontFamily: theme.typography.fontFamily.regular,
    color: '#6B5F4E',
    lineHeight: 22,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE3CC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#8A7C66',
    flexShrink: 0,
  },
  value: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: '600',
    color: '#2A2520',
    textAlign: 'right',
    flex: 1,
  },
  divider: { height: 1, backgroundColor: '#F3E9D8' },
  notes: { marginTop: 4 },
  footer: { paddingHorizontal: 18, paddingBottom: 24 },
  btn: { width: '100%', height: 50, borderRadius: 12, backgroundColor: '#2A2520' },
});

export default ConfirmBookingScreen;
