import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, ActivityIndicator, TextInput, Modal, Alert, BackHandler } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';
import { RootStackParamList } from '../../navigation/types';
import { DocumentUploadCard } from '../../components/vendor/DocumentUploadCard';
import { UploadBottomSheet } from '../../components/vendor/UploadBottomSheet';
import { fileUploadService, KYCFile } from '../../services/fileUploadService';
import { mockDb } from '../../api/mockDb';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface CategoryItem {
  id?: string;
  slug: string;
  nameEn: string;
  nameMr: string;
  label: string;
  requireFssai: boolean;
}

const emptyCategory: CategoryItem = { slug: '', nameEn: '', nameMr: '', label: '', requireFssai: false };

type AreaOption = { id: string; name: string; latitude?: number; longitude?: number };

export const KycRegistrationScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { user, preferredLanguage, activeArea } = useAuthStore();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      (navigation as any).navigate('ResidentMain');
    }
  };

  useEffect(() => {
    const onBackPress = () => {
      handleBack();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [navigation]);

  const [bizName, setBizName] = useState('');
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCatObj, setSelectedCatObj] = useState<CategoryItem>(emptyCategory);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [areas, setAreas] = useState<AreaOption[]>([]);
  const [selectedArea, setSelectedArea] = useState<AreaOption | null>(null);
  const [loadingAreas, setLoadingAreas] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);

  // Bottom Sheet Upload Management
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [activeUploadType, setActiveUploadType] = useState<string | null>(null);

  // Track uploaded documents in local state
  const [files, setFiles] = useState<Record<string, KYCFile | null>>({
    aadhaar: null
  });

  // Keep references to cancel active mock uploads if replaced or removed
  const [uploadTasks, setUploadTasks] = useState<Record<string, { cancel: () => void } | null>>({});

  const isMr = preferredLanguage === 'mr';

  const strings = {
    back: t('vendor.registerBusiness'),
    bizNameLabel: t('vendor.businessName'),
    categoryLabel: t('vendor.category'),
    areaLabel: t('vendor.area'),
    docsLabel: t('vendor.aadhaarVerification'),
    btnSubmit: t('vendor.submitForReview'),
    successMsg: t('vendor.registrationSuccess'),
  };

  // Fetch live categories from backend/admin API
  useEffect(() => {
    let isMounted = true;
    const fetchLiveCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await api.getCategories();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const mapped: CategoryItem[] = data.map((c: any) => {
            const nameEn = c.nameEn || c.name_en || '';
            const nameMr = c.nameMr || c.name_mr || nameEn;
            const slug = c.slug || 'general';
            return {
              id: c.id || slug,
              label: nameEn,
              nameEn,
              nameMr,
              slug,
              requireFssai: !!(c.requiresFssai ?? c.requireFssai),
            };
          });
          setCategories(mapped);
          setSelectedCatObj(prev => {
            const found = mapped.find(item => item.slug === prev?.slug);
            return found || mapped[0];
          });
        }
      } catch (err) {
        console.warn('[KycRegistrationScreen] Failed to load live categories:', err);
      } finally {
        if (isMounted) setLoadingCategories(false);
      }
    };

    fetchLiveCategories();

    const mapArea = (area: any): AreaOption => ({
      id: String(area.id || area.name_en || area.nameEn || ''),
      name:
        preferredLanguage === 'mr'
          ? (area.name_mr || area.nameMr || area.name_en || area.nameEn || area.name || '')
          : (area.name_en || area.nameEn || area.name_mr || area.nameMr || area.name || ''),
      latitude: area.latitude,
      longitude: area.longitude,
    });

    const loadAreas = async () => {
      setLoadingAreas(true);
      let mapped: AreaOption[] = [];
      try {
        const data = await api.getAreas();
        if (Array.isArray(data) && data.length > 0) {
          mapped = data.map(mapArea).filter((area) => area.id && area.name);
        }
      } catch (err) {
        console.warn('[KycRegistrationScreen] Failed to load live areas:', err);
      }

      if (mapped.length === 0) {
        try {
          const fallback = await mockDb.getAreas();
          mapped = (fallback || []).map(mapArea).filter((area) => area.id && area.name);
        } catch (_) {}
      }

      if (activeArea?.id && !mapped.some((area) => area.id === activeArea.id)) {
        mapped.unshift({
          id: activeArea.id,
          name: preferredLanguage === 'mr' ? (activeArea.name_mr || activeArea.name_en) : (activeArea.name_en || activeArea.name_mr),
          latitude: activeArea.latitude,
          longitude: activeArea.longitude,
        });
      }

      if (!isMounted) return;
      setAreas(mapped);
      setSelectedArea((prev) => {
        if (prev && mapped.some((area) => area.id === prev.id)) return prev;
        return mapped[0] || null;
      });
      setLoadingAreas(false);
    };

    loadAreas();
    return () => { isMounted = false; };
  }, [preferredLanguage, activeArea]);

  const handlePressUpload = (docType: string) => {
    setActiveUploadType(docType);
    setBottomSheetVisible(true);
  };

  const handleRemoveFile = (docType: string) => {
    if (uploadTasks[docType]) {
      uploadTasks[docType]?.cancel();
      setUploadTasks(prev => ({ ...prev, [docType]: null }));
    }
    setFiles(prev => ({
      ...prev,
      [docType]: null
    }));
  };

  const handleRetryFile = (docType: string) => {
    const failedFile = files[docType];
    if (failedFile) {
      startUploadProcess(failedFile);
    }
  };

  const startUploadProcess = async (kycFile: KYCFile) => {
    const docType = kycFile.documentType;

    // 1. Validation check
    const validation = fileUploadService.validateFile(kycFile.fileName, kycFile.mimeType, kycFile.fileSize);
    if (!validation.valid) {
      Alert.alert('Validation Error', validation.error);
      return;
    }

    // 2. Duplicate file check
    const isDuplicate = Object.entries(files).some(
      ([key, f]) => f && key !== docType && f.fileName.toLowerCase() === kycFile.fileName.toLowerCase()
    );
    if (isDuplicate) {
      Alert.alert('Duplicate Upload', 'This file has already been uploaded for another document field.');
      return;
    }

    // 3. Compress Image (JPEG/PNG)
    let processedFile = kycFile;
    if (kycFile.mimeType.startsWith('image/')) {
      processedFile = await fileUploadService.compressImage(kycFile);
    }

    // Cancel existing upload task if running
    if (uploadTasks[docType]) {
      uploadTasks[docType]?.cancel();
    }

    // Set uploading state
    setFiles(prev => ({
      ...prev,
      [docType]: {
        ...processedFile,
        uploadStatus: 'uploading',
        uploadProgress: 0
      }
    }));

    // Start network simulation progress
    const task = fileUploadService.startUpload(
      processedFile,
      (progress) => {
        setFiles(prev => {
          const current = prev[docType];
          if (!current || current.uploadStatus !== 'uploading') return prev;
          return {
            ...prev,
            [docType]: {
              ...current,
              uploadProgress: progress
            }
          };
        });
      },
      (completedFile) => {
        setFiles(prev => ({
          ...prev,
          [docType]: completedFile
        }));
        setUploadTasks(prev => ({ ...prev, [docType]: null }));
      },
      (error) => {
        setFiles(prev => ({
          ...prev,
          [docType]: {
            ...processedFile,
            uploadStatus: 'failed',
            uploadProgress: 0
          }
        }));
        setUploadTasks(prev => ({ ...prev, [docType]: null }));
      }
    );

    setUploadTasks(prev => ({ ...prev, [docType]: task }));
  };

  const handleSubmit = async () => {
    if (!bizName.trim()) {
      Alert.alert('Validation Error', isMr ? 'कृपया व्यवसाय नाव टाका.' : 'Please enter a business name.');
      return;
    }
    if (!selectedCatObj?.slug) {
      Alert.alert('Validation Error', isMr ? 'कृपया श्रेणी निवडा.' : 'Please select a category.');
      return;
    }
    if (!selectedArea?.id && !areas[0]?.id) {
      Alert.alert('Validation Error', isMr ? 'कृपया परिसर निवडा.' : 'Please select an area.');
      return;
    }
    if (!user) {
      Alert.alert('Validation Error', isMr ? 'कृपया पुन्हा लॉगिन करा.' : 'Please log in again to register.');
      return;
    }

    setLoading(true);
    try {
      if (user) {
        // Collect uploaded documents list for DTO compatibility
        const uploadedDocuments = [];
        const kycDocs: any = {};

        if (files.aadhaar) {
          uploadedDocuments.push({
            documentId: `doc-aadhaar-${Date.now()}`,
            documentType: 'aadhaar',
            fileName: files.aadhaar.fileName,
            mimeType: files.aadhaar.mimeType,
            fileSize: files.aadhaar.fileSize,
            uploadedAt: files.aadhaar.uploadedAt || new Date().toISOString(),
            verificationStatus: 'Pending Review'
          });

          kycDocs.aadhaar = {
            fileName: files.aadhaar.fileName,
            mimeType: files.aadhaar.mimeType,
            fileData: files.aadhaar.fileData || '',
          };
        }

        const areaObj = selectedArea || areas[0];
        const selectedAreaId = areaObj?.id || '';

        await api.registerVendor({
          userId: user.id,
          businessNameMr: isMr ? bizName : (selectedCatObj.nameMr || bizName),
          businessNameEn: bizName,
          categorySlug: selectedCatObj.slug,
          categoryNameMr: selectedCatObj.nameMr,
          categoryNameEn: selectedCatObj.nameEn,
          descriptionMr: isMr ? 'स्थानिक व्यवसाय सेवा.' : `${bizName} - स्थानिक व्यवसाय.`,
          descriptionEn: `${bizName} provides trusted local services.`,
          kycDocsUrl: JSON.stringify(uploadedDocuments), // Store structured uploaded files payload
          kycDocs, // Pass structured documents for Supabase upload on the backend
          latitude: Number.isFinite(Number(areaObj?.latitude)) ? Number(areaObj?.latitude) : undefined,
          longitude: Number.isFinite(Number(areaObj?.longitude)) ? Number(areaObj?.longitude) : undefined,
          areaId: selectedAreaId,
          area: areaObj?.name || '',
          formattedAddress: areaObj?.name || '',
          city: '',
          services: [],
        });
      }
      
      Alert.alert(strings.successMsg);
      navigation.replace('KycStatus');
    } catch (err: any) {
      console.error(err);
      Alert.alert(
        isMr ? 'नोंदणी अयशस्वी' : 'Registration failed',
        err?.message || (isMr ? 'व्यवसाय नोंदणी करता आली नाही. पुन्हा प्रयत्न करा.' : 'Failed to register business. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Navigation Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={15} accessibilityLabel="Go back">
          <Svg width={6} height={12} viewBox="0 0 6 12">
            <Path d="M5 1L1 6l4 5" stroke="#2A2520" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle}>{strings.back}</Text>
      </View>
      <View style={styles.headerDivider} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Business Name Field */}
        <Text style={styles.fieldLabel}>{strings.bizNameLabel}</Text>
        <View style={styles.inputCard}>
          <TextInput
            value={bizName}
            onChangeText={setBizName}
            style={styles.textInput}
            placeholderTextColor="#A89A82"
          />
        </View>

        {/* Category Dropdown Selector */}
        <Text style={[styles.fieldLabel, styles.marginField]}>{strings.categoryLabel}</Text>
        <Pressable onPress={() => setShowCatModal(true)} style={styles.dropdownTrigger}>
          <Text style={styles.dropdownText}>
            {selectedCatObj ? (isMr ? selectedCatObj.nameMr : selectedCatObj.nameEn) : (isMr ? 'श्रेणी निवडा' : 'Select Category')}
          </Text>
          <Svg width={10} height={5} viewBox="0 0 10 5">
            <Path d="M1 1l4 3 4-3" stroke="#8A7C66" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>

        {/* Area Dropdown Selector */}
        <Text style={[styles.fieldLabel, styles.marginField]}>{strings.areaLabel}</Text>
        <Pressable onPress={() => setShowAreaModal(true)} style={styles.dropdownTrigger}>
          <Text style={[styles.dropdownText, !selectedArea?.name && { color: '#A89A82' }]}>
            {selectedArea?.name || (isMr ? 'परिसर निवडा' : 'Select Area')}
          </Text>
          <Svg width={10} height={5} viewBox="0 0 10 5">
            <Path d="M1 1l4 3 4-3" stroke="#8A7C66" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>

        {/* Documents Section */}
        <Text style={[styles.fieldLabel, styles.marginField]}>{strings.docsLabel}</Text>
        
        {/* Aadhaar Card Card (Mandatory) */}
        <DocumentUploadCard
          label="Aadhaar Card (Optional)"
          file={files.aadhaar}
          onPressUpload={() => handlePressUpload('aadhaar')}
          onRemove={() => handleRemoveFile('aadhaar')}
          onRetry={() => handleRetryFile('aadhaar')}
        />
        <Text style={styles.formatHelperText}>
          Supported formats: JPG, PNG, PDF (Max 5 MB)
        </Text>

        <View style={styles.spacingBottom} />
      </ScrollView>

      {/* Footer Submit button */}
      <View style={styles.footer}>
        <Pressable onPress={handleSubmit} disabled={loading} style={styles.submitBtn}>
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>{strings.btnSubmit}</Text>
          )}
        </Pressable>
      </View>

      {/* Reusable Selector Bottom Sheet */}
      {activeUploadType && (
        <UploadBottomSheet
          visible={bottomSheetVisible}
          documentType={activeUploadType}
          onClose={() => setBottomSheetVisible(false)}
          onFileSelect={startUploadProcess}
        />
      )}

      {/* Category Selection Modal */}
      <Modal visible={showCatModal} transparent animationType="fade" onRequestClose={() => setShowCatModal(false)}>
        <Pressable style={styles.dropdownBackdrop} onPress={() => setShowCatModal(false)}>
          <Pressable style={styles.dropdownModalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.dropdownModalTitle}>{isMr ? 'श्रेणी निवडा' : 'Select Category'}</Text>
            {loadingCategories ? (
              <ActivityIndicator size="small" color="#E8642A" style={{ marginVertical: 20 }} />
            ) : (
              <ScrollView style={styles.dropdownList} keyboardShouldPersistTaps="handled">
                {categories.map((item) => (
                  <Pressable
                    key={item.id || item.slug}
                    onPress={() => {
                      setSelectedCatObj(item);
                      setShowCatModal(false);
                      if (!item.requireFssai) {
                        handleRemoveFile('fssai');
                      }
                    }}
                    style={styles.dropdownItem}
                  >
                    <Text style={styles.dropdownItemText}>{isMr ? item.nameMr : item.nameEn}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Area Selection Modal */}
      <Modal visible={showAreaModal} transparent animationType="fade" onRequestClose={() => setShowAreaModal(false)}>
        <Pressable style={styles.dropdownBackdrop} onPress={() => setShowAreaModal(false)}>
          <Pressable style={styles.dropdownModalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.dropdownModalTitle}>{isMr ? 'परिसर निवडा' : 'Select Area'}</Text>
            {loadingAreas ? (
              <ActivityIndicator size="small" color="#E8642A" style={{ marginVertical: 20 }} />
            ) : areas.length === 0 ? (
              <Text style={styles.formatHelperText}>
                {isMr ? 'सध्या कोणताही परिसर उपलब्ध नाही.' : 'No areas available yet.'}
              </Text>
            ) : (
              <ScrollView style={styles.dropdownList} keyboardShouldPersistTaps="handled">
                {areas.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      setSelectedArea(item);
                      setShowAreaModal(false);
                    }}
                    style={styles.dropdownItem}
                  >
                    <Text style={styles.dropdownItemText}>{item.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF6EC',
  },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 100,
    backgroundColor: '#FBF6EC',
    zIndex: 10,
  },
  backBtn: {
    position: 'absolute',
    left: 22,
    top: 66,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  headerTitle: {
    position: 'absolute',
    left: 52,
    top: 58,
    fontSize: 18,
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    lineHeight: 30,
    color: '#2A2520',
  },
  headerDivider: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 100,
    height: 1,
    backgroundColor: '#EFE3CC',
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 116,
    paddingBottom: 100,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: 'Mukta-Medium',
    fontWeight: '500',
    color: '#6B5F4E',
    marginBottom: 2,
  },
  marginField: {
    marginTop: 14,
  },
  inputCard: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0CFB0',
    borderRadius: 11,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  textInput: {
    fontSize: 15,
    fontFamily: 'Mukta-Medium',
    fontWeight: '500',
    color: '#2A2520',
    padding: 0,
    height: '100%',
  },
  dropdownTrigger: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0CFB0',
    borderRadius: 11,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 15,
    fontFamily: 'Mukta-Medium',
    fontWeight: '500',
    color: '#2A2520',
  },
  spacingBottom: {
    height: 120,
  },
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 18,
    right: 18,
  },
  submitBtn: {
    width: '100%',
    height: 50,
    backgroundColor: '#2A2520',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 25,
  },
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModalCard: {
    width: '80%',
    maxHeight: '60%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 12,
    zIndex: 2,
  },
  dropdownList: {
    maxHeight: 320,
  },
  dropdownModalTitle: {
    fontSize: 16,
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    color: '#2A2520',
    marginBottom: 14,
  },
  dropdownItem: {
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFE3CC',
  },
  dropdownItemText: {
    fontSize: 14,
    fontFamily: 'Mukta-Medium',
    color: '#3D362E',
  },
  formatHelperText: {
    fontSize: 12,
    fontFamily: 'Mukta-Medium',
    color: '#8A7C66',
    marginTop: 4,
    marginBottom: 10,
    fontStyle: 'italic',
  },
});

export default KycRegistrationScreen;
