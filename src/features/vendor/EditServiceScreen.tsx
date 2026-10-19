import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { horizontalScale, verticalScale, moderateScale } from '../../hooks/useScale';
import { RootStackParamList } from '../../navigation/types';
import InputField from '../../components/common/InputField';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../api/client';
import { Vendor } from '../../api/mockData';

type NavigationProp = StackNavigationProp<RootStackParamList, 'EditService'>;
type RouteProps = RouteProp<RootStackParamList, 'EditService'>;

export const EditServiceScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { serviceId } = route.params || {};
  const { user, preferredLanguage } = useAuthStore();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [serviceNameMr, setServiceNameMr] = useState('');
  const [serviceNameEn, setServiceNameEn] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [descMr, setDescMr] = useState('');
  const [descEn, setDescEn] = useState('');

  const isMr = preferredLanguage === 'mr';

  const strings = {
    editTitle: t('vendor.editServiceTitle'),
    addTitle: t('vendor.addServiceTitle'),
    nameMrLabel: t('vendor.serviceNameMr'),
    nameEnLabel: t('vendor.serviceNameEn'),
    priceLabel: t('vendor.priceRs'),
    durationLabel: t('vendor.durationMins'),
    descMrLabel: t('vendor.descMr'),
    descEnLabel: t('vendor.descEn'),
    btnSave: t('vendor.saveServiceBtn'),
    fillAll: t('vendor.fillAllFields'),
    loading: t('bookings.loadingDetails'),
    noVendor: t('vendor.noVendorProfile'),
    errorTitle: t('common.error') || (isMr ? 'त्रुटी' : 'Error'),
  };

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const v = await api.getVendorByUserId(user.id);
        if (v) {
          setVendor(v);
          if (serviceId) {
            const match = (v.services || []).find((s: any) => s.id === serviceId);
            if (match) {
              setServiceNameMr(match.name_mr || '');
              setServiceNameEn(match.name_en || '');
              setPrice(String(match.price || ''));
              setDuration(String(match.duration_mins || ''));
              setDescMr(match.description_mr || '');
              setDescEn(match.description_en || '');
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user, serviceId]);

  const handleSave = async () => {
    if (
      !serviceNameMr.trim() ||
      !serviceNameEn.trim() ||
      !price.trim() ||
      !duration.trim() ||
      !vendor
    ) {
      Alert.alert(strings.errorTitle, strings.fillAll);
      return;
    }

    setSaving(true);
    try {
      const updated = await api.saveService(vendor.id, {
        id: serviceId || undefined,
        name_mr: serviceNameMr,
        name_en: serviceNameEn,
        price: Number(price),
        duration_mins: Number(duration),
        description_mr: descMr,
        description_en: descEn,
      });

      if (updated) {
        navigation.goBack();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E58A2B" />
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      {/* 1) Header Section - Left-aligned screen title, back chevron on left */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={12}
        >
          <ChevronLeft size={24} color="#2A2520" strokeWidth={2.2} />
        </Pressable>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {serviceId ? strings.editTitle : strings.addTitle}
        </Text>
      </View>
      <View style={styles.headerDivider} />

      {/* 2) Form Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <InputField
          label={strings.nameMrLabel}
          placeholder={strings.nameMrLabel}
          value={serviceNameMr}
          onChangeText={setServiceNameMr}
          containerStyle={styles.inputSpacing}
        />

        <InputField
          label={strings.nameEnLabel}
          placeholder={strings.nameEnLabel}
          value={serviceNameEn}
          onChangeText={setServiceNameEn}
          containerStyle={styles.inputSpacing}
        />

        <View style={styles.horizontalInputs}>
          <InputField
            label={strings.priceLabel}
            placeholder={strings.priceLabel}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            containerStyle={[styles.inputSpacing, styles.flexInput]}
          />

          <InputField
            label={strings.durationLabel}
            placeholder={strings.durationLabel}
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            containerStyle={[
              styles.inputSpacing,
              styles.flexInput,
              { marginLeft: 10 },
            ]}
          />
        </View>

        <InputField
          label={strings.descMrLabel}
          placeholder={strings.descMrLabel}
          value={descMr}
          onChangeText={setDescMr}
          multiline
          numberOfLines={3}
          style={styles.descInput}
          containerStyle={styles.inputSpacing}
        />

        <InputField
          label={strings.descEnLabel}
          placeholder={strings.descEnLabel}
          value={descEn}
          onChangeText={setDescEn}
          multiline
          numberOfLines={3}
          style={styles.descInput}
          containerStyle={styles.inputSpacing}
        />
      </ScrollView>

      {/* 3) Bottom Button - Transparent/screen background, space maintained from bottom */}
      <View style={styles.footer}>
        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={({ pressed }) => [
            styles.saveBtn,
            pressed && { opacity: 0.9 },
            saving && { opacity: 0.7 },
          ]}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>{strings.btnSave}</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
  },
  loadingText: {
    marginTop: 10,
    fontSize: moderateScale(14),
    fontFamily: 'Mukta-Medium',
    color: '#8A7C66',
  },
  header: {
    paddingHorizontal: horizontalScale(16),
    paddingTop: verticalScale(18),
    paddingBottom: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#EFE8DD',
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: moderateScale(18),
    fontWeight: '700',
    fontFamily: 'Mukta-Bold',
    color: '#2A2520',
    lineHeight: moderateScale(23),
    textAlign: 'left',
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(18),
    paddingTop: verticalScale(14),
    paddingBottom: verticalScale(20),
  },
  inputSpacing: {
    marginBottom: verticalScale(12),
  },
  horizontalInputs: {
    flexDirection: 'row',
  },
  flexInput: {
    flex: 1,
  },
  descInput: {
    height: verticalScale(60),
    textAlignVertical: 'top',
    paddingTop: verticalScale(8),
  },
  footer: {
    paddingHorizontal: horizontalScale(18),
    paddingTop: verticalScale(8),
    paddingBottom: verticalScale(16),
    backgroundColor: '#FAF7F2',
  },
  saveBtn: {
    width: '100%',
    height: 50,
    backgroundColor: '#2A2520',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Mukta-Bold',
    fontWeight: '700',
    fontSize: moderateScale(15),
  },
});

export default EditServiceScreen;
