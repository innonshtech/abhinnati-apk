import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, TextInput, ActivityIndicator, Image, Alert, FlatList, Animated, Modal } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Search, Navigation as GpsIcon, Trash2, Star, Plus, Camera, Image as ImageIcon, ChevronRight, X, CheckCircle2, ShieldCheck } from 'lucide-react-native';

import { api } from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';
import { theme } from '../../constants/theme';
import { RootStackParamList } from '../../navigation/types';
import { UploadBottomSheet } from '../../components/vendor/UploadBottomSheet';
import { KYCFile } from '../../services/fileUploadService';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const VendorFirstTimeSetupScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const { user, preferredLanguage, fetchVendorProfile, vendorProfile } = useAuthStore();
  const isMr = preferredLanguage === 'mr';

  const editMode = route.params?.editMode || false;
  const initialStep = route.params?.initialStep !== undefined ? route.params.initialStep : 0;

  const [step, setStep] = useState<number>(initialStep);
  const [loading, setLoading] = useState(false);

  // Business Info form states (Step 0 in editMode)
  const [bizNameEn, setBizNameEn] = useState(vendorProfile?.businessNameEn || '');
  const [bizNameMr, setBizNameMr] = useState(vendorProfile?.businessNameMr || '');
  const [bizDescEn, setBizDescEn] = useState(vendorProfile?.descriptionEn || '');
  const [bizDescMr, setBizDescMr] = useState(vendorProfile?.descriptionMr || '');
  const [categorySlug, setCategorySlug] = useState(vendorProfile?.categorySlug || 'food');
  const [categoryNameEn, setCategoryNameEn] = useState(vendorProfile?.categoryNameEn || 'Bakery');
  const [categoryNameMr, setCategoryNameMr] = useState(vendorProfile?.categoryNameMr || 'बेकरी');
  const [whatsappNumber, setWhatsappNumber] = useState(vendorProfile?.whatsappNumber || '');
  const [email, setEmail] = useState(vendorProfile?.email || '');
  const [showCatModal, setShowCatModal] = useState(false);

  // Animation values
  const checkScale = useRef(new Animated.Value(0)).current;

  // Step 1: Location State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [location, setLocation] = useState({
    latitude: 19.0605,
    longitude: 72.8290,
    formattedAddress: 'Hill Road, Bandra West, Mumbai, Maharashtra 400050',
    area: 'Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
  });
  const [pinOffset, setPinOffset] = useState({ x: 0, y: 0 }); // Mock drag state
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Step 2: Cover Photo State
  const [coverPhoto, setCoverPhoto] = useState<KYCFile | null>(null);

  // Step 3: Logo State
  const [logo, setLogo] = useState<KYCFile | null>(null);

  // Step 4: Gallery State
  const [gallery, setGallery] = useState<KYCFile[]>([]);
  const [coverIndex, setCoverIndex] = useState<number>(0);
  
  // Previous Orders media states
  const [prevOrdersPhotos, setPrevOrdersPhotos] = useState<KYCFile[]>([]);
  const [prevOrdersVideos, setPrevOrdersVideos] = useState<KYCFile[]>([]);

  // Step 5: Services State
  const [services, setServices] = useState<any[]>([]);
  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: '',
    duration: '30',
    category: 'Bakery',
    image: null as KYCFile | null,
  });

  // Bottom sheet upload trigger
  const [uploadSheetVisible, setUploadSheetVisible] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<'cover' | 'logo' | 'gallery' | 'service' | 'prevOrdersPhoto' | 'prevOrdersVideo'>('cover');

  // Trigger anim on mount
  useEffect(() => {
    if (step === 0) {
      Animated.spring(checkScale, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }
  }, [step]);

  // Load existing data of the vendor profile
  useEffect(() => {
    if (vendorProfile) {
      setBizNameEn(vendorProfile.businessNameEn || '');
      setBizNameMr(vendorProfile.businessNameMr || '');
      setBizDescEn(vendorProfile.descriptionEn || '');
      setBizDescMr(vendorProfile.descriptionMr || '');
      setCategorySlug(vendorProfile.categorySlug || 'food');
      setCategoryNameEn(vendorProfile.categoryNameEn || 'Bakery');
      setCategoryNameMr(vendorProfile.categoryNameMr || 'बेकरी');
      setWhatsappNumber(vendorProfile.whatsappNumber || '');
      setEmail(vendorProfile.email || '');

      if (vendorProfile.services) {
        setServices(vendorProfile.services);
      }

      if (vendorProfile.latitude && vendorProfile.longitude) {
        setLocation({
          latitude: vendorProfile.latitude,
          longitude: vendorProfile.longitude,
          formattedAddress: vendorProfile.formattedAddress || '',
          area: vendorProfile.area?.name || 'Bandra West',
          city: vendorProfile.city || 'Mumbai',
          state: vendorProfile.state || 'Maharashtra',
          pincode: vendorProfile.pincode || '',
        });
      }

      if (vendorProfile.coverPhotoUrl) {
        setCoverPhoto({
          documentType: 'cover',
          fileName: 'cover.jpg',
          fileSize: 0,
          mimeType: 'image/jpeg',
          previewUri: vendorProfile.coverPhotoUrl,
          uploadStatus: 'uploaded',
          uploadProgress: 100,
        });
      }

      if (vendorProfile.logoUrl) {
        setLogo({
          documentType: 'logo',
          fileName: 'logo.jpg',
          fileSize: 0,
          mimeType: 'image/jpeg',
          previewUri: vendorProfile.logoUrl,
          uploadStatus: 'uploaded',
          uploadProgress: 100,
        });
      }

      if (vendorProfile.galleryUrls) {
        try {
          const list = JSON.parse(vendorProfile.galleryUrls);
          if (Array.isArray(list)) {
            setGallery(list.map((url: string, idx: number) => ({
              documentType: 'gallery',
              fileName: `gallery_${idx}.jpg`,
              fileSize: 0,
              mimeType: 'image/jpeg',
              previewUri: url,
              uploadStatus: 'uploaded',
              uploadProgress: 100,
            })));
          }
        } catch {}
      }

      if (vendorProfile.prevOrdersPhotosUrls) {
        try {
          const list = JSON.parse(vendorProfile.prevOrdersPhotosUrls);
          if (Array.isArray(list)) {
            setPrevOrdersPhotos(list.map((url: string, idx: number) => ({
              documentType: 'prevOrdersPhoto',
              fileName: `photo_${idx}.jpg`,
              fileSize: 0,
              mimeType: 'image/jpeg',
              previewUri: url,
              uploadStatus: 'uploaded',
              uploadProgress: 100,
            })));
          }
        } catch {}
      }

      if (vendorProfile.prevOrdersVideosUrls) {
        try {
          const list = JSON.parse(vendorProfile.prevOrdersVideosUrls);
          if (Array.isArray(list)) {
            setPrevOrdersVideos(list.map((url: string, idx: number) => ({
              documentType: 'prevOrdersVideo',
              fileName: `video_${idx}.mp4`,
              fileSize: 0,
              mimeType: 'video/mp4',
              previewUri: url,
              uploadStatus: 'uploaded',
              uploadProgress: 100,
            })));
          }
        } catch {}
      }
    }
  }, [vendorProfile]);

  // Handle Mock Location Autocomplete lookup
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text) {
      setSuggestions([]);
      return;
    }
    // Simulate address lookups
    const sampleSuggestions = [
      { name: "Hill Road, Bandra West", landmark: "Near Elco", pincode: "400050", lat: 19.0605, lon: 72.8290 },
      { name: "Linking Road, Bandra West", landmark: "Opp National College", pincode: "400050", lat: 19.0620, lon: 72.8340 },
      { name: "Pali Hill, Bandra West", landmark: "Near Nargis Dutt Road", pincode: "400050", lat: 19.0670, lon: 72.8260 },
      { name: "Carter Road, Bandra West", landmark: "Near Cafe Coffee Day", pincode: "400052", lat: 19.0720, lon: 72.8210 }
    ];
    setSuggestions(sampleSuggestions.filter(item => item.name.toLowerCase().includes(text.toLowerCase()) || item.pincode.includes(text)));
  };

  const selectSuggestion = (item: any) => {
    setLocation({
      latitude: item.lat,
      longitude: item.lon,
      formattedAddress: `${item.name}, Mumbai, Maharashtra ${item.pincode}`,
      area: 'Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: item.pincode,
    });
    setSearchQuery(item.name);
    setSuggestions([]);
  };

  const useCurrentLocation = () => {
    setLocation({
      latitude: 19.0605,
      longitude: 72.8290,
      formattedAddress: 'Hill Road, Bandra West, Mumbai, Maharashtra 400050',
      area: 'Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
    });
    Alert.alert('GPS Location Resolved', 'Location set to Bandra West using device GPS coordinates.');
  };

  const simulateMapTap = () => {
    // Tapping on map generates offset and small lat/lon change
    const deltaLat = (Math.random() - 0.5) * 0.005;
    const deltaLon = (Math.random() - 0.5) * 0.005;
    setLocation(prev => ({
      ...prev,
      latitude: Number((prev.latitude + deltaLat).toFixed(6)),
      longitude: Number((prev.longitude + deltaLon).toFixed(6)),
      formattedAddress: 'Hill Road, Bandra West, Mumbai, Maharashtra 400050',
    }));
  };

  // Image Upload helper
  const triggerImagePick = (target: 'cover' | 'logo' | 'gallery' | 'service' | 'prevOrdersPhoto' | 'prevOrdersVideo') => {
    setUploadTarget(target);
    setUploadSheetVisible(true);
  };

  const handleFileSelected = (file: KYCFile) => {
    const uploadedFile = {
      ...file,
      uploadStatus: 'uploaded' as const,
      uploadProgress: 100,
      uploadedAt: new Date().toISOString(),
    };

    if (uploadTarget === 'cover') {
      setCoverPhoto(uploadedFile);
    } else if (uploadTarget === 'logo') {
      setLogo(uploadedFile);
    } else if (uploadTarget === 'gallery') {
      setGallery(prev => [...prev, uploadedFile]);
    } else if (uploadTarget === 'service') {
      setNewService(prev => ({ ...prev, image: uploadedFile }));
    } else if (uploadTarget === 'prevOrdersPhoto') {
      setPrevOrdersPhotos(prev => [...prev, uploadedFile]);
    } else if (uploadTarget === 'prevOrdersVideo') {
      setPrevOrdersVideos(prev => [...prev, uploadedFile]);
    }
  };

  // Gallery Management
  const removeGalleryPhoto = (index: number) => {
    setGallery(prev => prev.filter((_, i) => i !== index));
    if (coverIndex === index) {
      setCoverIndex(0);
    } else if (coverIndex > index) {
      setCoverIndex(prev => prev - 1);
    }
  };

  const makeCover = (index: number) => {
    setCoverIndex(index);
  };

  // Services Management
  const saveService = async () => {
    if (!newService.name.trim()) {
      Alert.alert('Validation Error', 'Service name is required.');
      return;
    }
    if (!newService.price.trim() || isNaN(Number(newService.price))) {
      Alert.alert('Validation Error', 'Please enter a valid price.');
      return;
    }

    setLoading(true);
    try {
      // Direct integration to API to add service to DB
      await api.saveService(vendorProfile.id, {
        nameMr: newService.name,
        nameEn: newService.name,
        price: parseFloat(newService.price),
        durationMins: parseInt(newService.duration, 10),
        descriptionMr: newService.description,
        descriptionEn: newService.description,
      });

      await fetchVendorProfile(); // Reload
      setShowAddService(false);
      setNewService({ name: '', description: '', price: '', duration: '30', category: 'Bakery', image: null });
    } catch (e) {
      Alert.alert('Error', 'Failed to add service.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBusinessInfo = async () => {
    if (!bizNameEn.trim()) {
      Alert.alert('Validation Error', 'Business Name is required.');
      return;
    }
    setLoading(true);
    try {
      await api.updateVendorFirstTimeSetup({
        businessNameEn: bizNameEn.trim(),
        businessNameMr: bizNameMr.trim() || bizNameEn.trim(),
        descriptionEn: bizDescEn.trim(),
        descriptionMr: bizDescMr.trim() || bizDescEn.trim(),
        categorySlug,
        categoryNameEn,
        categoryNameMr,
        whatsappNumber: whatsappNumber.trim(),
        email: email.trim(),
      });
      await fetchVendorProfile();
      Alert.alert(isMr ? 'यशस्वी' : 'Success', isMr ? 'माहिती जतन केली!' : 'Business details updated.');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to update business details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLocation = async () => {
    setLoading(true);
    try {
      await api.updateVendorFirstTimeSetup({
        latitude: location.latitude,
        longitude: location.longitude,
        formattedAddress: location.formattedAddress,
        area: location.area,
        city: location.city,
        state: location.state,
        pincode: location.pincode,
      });
      await fetchVendorProfile();
      Alert.alert(isMr ? 'यशस्वी' : 'Success', isMr ? 'पत्ता जतन केला!' : 'Location updated.');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to update location.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCoverPhoto = async () => {
    setLoading(true);
    try {
      await api.updateVendorFirstTimeSetup({
        coverPhoto: coverPhoto && coverPhoto.fileData ? { fileData: coverPhoto.fileData, mimeType: coverPhoto.mimeType } : undefined,
        coverPhotoUrl: !coverPhoto ? null : undefined,
      });
      await fetchVendorProfile();
      Alert.alert(isMr ? 'यशस्वी' : 'Success', isMr ? 'कव्हर फोटो जतन केला!' : 'Cover photo updated.');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to update cover photo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLogo = async () => {
    setLoading(true);
    try {
      await api.updateVendorFirstTimeSetup({
        logo: logo && logo.fileData ? { fileData: logo.fileData, mimeType: logo.mimeType } : undefined,
        logoUrl: !logo ? null : undefined,
      });
      await fetchVendorProfile();
      Alert.alert(isMr ? 'यशस्वी' : 'Success', isMr ? 'लोगो जतन केला!' : 'Logo updated.');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to update logo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGallery = async () => {
    setLoading(true);
    try {
      const galleryPayload = gallery.map(item => {
        if (!item.fileData) {
          return item.previewUri;
        } else {
          return { fileData: item.fileData, mimeType: item.mimeType };
        }
      });

      const photosPayload = prevOrdersPhotos.map(item => {
        if (!item.fileData) {
          return item.previewUri;
        } else {
          return { fileData: item.fileData, mimeType: item.mimeType };
        }
      });

      const videosPayload = prevOrdersVideos.map(item => {
        if (!item.fileData) {
          return item.previewUri;
        } else {
          return { fileData: item.fileData, mimeType: item.mimeType };
        }
      });

      await api.updateVendorFirstTimeSetup({
        gallery: galleryPayload,
        prevOrdersPhotos: photosPayload,
        prevOrdersVideos: videosPayload,
      });
      await fetchVendorProfile();
      Alert.alert(isMr ? 'यशस्वी' : 'Success', isMr ? 'गॅलरी जतन केली!' : 'Gallery photos and media updated.');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to update gallery.');
    } finally {
      setLoading(false);
    }
  };

  // Complete Wizards Setup Flow
  const handleCompleteSetup = async () => {
    setLoading(true);
    try {
      const payload = {
        latitude: location.latitude,
        longitude: location.longitude,
        formattedAddress: location.formattedAddress,
        area: location.area,
        city: location.city,
        state: location.state,
        pincode: location.pincode,
        coverPhoto: coverPhoto ? { fileData: coverPhoto.fileData, mimeType: coverPhoto.mimeType } : undefined,
        logo: logo ? { fileData: logo.fileData, mimeType: logo.mimeType } : undefined,
        gallery: gallery.map(f => ({ fileData: f.fileData, mimeType: f.mimeType })),
      };

      await api.updateVendorFirstTimeSetup(payload);
      await fetchVendorProfile();
      navigation.reset({
        index: 0,
        routes: [{ name: 'VendorMain' }],
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to complete configuration. Proceeding directly.');
      await handleSkipSetup();
    } finally {
      setLoading(false);
    }
  };

  const handleSkipSetup = async () => {
    setLoading(true);
    try {
      await api.skipVendorFirstTimeSetup();
      await fetchVendorProfile();
      navigation.reset({
        index: 0,
        routes: [{ name: 'VendorMain' }],
      });
    } catch {
      Alert.alert('Error', 'Failed to skip setup.');
      navigation.reset({
        index: 0,
        routes: [{ name: 'VendorMain' }],
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculations for setup step progress
  const getProgressInfo = () => {
    let completed = 2; // Business Info, Aadhaar verification are always checked (pre-completed)
    if (location.formattedAddress) completed++;
    if (coverPhoto) completed++;
    if (logo) completed++;
    if (gallery.length > 0) completed++;
    if (services.length > 0) completed++;

    return { completed, total: 7 };
  };

  const { completed } = getProgressInfo();

  // Render Sub-steps
  const renderContent = () => {
    switch (step) {
      case 0:
        if (editMode) {
          // Render Business Information edit form
          return (
            <ScrollView style={styles.scroll}>
              <View style={styles.wizardHeader}>
                <Text style={styles.wizardTitle}>🏪 {isMr ? 'व्यवसाय माहिती' : 'Business Information'}</Text>
                <Text style={styles.wizardSubtitle}>
                  {isMr ? 'तुमच्या दुकानाचे नाव, श्रेणी, वर्णन आणि संपर्क तपशील सुधारा.' : 'Edit your store name, category slug, description, and contact info.'}
                </Text>
              </View>

              <Text style={styles.inputLabel}>{isMr ? 'व्यवसायाचे नाव (इंग्रजी)' : 'Business Name (English)'}</Text>
              <TextInput
                value={bizNameEn}
                onChangeText={setBizNameEn}
                placeholder="e.g. Aai's Bakery"
                placeholderTextColor="#A89A82"
                style={styles.formInput}
              />

              <Text style={styles.inputLabel}>{isMr ? 'व्यवसायाचे नाव (मराठी)' : 'Business Name (Marathi)'}</Text>
              <TextInput
                value={bizNameMr}
                onChangeText={setBizNameMr}
                placeholder="उदा. आईज् बेकरी"
                placeholderTextColor="#A89A82"
                style={styles.formInput}
              />

              <Text style={styles.inputLabel}>{isMr ? 'श्रेणी' : 'Category'}</Text>
              <Pressable onPress={() => setShowCatModal(true)} style={styles.categorySelectBox}>
                <Text style={styles.categorySelectText}>{isMr ? categoryNameMr : categoryNameEn}</Text>
                <ChevronRight size={18} color="#8A7C66" />
              </Pressable>

              <Text style={styles.inputLabel}>{isMr ? 'व्यवसाय वर्णन (इंग्रजी)' : 'Business Description (English)'}</Text>
              <TextInput
                value={bizDescEn}
                onChangeText={setBizDescEn}
                placeholder="Explain what your store specializes in..."
                placeholderTextColor="#A89A82"
                multiline
                style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
              />

              <Text style={styles.inputLabel}>{isMr ? 'व्यवसाय वर्णन (मराठी)' : 'Business Description (Marathi)'}</Text>
              <TextInput
                value={bizDescMr}
                onChangeText={setBizDescMr}
                placeholder="तुमच्या दुकानाबद्दल मराठीत माहिती लिहा..."
                placeholderTextColor="#A89A82"
                multiline
                style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
              />

              <Text style={styles.inputLabel}>{isMr ? 'संपर्क क्रमांक' : 'Contact Number (Phone)'}</Text>
              <TextInput
                value={user?.phone || ''}
                editable={false}
                style={[styles.formInput, { backgroundColor: '#F0EAD6', color: '#6B5F4E' }]}
              />

              <Text style={styles.inputLabel}>{isMr ? 'व्हॉट्सॲप क्रमांक (पर्यायी)' : 'WhatsApp Number (optional)'}</Text>
              <TextInput
                value={whatsappNumber}
                onChangeText={setWhatsappNumber}
                placeholder="e.g. +91 98765 43210"
                keyboardType="phone-pad"
                placeholderTextColor="#A89A82"
                style={styles.formInput}
              />

              <Text style={styles.inputLabel}>{isMr ? 'ईमेल पत्ता (पर्यायी)' : 'Email Address (optional)'}</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="e.g. contact@aai.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#A89A82"
                style={styles.formInput}
              />

              {/* Form buttons */}
              <View style={[styles.stepButtonRow, { marginTop: 24, marginBottom: 40 }]}>
                <Pressable onPress={() => navigation.goBack()} style={styles.outlineBackBtn}>
                  <Text style={styles.outlineBackBtnText}>{isMr ? 'रद्द करा' : 'Cancel'}</Text>
                </Pressable>
                <Pressable onPress={handleSaveBusinessInfo} disabled={loading} style={styles.primaryBtnHalf}>
                  {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryBtnText}>{isMr ? 'जतन करा' : 'Save Changes'}</Text>}
                </Pressable>
              </View>

              {/* Category Selection Modal */}
              <Modal visible={showCatModal} transparent animationType="slide">
                <View style={styles.modalBackdrop}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{isMr ? 'श्रेणी निवडा' : 'Select Category'}</Text>
                    <FlatList
                      data={[
                        { labelEn: 'Bakery', labelMr: 'बेकरी', slug: 'food' },
                        { labelEn: 'Home Cooked Tiffin', labelMr: 'घरगुती डबा', slug: 'food' },
                        { labelEn: 'Plumbing & Masonry', labelMr: 'प्लंबिंग काम', slug: 'plumbing' },
                        { labelEn: 'Electrical Works', labelMr: 'इलेक्ट्रिकल काम', slug: 'electric' },
                        { labelEn: 'Home Cleaning', labelMr: 'घर साफसफाई', slug: 'cleaning' },
                        { labelEn: 'Legal Advice', labelMr: 'कायदेशीर सल्ला', slug: 'legal' }
                      ]}
                      keyExtractor={item => item.slug + item.labelEn}
                      renderItem={({ item }) => (
                        <Pressable 
                          onPress={() => {
                            setCategorySlug(item.slug);
                            setCategoryNameEn(item.labelEn);
                            setCategoryNameMr(item.labelMr);
                            setShowCatModal(false);
                          }}
                          style={styles.modalRow}
                        >
                          <Text style={styles.modalRowText}>{isMr ? item.labelMr : item.labelEn}</Text>
                        </Pressable>
                      )}
                    />
                    <Pressable onPress={() => setShowCatModal(false)} style={styles.modalCloseBtn}>
                      <Text style={styles.modalCloseBtnText}>{isMr ? 'बंद करा' : 'Close'}</Text>
                    </Pressable>
                  </View>
                </View>
              </Modal>
            </ScrollView>
          );
        }

        return (
          <ScrollView style={styles.scroll} contentContainerStyle={styles.centerContent}>
            {/* Animated checkmark illustration */}
            <Animated.View style={[styles.badgeCircle, { transform: [{ scale: checkScale }] }]}>
              <CheckCircle2 size={70} color="#2E7D52" />
            </Animated.View>

            <Text style={styles.liveTitle}>🎉 Your business is now live!</Text>
            <Text style={styles.liveSubtitle}>
              Customers in your area can now discover and book your business.
            </Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardTitle}>
                ✨ You're now visible in {vendorProfile?.area?.name || 'Bandra West'}.
              </Text>
              <Text style={styles.summaryBulletHeader}>Residents can now:</Text>
              <Text style={styles.summaryBullet}>• Discover your business</Text>
              <Text style={styles.summaryBullet}>• View your services</Text>
              <Text style={styles.summaryBullet}>• Contact you</Text>
              <Text style={styles.summaryBullet}>• Book your services</Text>
            </View>

            <Text style={styles.checklistPrompt}>
              Complete your business profile to receive more bookings.
            </Text>

            {/* Checklist */}
            <View style={styles.checklistContainer}>
              <Text style={styles.checklistHeader}>Business Profile Progress</Text>
              
              <View style={styles.checkRow}>
                <Text style={styles.checkSymbol}>✓</Text>
                <Text style={styles.checkTextActive}>Business Information</Text>
              </View>
              
              <View style={styles.checkRow}>
                <Text style={styles.checkSymbol}>✓</Text>
                <Text style={styles.checkTextActive}>Aadhaar Verification</Text>
              </View>

              <View style={styles.checkRow}>
                <Text style={styles.checkSymbolUnchecked}>○</Text>
                <Text style={location.formattedAddress ? styles.checkTextActive : styles.checkText}>Business Location</Text>
              </View>

              <View style={styles.checkRow}>
                <Text style={styles.checkSymbolUnchecked}>○</Text>
                <Text style={coverPhoto ? styles.checkTextActive : styles.checkText}>Cover Photo</Text>
              </View>

              <View style={styles.checkRow}>
                <Text style={styles.checkSymbolUnchecked}>○</Text>
                <Text style={logo ? styles.checkTextActive : styles.checkText}>Business Logo</Text>
              </View>

              <View style={styles.checkRow}>
                <Text style={styles.checkSymbolUnchecked}>○</Text>
                <Text style={gallery.length > 0 ? styles.checkTextActive : styles.checkText}>Gallery Photos</Text>
              </View>

              <View style={styles.checkRow}>
                <Text style={styles.checkSymbolUnchecked}>○</Text>
                <Text style={services.length > 0 ? styles.checkTextActive : styles.checkText}>Services</Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={styles.progressTracker}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${(completed / 7) * 100}%` }]} />
              </View>
              <Text style={styles.progressText}>{completed} / 7 Completed</Text>
            </View>

            {/* Action buttons */}
            <Pressable onPress={() => setStep(1)} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Continue Setup</Text>
            </Pressable>

            <Pressable onPress={handleSkipSetup} style={styles.secondaryBtn}>
              {loading ? <ActivityIndicator color="#6B5F4E" /> : <Text style={styles.secondaryBtnText}>Go to Vendor Dashboard</Text>}
            </Pressable>
          </ScrollView>
        );

      case 1:
        // Location Setup Screen
        return (
          <ScrollView style={styles.scroll}>
            <View style={styles.wizardHeader}>
              <Text style={styles.wizardStepIndicator}>Step 1 of 5</Text>
              <Text style={styles.wizardTitle}>Business Location</Text>
              <Text style={styles.wizardSubtitle}>Set the exact address where residents can find you.</Text>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Search size={20} color="#8A7C66" style={{ marginRight: 8 }} />
                <TextInput
                  value={searchQuery}
                  onChangeText={handleSearch}
                  placeholder="Search address, landmark, shop, pincode..."
                  placeholderTextColor="#A89A82"
                  style={styles.searchInput}
                />
              </View>
              {suggestions.length > 0 && (
                <View style={styles.suggestionsList}>
                  {suggestions.map((item, idx) => (
                    <Pressable key={idx} onPress={() => selectSuggestion(item)} style={styles.suggestionRow}>
                      <MapPin size={16} color="#E58A2B" style={{ marginRight: 8 }} />
                      <View>
                        <Text style={styles.suggestionTextName}>{item.name}</Text>
                        <Text style={styles.suggestionTextSub}>{item.landmark} · {item.pincode}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* GPS Locator button */}
            <Pressable onPress={useCurrentLocation} style={styles.gpsButton}>
              <GpsIcon size={18} color="#E58A2B" style={{ marginRight: 8 }} />
              <Text style={styles.gpsButtonText}>Use Current Location</Text>
            </Pressable>

            {/* Interactive map illustration mockup */}
            <Pressable onPress={simulateMapTap} style={styles.mockMapContainer}>
              <Svg width="100%" height="220" viewBox="0 0 350 220" style={styles.mapSvg}>
                <Rect x="0" y="0" width="350" height="220" fill="#EFE6D4" />
                {/* Simulated Grid Streets */}
                <Path d="M 0,50 L 350,50 M 0,110 L 350,110 M 0,170 L 350,170 M 80,0 L 80,220 M 180,0 L 180,220 M 270,0 L 270,220" stroke="#FFFFFF" strokeWidth="8" />
                <Circle cx="180" cy="110" r="14" fill="rgba(229, 138, 43, 0.2)" />
                <Circle cx="180" cy="110" r="6" fill="#E58A2B" />
              </Svg>
              <View style={styles.mapOverlayTip}>
                <Text style={styles.mapOverlayTipText}>Drag pin or tap on map to adjust location</Text>
              </View>
            </Pressable>

            {/* Address Details Output fields */}
            <View style={styles.addressOutputBox}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={styles.outputLabel}>Selected Address:</Text>
                <Pressable onPress={() => setIsEditingAddress(!isEditingAddress)}>
                  <Text style={{ fontSize: 12, color: '#E58A2B', fontWeight: '700' }}>
                    {isEditingAddress ? 'Done' : 'Edit'}
                  </Text>
                </Pressable>
              </View>
              
              {isEditingAddress ? (
                <View>
                  <TextInput
                    value={location.formattedAddress}
                    onChangeText={(text) => setLocation(prev => ({ ...prev, formattedAddress: text }))}
                    multiline
                    style={styles.editableAddressInput}
                    placeholder="Full Address"
                    placeholderTextColor="#A89A82"
                  />
                  <View style={{ flexDirection: 'row', marginTop: 8 }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.outputLabel}>Pincode</Text>
                      <TextInput
                        value={location.pincode}
                        onChangeText={(text) => setLocation(prev => ({ ...prev, pincode: text }))}
                        style={styles.editableMiniInput}
                        placeholder="Pincode"
                        placeholderTextColor="#A89A82"
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.outputLabel}>Area</Text>
                      <TextInput
                        value={location.area}
                        onChangeText={(text) => setLocation(prev => ({ ...prev, area: text }))}
                        style={styles.editableMiniInput}
                        placeholder="Area"
                        placeholderTextColor="#A89A82"
                      />
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', marginTop: 8 }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.outputLabel}>City</Text>
                      <TextInput
                        value={location.city}
                        onChangeText={(text) => setLocation(prev => ({ ...prev, city: text }))}
                        style={styles.editableMiniInput}
                        placeholder="City"
                        placeholderTextColor="#A89A82"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.outputLabel}>State</Text>
                      <TextInput
                        value={location.state}
                        onChangeText={(text) => setLocation(prev => ({ ...prev, state: text }))}
                        style={styles.editableMiniInput}
                        placeholder="State"
                        placeholderTextColor="#A89A82"
                      />
                    </View>
                  </View>
                </View>
              ) : (
                <Text style={styles.outputVal}>{location.formattedAddress}</Text>
              )}

              <View style={[styles.row, { marginTop: 10 }]}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.outputLabel}>Latitude:</Text>
                  {isEditingAddress ? (
                    <TextInput
                      value={String(location.latitude)}
                      onChangeText={(text) => setLocation(prev => ({ ...prev, latitude: parseFloat(text) || 0 }))}
                      style={styles.editableMiniInput}
                      keyboardType="numeric"
                    />
                  ) : (
                    <Text style={styles.outputValMini}>{location.latitude}</Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.outputLabel}>Longitude:</Text>
                  {isEditingAddress ? (
                    <TextInput
                      value={String(location.longitude)}
                      onChangeText={(text) => setLocation(prev => ({ ...prev, longitude: parseFloat(text) || 0 }))}
                      style={styles.editableMiniInput}
                      keyboardType="numeric"
                    />
                  ) : (
                    <Text style={styles.outputValMini}>{location.longitude}</Text>
                  )}
                </View>
              </View>
            </View>

            {editMode ? (
              <View style={[styles.stepButtonRow, { marginTop: 24, marginBottom: 40 }]}>
                <Pressable onPress={() => navigation.goBack()} style={styles.outlineBackBtn}>
                  <Text style={styles.outlineBackBtnText}>{isMr ? 'रद्द करा' : 'Cancel'}</Text>
                </Pressable>
                <Pressable onPress={handleSaveLocation} disabled={loading} style={styles.primaryBtnHalf}>
                  {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryBtnText}>{isMr ? 'जतन करा' : 'Save Changes'}</Text>}
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => setStep(2)} style={styles.primaryBtnNext}>
                <Text style={styles.primaryBtnText}>Save & Continue</Text>
              </Pressable>
            )}
          </ScrollView>
        );

      case 2:
        // Cover Image Upload Step
        return (
          <ScrollView style={styles.scroll}>
            <View style={styles.wizardHeader}>
              <Text style={styles.wizardStepIndicator}>Step 2 of 5</Text>
              <Text style={styles.wizardTitle}>Cover Photo</Text>
              <Text style={styles.wizardSubtitle}>Upload a cover photo for your profile (16:9 ratio recommended).</Text>
            </View>

            {coverPhoto ? (
              <View style={styles.cropPreviewContainer}>
                <Image source={{ uri: coverPhoto.previewUri || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=1000' }} style={styles.coverImagePreview} />
                <Pressable onPress={() => setCoverPhoto(null)} style={styles.removeImageBadge}>
                  <X size={16} color="#FFFFFF" />
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => triggerImagePick('cover')} style={styles.dashedUploadBox}>
                <Camera size={36} color="#8A7C66" />
                <Text style={styles.dashedUploadText}>Upload Cover Photo</Text>
                <Text style={styles.dashedUploadFormats}>Supported: JPG, PNG (16:9 ratio, max 5 MB)</Text>
              </Pressable>
            )}

            <View style={styles.stepButtonRow}>
              {editMode ? (
                <>
                  <Pressable onPress={() => navigation.goBack()} style={styles.outlineBackBtn}>
                    <Text style={styles.outlineBackBtnText}>{isMr ? 'रद्द करा' : 'Cancel'}</Text>
                  </Pressable>
                  <Pressable onPress={handleSaveCoverPhoto} disabled={loading} style={styles.primaryBtnHalf}>
                    {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryBtnText}>{isMr ? 'जतन करा' : 'Save Changes'}</Text>}
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable onPress={() => setStep(1)} style={styles.outlineBackBtn}>
                    <Text style={styles.outlineBackBtnText}>Back</Text>
                  </Pressable>
                  <Pressable onPress={() => setStep(3)} style={styles.primaryBtnHalf}>
                    <Text style={styles.primaryBtnText}>Save & Continue</Text>
                  </Pressable>
                </>
              )}
            </View>
          </ScrollView>
        );

      case 3:
        // Logo Upload Step
        return (
          <ScrollView style={styles.scroll}>
            <View style={styles.wizardHeader}>
              <Text style={styles.wizardStepIndicator}>Step 3 of 5</Text>
              <Text style={styles.wizardTitle}>Business Logo</Text>
              <Text style={styles.wizardSubtitle}>Upload a square brand logo (1:1 aspect ratio recommended).</Text>
            </View>

            {logo ? (
              <View style={styles.logoPreviewCenterer}>
                <View style={styles.logoPreviewContainer}>
                  <Image source={{ uri: logo.previewUri || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500' }} style={styles.logoImagePreview} />
                  <Pressable onPress={() => setLogo(null)} style={styles.removeImageBadge}>
                    <X size={16} color="#FFFFFF" />
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable onPress={() => triggerImagePick('logo')} style={styles.dashedUploadBox}>
                <Camera size={36} color="#8A7C66" />
                <Text style={styles.dashedUploadText}>Upload Business Logo</Text>
                <Text style={styles.dashedUploadFormats}>Supported: JPG, PNG (1:1 ratio, max 5 MB)</Text>
              </Pressable>
            )}

            <View style={styles.stepButtonRow}>
              {editMode ? (
                <>
                  <Pressable onPress={() => navigation.goBack()} style={styles.outlineBackBtn}>
                    <Text style={styles.outlineBackBtnText}>{isMr ? 'रद्द करा' : 'Cancel'}</Text>
                  </Pressable>
                  <Pressable onPress={handleSaveLogo} disabled={loading} style={styles.primaryBtnHalf}>
                    {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryBtnText}>{isMr ? 'जतन करा' : 'Save Changes'}</Text>}
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable onPress={() => setStep(2)} style={styles.outlineBackBtn}>
                    <Text style={styles.outlineBackBtnText}>Back</Text>
                  </Pressable>
                  <Pressable onPress={() => setStep(4)} style={styles.primaryBtnHalf}>
                    <Text style={styles.primaryBtnText}>Save & Continue</Text>
                  </Pressable>
                </>
              )}
            </View>
          </ScrollView>
        );

      case 4:
        // Business Gallery step
        return (
          <ScrollView style={styles.scroll}>
            <View style={styles.wizardHeader}>
              <Text style={styles.wizardStepIndicator}>Step 4 of 5</Text>
              <Text style={styles.wizardTitle}>Business Gallery</Text>
              <Text style={styles.wizardSubtitle}>Add up to 8 photos of your shop, setup or past work.</Text>
            </View>

            {/* Photo list */}
            <Text style={styles.sectionHeading}>{isMr ? 'गॅलरी फोटो' : 'Gallery Photos'}</Text>
            <View style={styles.galleryGrid}>
              {gallery.map((item, idx) => (
                <View key={idx} style={styles.galleryPhotoCard}>
                  <Image source={{ uri: item.previewUri || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500' }} style={styles.galleryThumbnail} />
                  {coverIndex === idx ? (
                    <View style={styles.coverBadge}>
                      <Text style={styles.coverBadgeText}>Cover</Text>
                    </View>
                  ) : (
                    <Pressable onPress={() => makeCover(idx)} style={styles.makeCoverBtn}>
                      <Text style={styles.makeCoverBtnText}>Make Cover</Text>
                    </Pressable>
                  )}
                  <Pressable onPress={() => removeGalleryPhoto(idx)} style={styles.trashBadge}>
                    <Trash2 size={12} color="#FFFFFF" />
                  </Pressable>
                </View>
              ))}

              {gallery.length < 8 && (
                <Pressable onPress={() => triggerImagePick('gallery')} style={styles.addPhotoGridTile}>
                  <Plus size={24} color="#8A7C66" />
                  <Text style={styles.addPhotoGridTileText}>Add Photo</Text>
                </Pressable>
              )}
            </View>

            {/* Previous Orders Photos Section */}
            <Text style={styles.sectionHeading}>
              {isMr ? 'मागील ऑर्डर फोटो' : 'Previous Orders Photos'}
            </Text>
            <View style={styles.galleryGrid}>
              {prevOrdersPhotos.map((item, idx) => (
                <View key={idx} style={styles.galleryPhotoCard}>
                  <Image source={{ uri: item.previewUri || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500' }} style={styles.galleryThumbnail} />
                  <Pressable 
                    onPress={() => setPrevOrdersPhotos(prev => prev.filter((_, i) => i !== idx))} 
                    style={styles.trashBadge}
                  >
                    <Trash2 size={12} color="#FFFFFF" />
                  </Pressable>
                </View>
              ))}

              {prevOrdersPhotos.length < 8 && (
                <Pressable onPress={() => triggerImagePick('prevOrdersPhoto')} style={styles.addPhotoGridTile}>
                  <Plus size={24} color="#8A7C66" />
                  <Text style={styles.addPhotoGridTileText}>Add Photo</Text>
                </Pressable>
              )}
            </View>

            {/* Previous Orders Videos Section */}
            <Text style={styles.sectionHeading}>
              {isMr ? 'मागील ऑर्डर व्हिडिओ' : 'Previous Orders Videos'}
            </Text>
            <View style={styles.galleryGrid}>
              {prevOrdersVideos.map((item, idx) => (
                <View key={idx} style={styles.galleryPhotoCard}>
                  <View style={[styles.galleryThumbnail, { backgroundColor: '#2A2520', justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ color: '#FFFFFF', fontSize: 10, textAlign: 'center', fontWeight: 'bold' }}>Play Video</Text>
                  </View>
                  <Pressable 
                    onPress={() => setPrevOrdersVideos(prev => prev.filter((_, i) => i !== idx))} 
                    style={styles.trashBadge}
                  >
                    <Trash2 size={12} color="#FFFFFF" />
                  </Pressable>
                </View>
              ))}

              {prevOrdersVideos.length < 4 && (
                <Pressable onPress={() => triggerImagePick('prevOrdersVideo')} style={styles.addPhotoGridTile}>
                  <Plus size={24} color="#8A7C66" />
                  <Text style={styles.addPhotoGridTileText}>Add Video</Text>
                </Pressable>
              )}
            </View>

            <View style={styles.tipBox}>
              <Star size={16} color="#E58A2B" style={{ marginRight: 8 }} />
              <Text style={styles.tipBoxText}>Businesses with photos receive up to 80% more bookings.</Text>
            </View>

            <View style={styles.stepButtonRow}>
              {editMode ? (
                <>
                  <Pressable onPress={() => navigation.goBack()} style={styles.outlineBackBtn}>
                    <Text style={styles.outlineBackBtnText}>{isMr ? 'रद्द करा' : 'Cancel'}</Text>
                  </Pressable>
                  <Pressable onPress={handleSaveGallery} disabled={loading} style={styles.primaryBtnHalf}>
                    {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryBtnText}>{isMr ? 'जतन करा' : 'Save Changes'}</Text>}
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable onPress={() => setStep(3)} style={styles.outlineBackBtn}>
                    <Text style={styles.outlineBackBtnText}>Back</Text>
                  </Pressable>
                  <Pressable onPress={() => setStep(5)} style={styles.primaryBtnHalf}>
                    <Text style={styles.primaryBtnText}>Save & Continue</Text>
                  </Pressable>
                </>
              )}
            </View>
          </ScrollView>
        );

      case 5:
        // Service Catalog builder step
        return (
          <ScrollView style={styles.scroll}>
            <View style={styles.wizardHeader}>
              <Text style={styles.wizardStepIndicator}>Step 5 of 5</Text>
              <Text style={styles.wizardTitle}>Manage Services</Text>
              <Text style={styles.wizardSubtitle}>Create your service items list with pricing details.</Text>
            </View>

            {/* List Services */}
            <View style={{ marginBottom: 20 }}>
              {services.map((item, idx) => (
                <View key={idx} style={styles.serviceItemCard}>
                  <View style={styles.serviceItemLeft}>
                    <Text style={styles.serviceItemName}>{item.name_en}</Text>
                    <Text style={styles.serviceItemPrice}>₹{item.price} · {item.duration_mins} mins</Text>
                    {item.description_en ? <Text style={styles.serviceItemDesc}>{item.description_en}</Text> : null}
                  </View>
                  <Svg width={9} height={7} viewBox="0 0 9 7">
                    <Path d="M1 3.5l2.5 2.5 4.5-5" stroke="#2E7D52" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
              ))}

              {!showAddService && (
                <Pressable onPress={() => setShowAddService(true)} style={styles.addServiceTriggerBtn}>
                  <Plus size={18} color="#E58A2B" style={{ marginRight: 8 }} />
                  <Text style={styles.addServiceTriggerBtnText}>Add a Service</Text>
                </Pressable>
              )}
            </View>

            {/* Add Service sub form */}
            {showAddService && (
              <View style={styles.addServiceFormBox}>
                <Text style={styles.formBoxTitle}>New Service Details</Text>

                <Text style={styles.inputLabel}>Service Name</Text>
                <TextInput
                  value={newService.name}
                  onChangeText={(text) => setNewService(prev => ({ ...prev, name: text }))}
                  placeholder="e.g. Standard Plumber Consultation"
                  placeholderTextColor="#A89A82"
                  style={styles.formInput}
                />

                <Text style={styles.inputLabel}>Price (INR)</Text>
                <TextInput
                  value={newService.price}
                  onChangeText={(text) => setNewService(prev => ({ ...prev, price: text }))}
                  placeholder="e.g. 250"
                  keyboardType="numeric"
                  placeholderTextColor="#A89A82"
                  style={styles.formInput}
                />

                <Text style={styles.inputLabel}>Duration (mins)</Text>
                <TextInput
                  value={newService.duration}
                  onChangeText={(text) => setNewService(prev => ({ ...prev, duration: text }))}
                  placeholder="e.g. 45"
                  keyboardType="numeric"
                  placeholderTextColor="#A89A82"
                  style={styles.formInput}
                />

                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  value={newService.description}
                  onChangeText={(text) => setNewService(prev => ({ ...prev, description: text }))}
                  placeholder="Details about what the service covers..."
                  placeholderTextColor="#A89A82"
                  style={[styles.formInput, { height: 70, textAlignVertical: 'top' }]}
                  multiline
                />

                {/* Service image picker */}
                <Text style={styles.inputLabel}>Service Photo</Text>
                {newService.image ? (
                  <View style={styles.serviceImagePreviewCard}>
                    <Image source={{ uri: newService.image.previewUri }} style={styles.serviceThumbPreview} />
                    <Pressable onPress={() => setNewService(prev => ({ ...prev, image: null }))} style={styles.serviceRemoveBadge}>
                      <X size={12} color="#FFFFFF" />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable onPress={() => triggerImagePick('service')} style={styles.serviceDashedBtn}>
                    <Camera size={18} color="#8A7C66" style={{ marginRight: 8 }} />
                    <Text style={styles.serviceDashedBtnText}>Upload Service Photo</Text>
                  </Pressable>
                )}

                <View style={styles.formActions}>
                  <Pressable onPress={() => setShowAddService(false)} style={styles.formCancelBtn}>
                    <Text style={styles.formCancelBtnText}>Cancel</Text>
                  </Pressable>
                  <Pressable onPress={saveService} style={styles.formSaveBtn}>
                    <Text style={styles.formSaveBtnText}>Save Service</Text>
                  </Pressable>
                </View>
              </View>
            )}

            <View style={styles.stepButtonRow}>
              {editMode ? (
                <>
                  <Pressable onPress={() => navigation.goBack()} style={styles.outlineBackBtn}>
                    <Text style={styles.outlineBackBtnText}>{isMr ? 'रद्द करा' : 'Cancel'}</Text>
                  </Pressable>
                  <Pressable onPress={() => navigation.goBack()} style={styles.primaryBtnHalf}>
                    <Text style={styles.primaryBtnText}>{isMr ? 'पूर्ण झाले' : 'Done'}</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable onPress={() => setStep(4)} style={styles.outlineBackBtn}>
                    <Text style={styles.outlineBackBtnText}>Back</Text>
                  </Pressable>
                  <Pressable onPress={handleCompleteSetup} disabled={loading} style={styles.primaryBtnHalf}>
                    {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryBtnText}>Finish & Start</Text>}
                  </Pressable>
                </>
              )}
            </View>
          </ScrollView>
        );

      case 6:
        // Verification read-only step
        return (
          <ScrollView style={styles.scroll}>
            <View style={styles.wizardHeader}>
              <Text style={styles.wizardTitle}>📄 Identity Verification</Text>
              <Text style={styles.wizardSubtitle}>Your profile has been verified by the admin.</Text>
            </View>

            <View style={styles.verificationBadgeCard}>
              <ShieldCheck size={48} color="#2E7D52" />
              <Text style={styles.verificationStatusText}>Status: APPROVED</Text>
            </View>

            <Text style={styles.inputLabel}>Aadhaar Card Document</Text>
            {vendorProfile?.kycDocsUrl ? (
              <View style={styles.docImageContainer}>
                <Image source={{ uri: vendorProfile.kycDocsUrl }} style={styles.docThumbnail} />
              </View>
            ) : (
              <Text style={styles.noDocText}>No Aadhaar document uploaded.</Text>
            )}

            <View style={[styles.stepButtonRow, { marginTop: 32 }]}>
              <Pressable onPress={() => navigation.goBack()} style={styles.outlineBackBtnFull}>
                <Text style={styles.outlineBackBtnText}>Go Back</Text>
              </Pressable>
            </View>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {editMode ? (
        <View style={styles.navbar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.navBackIcon} hitSlop={15}>
            <Svg width={6} height={12} viewBox="0 0 6 12">
              <Path d="M5 1L1 6l4 5" stroke="#2A2520" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          </Pressable>
          <Text style={styles.navbarTitle}>
            {step === 0 ? 'Business Info' : step === 1 ? 'Location' : step === 2 ? 'Cover Photo' : step === 3 ? 'Logo' : step === 4 ? 'Gallery' : step === 5 ? 'Services' : 'Verification'}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      ) : step > 0 ? (
        <View style={styles.navbar}>
          <Pressable onPress={() => setStep(prev => prev - 1)} style={styles.navBackIcon} hitSlop={15}>
            <Svg width={6} height={12} viewBox="0 0 6 12">
              <Path d="M5 1L1 6l4 5" stroke="#2A2520" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          </Pressable>
          <Text style={styles.navbarTitle}>Profile Setup Wizard</Text>
          <Pressable onPress={handleSkipSetup} style={styles.skipNavBtn}>
            <Text style={styles.skipNavBtnText}>Skip</Text>
          </Pressable>
        </View>
      ) : null}

      {renderContent()}

      {/* UploadBottomSheet integration */}
      {uploadSheetVisible && (
        <UploadBottomSheet
          visible={uploadSheetVisible}
          documentType={uploadTarget}
          onClose={() => setUploadSheetVisible(false)}
          onFileSelect={handleFileSelected}
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
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  centerContent: {
    alignItems: 'center',
    paddingBottom: 60,
  },
  badgeCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#E3F0E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  liveTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.charcoal,
    textAlign: 'center',
  },
  liveSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: 14,
    width: '100%',
    padding: 20,
    marginTop: 28,
  },
  summaryCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.charcoal,
    marginBottom: 12,
  },
  summaryBulletHeader: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  summaryBullet: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 8,
    marginBottom: 4,
  },
  checklistPrompt: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.charcoal,
    marginTop: 28,
    textAlign: 'center',
  },
  checklistContainer: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: 14,
    width: '100%',
    padding: 20,
    marginTop: 12,
  },
  checklistHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8A7C66',
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkSymbol: {
    fontSize: 16,
    color: '#2E7D52',
    fontWeight: '700',
    marginRight: 10,
  },
  checkSymbolUnchecked: {
    fontSize: 14,
    color: '#A89A82',
    marginRight: 12,
  },
  checkTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.charcoal,
  },
  checkText: {
    fontSize: 14,
    color: '#A89A82',
  },
  progressTracker: {
    width: '100%',
    marginTop: 20,
    marginBottom: 32,
    alignItems: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: theme.colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#E58A2B', // orange active
  },
  progressText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 8,
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: theme.colors.charcoal,
    width: '100%',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#EFE3CC',
    width: '100%',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  navbar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EFE3CC',
  },
  navBackIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
  },
  navbarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.charcoal,
  },
  skipNavBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  skipNavBtnText: {
    color: '#E58A2B',
    fontWeight: '600',
  },
  wizardHeader: {
    marginTop: 24,
    marginBottom: 20,
  },
  wizardStepIndicator: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E58A2B',
    textTransform: 'uppercase',
  },
  wizardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.charcoal,
    marginTop: 4,
  },
  wizardSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8A7C66',
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 8,
  },
  searchContainer: {
    width: '100%',
    zIndex: 100,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0CFB0',
    borderRadius: 11,
    paddingHorizontal: 12,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.charcoal,
  },
  suggestionsList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE3CC',
    borderRadius: 11,
    marginTop: 4,
    padding: 8,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EFE3CC',
  },
  suggestionTextName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.charcoal,
  },
  suggestionTextSub: {
    fontSize: 12,
    color: '#8A7C66',
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 12,
    marginBottom: 20,
  },
  gpsButtonText: {
    fontSize: 13,
    color: '#E58A2B',
    fontWeight: '600',
  },
  mockMapContainer: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0CFB0',
    marginBottom: 20,
  },
  mapSvg: {
    width: '100%',
  },
  mapOverlayTip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(42, 37, 32, 0.75)',
    paddingVertical: 6,
    alignItems: 'center',
  },
  mapOverlayTipText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  addressOutputBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  outputLabel: {
    fontSize: 11,
    color: '#8A7C66',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  outputVal: {
    fontSize: 14,
    color: theme.colors.charcoal,
    marginTop: 2,
    marginBottom: 10,
  },
  outputValMini: {
    fontSize: 13,
    color: theme.colors.charcoal,
    marginTop: 2,
  },
  primaryBtnNext: {
    backgroundColor: theme.colors.charcoal,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
  },
  stepButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 60,
  },
  outlineBackBtn: {
    borderWidth: 1.5,
    borderColor: '#EFE3CC',
    width: '32%',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineBackBtnText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  primaryBtnHalf: {
    backgroundColor: theme.colors.charcoal,
    width: '64%',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashedUploadBox: {
    width: '100%',
    height: 180,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#E0CFB0',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 10,
  },
  dashedUploadText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.charcoal,
    marginTop: 10,
  },
  dashedUploadFormats: {
    fontSize: 11,
    color: '#8A7C66',
    marginTop: 4,
  },
  cropPreviewContainer: {
    width: '100%',
    height: 200,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0CFB0',
  },
  coverImagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPreviewCenterer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  logoPreviewContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E58A2B',
  },
  logoImagePreview: {
    width: '100%',
    height: '100%',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  galleryPhotoCard: {
    width: '48%',
    height: 130,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EFE3CC',
  },
  galleryThumbnail: {
    width: '100%',
    height: '100%',
  },
  coverBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#E58A2B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coverBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  makeCoverBtn: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(42,37,32,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  makeCoverBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
  },
  trashBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(192,57,43,0.85)',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoGridTile: {
    width: '48%',
    height: 130,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#E0CFB0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  addPhotoGridTileText: {
    fontSize: 13,
    color: '#8A7C66',
    fontWeight: '600',
    marginTop: 4,
  },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FBE7CC',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },
  tipBoxText: {
    flex: 1,
    fontSize: 12,
    color: '#9A5A12',
    lineHeight: 18,
  },
  serviceItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  serviceItemLeft: {
    flex: 1,
    marginRight: 10,
  },
  serviceItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.charcoal,
  },
  serviceItemPrice: {
    fontSize: 12,
    color: '#E58A2B',
    fontWeight: '600',
    marginTop: 2,
  },
  serviceItemDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  addServiceTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#E0CFB0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    height: 50,
    marginTop: 10,
  },
  addServiceTriggerBtnText: {
    color: '#E58A2B',
    fontWeight: '600',
  },
  addServiceFormBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: 14,
    padding: 18,
    marginTop: 10,
    marginBottom: 20,
  },
  formBoxTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.charcoal,
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    color: '#8A7C66',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E0CFB0',
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 14,
    color: theme.colors.charcoal,
    marginBottom: 14,
  },
  serviceImagePreviewCard: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFE3CC',
    marginBottom: 16,
  },
  serviceThumbPreview: {
    width: '100%',
    height: '100%',
  },
  serviceRemoveBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceDashedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E0CFB0',
    borderRadius: 8,
    height: 44,
    marginBottom: 16,
  },
  serviceDashedBtnText: {
    fontSize: 13,
    color: '#8A7C66',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  formCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  formCancelBtnText: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  formSaveBtn: {
    backgroundColor: '#E58A2B',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  formSaveBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
  },
  editableAddressInput: {
    borderWidth: 1,
    borderColor: '#E0CFB0',
    borderRadius: 8,
    backgroundColor: '#FAF5EA',
    padding: 8,
    fontSize: 14,
    color: '#2A2520',
    minHeight: 50,
    textAlignVertical: 'top',
  },
  editableMiniInput: {
    borderWidth: 1,
    borderColor: '#E0CFB0',
    borderRadius: 6,
    backgroundColor: '#FAF5EA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 13,
    color: '#2A2520',
    height: 34,
    marginTop: 2,
  },
  categorySelectBox: {
    borderWidth: 1,
    borderColor: '#E0CFB0',
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginBottom: 14,
  },
  categorySelectText: {
    fontSize: 14,
    color: theme.colors.charcoal,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2A2520',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EFE3CC',
  },
  modalRowText: {
    fontSize: 15,
    color: '#2A2520',
  },
  modalCloseBtn: {
    marginTop: 16,
    backgroundColor: '#FAF5EA',
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    fontWeight: '700',
    color: '#8A7C66',
  },
  verificationBadgeCard: {
    backgroundColor: '#FAF5EA',
    borderWidth: 1.5,
    borderColor: '#E0CFB0',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  verificationStatusText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E7D52',
    marginTop: 8,
  },
  docImageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFE3CC',
    marginTop: 6,
    marginBottom: 24,
  },
  docThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  noDocText: {
    color: '#8A7C66',
    fontStyle: 'italic',
    marginTop: 6,
    marginBottom: 24,
  },
  outlineBackBtnFull: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#EFE3CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VendorFirstTimeSetupScreen;
