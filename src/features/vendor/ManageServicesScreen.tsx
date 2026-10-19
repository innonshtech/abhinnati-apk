import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, ActivityIndicator, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { theme } from '../../constants/theme';
import { horizontalScale, verticalScale, moderateScale } from '../../hooks/useScale';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../api/client';
import { Vendor, Service } from '../../api/mockData';

const CustomSwitch = ({ value, onValueChange }: { value: boolean; onValueChange: () => void }) => (
  <Pressable
    onPress={onValueChange}
    style={{
      width: 38,
      height: 22,
      borderRadius: 11,
      backgroundColor: value ? '#2A2520' : '#E0CFB0',
      position: 'relative',
      justifyContent: 'center',
    }}
  >
    <View
      style={{
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#FFFFFF',
        position: 'absolute',
        left: value ? 18 : 2,
        top: 2,
      }}
    />
  </Pressable>
);

export const ManageServicesScreen: React.FC = () => {
  const { t } = useTranslation();
  const { user, preferredLanguage } = useAuthStore();
  const navigation = useNavigation<any>();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [pausedServices, setPausedServices] = useState<string[]>([]);

  const isMr = preferredLanguage === 'mr';

  const strings = {
    title: t('tabs.vendorServices'),
    available: t('vendor.available'),
    paused: t('vendor.paused'),
    addService: t('vendor.addServiceBtn'),
    noVendor: t('vendor.noVendorProfile'),
  };

  const loadVendorProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const v = await api.getVendorByUserId(user.id);
      if (v) {
        setVendor({
          ...v,
          services: Array.isArray(v.services) ? v.services : [],
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadVendorProfile();
    }, [user])
  );

  const toggleServiceAvailability = (serviceId: string) => {
    setPausedServices((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const handleOpenAddModal = () => {
    navigation.navigate('EditService', {});
  };

  const handleOpenEditModal = (service: Service) => {
    navigation.navigate('EditService', { serviceId: service.id });
  };

  const getServicePriceLabel = (item: Service) => {
    return `₹${item.price}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E58A2B" />
      </SafeAreaView>
    );
  }

  if (!vendor) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.noVendorText}>{strings.noVendor}</Text>
      </SafeAreaView>
    );
  }

  const services = Array.isArray(vendor.services) ? vendor.services : [];

  const businessName =
    (isMr
      ? vendor.businessNameMr ||
        vendor.businessNameEn ||
        (vendor as any)?.business?.nameMr ||
        (vendor as any)?.business?.nameEn ||
        user?.name
      : vendor.businessNameEn ||
        vendor.businessNameMr ||
        (vendor as any)?.business?.nameEn ||
        (vendor as any)?.business?.nameMr ||
        user?.name) || '';

  const avatarInitial = (businessName || user?.name || '').charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Clean top in-flow Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{strings.title}</Text>
      </View>
      <View style={styles.headerDivider} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Vendor Header Row */}
        <View style={styles.vendorHeaderRow}>
          {vendor.logoUrl ? (
            <Image source={{ uri: vendor.logoUrl }} style={styles.vendorLogo} />
          ) : (
            <View style={styles.vendorLogo}>
              <Text style={styles.vendorLogoLetter}>{avatarInitial}</Text>
            </View>
          )}

          <View style={styles.vendorInfo}>
            <View style={styles.vendorTitleRow}>
              <Text style={styles.vendorName} numberOfLines={1}>
                {businessName}
              </Text>
              <View style={styles.verifiedBadge}>
                <Svg width={7} height={5} viewBox="0 0 7 5">
                  <Path
                    d="M1 2.5l2 2 3-3.5"
                    stroke="#FFFFFF"
                    strokeWidth={1.5}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
            </View>
            <Text style={styles.servicesCount}>
              {t('vendor.servicesCount', { count: services.length })}
            </Text>
          </View>
        </View>

        {/* Services List */}
        {services.map((item) => {
          const isAvailable = !pausedServices.includes(item.id);
          const serviceName = isMr ? (item.name_mr || item.name_en) : (item.name_en || item.name_mr);
          return (
            <View key={item.id} style={styles.serviceCard}>
              <View style={styles.serviceMainRow}>
                <View style={styles.serviceDetails}>
                  <Text style={styles.serviceNameText}>{serviceName}</Text>
                  <Text style={styles.servicePrice}>
                    {getServicePriceLabel(item)}
                  </Text>
                </View>

                {/* Edit Icon SVG */}
                <Pressable onPress={() => handleOpenEditModal(item)} style={styles.editBtn} hitSlop={10}>
                  <Svg width={12} height={12} viewBox="0 0 12 12">
                    <Path
                      d="M7.5 1.5l3 3L3.5 11H.5V8l7-7z"
                      stroke="#8A7C66"
                      strokeWidth={1.5}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </Pressable>
              </View>

              {/* Toggle Footer */}
              <View style={styles.toggleRow}>
                <CustomSwitch
                  value={isAvailable}
                  onValueChange={() => toggleServiceAvailability(item.id)}
                />
                <Text style={[styles.toggleText, !isAvailable && styles.toggleTextPaused]}>
                  {isAvailable ? strings.available : strings.paused}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Dashed Add a service button */}
        <Pressable onPress={handleOpenAddModal} style={styles.addServiceBtn}>
          <Text style={styles.addServiceBtnText}>{strings.addService}</Text>
        </Pressable>

        <View style={styles.spacingBottom} />
      </ScrollView>
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
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noVendorText: {
    fontSize: moderateScale(15),
    fontFamily: 'Mukta-Medium',
    color: '#8A7C66',
  },
  header: {
    paddingHorizontal: horizontalScale(18),
    paddingTop: verticalScale(18),
    paddingBottom: verticalScale(12),
    backgroundColor: '#FAF7F2',
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontFamily: 'Mukta-Bold',
    fontWeight: '700',
    color: '#2A2520',
    lineHeight: moderateScale(23),
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#EFE8DD',
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(18),
    paddingTop: verticalScale(14),
    paddingBottom: verticalScale(90),
  },
  vendorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  vendorLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFD3AE',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vendorLogoLetter: {
    fontFamily: 'Mukta-Bold',
    fontSize: 18,
    color: '#9A5A12',
    fontWeight: '700',
  },
  vendorInfo: {
    justifyContent: 'center',
    flex: 1,
  },
  vendorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vendorName: {
    fontSize: moderateScale(16),
    fontFamily: 'Mukta-Bold',
    fontWeight: '700',
    color: '#2A2520',
  },
  verifiedBadge: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#E58A2B',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  servicesCount: {
    fontSize: moderateScale(13),
    fontFamily: 'Mukta-Regular',
    color: '#6B5F4E',
    marginTop: 1,
  },
  serviceCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE8DD',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  serviceMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  serviceDetails: {
    flex: 1,
    paddingRight: 10,
  },
  serviceNameText: {
    fontSize: moderateScale(15),
    fontFamily: 'Mukta-Bold',
    fontWeight: '700',
    color: '#2A2520',
  },
  servicePrice: {
    fontSize: moderateScale(13),
    fontFamily: 'Mukta-Regular',
    color: '#8A7C66',
    marginTop: 2,
  },
  editBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  toggleText: {
    fontSize: moderateScale(12.5),
    fontFamily: 'Mukta-Medium',
    fontWeight: '500',
    color: '#2A2520',
  },
  toggleTextPaused: {
    color: '#A89A82',
  },
  addServiceBtn: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    borderWidth: 1.4,
    borderStyle: 'dashed',
    borderColor: '#C9A877',
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  addServiceBtnText: {
    fontSize: moderateScale(14.5),
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    color: '#9A5A12',
  },
  spacingBottom: {
    height: 30,
  },
});

export default ManageServicesScreen;
