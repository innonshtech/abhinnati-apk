import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Modal, FlatList, ScrollView } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { fileUploadService, KYCFile } from '../../services/fileUploadService';

interface UploadBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  documentType: string;
  onFileSelect: (file: KYCFile) => void;
}

type SubViewType = 'options' | 'camera' | 'gallery' | 'pdf';
type PermissionStateType = 'idle' | 'requesting' | 'denied';
type DeniedType = 'camera' | 'gallery' | '';

export const UploadBottomSheet: React.FC<UploadBottomSheetProps> = ({
  visible,
  onClose,
  documentType,
  onFileSelect
}) => {
  const [subView, setSubView] = useState<SubViewType>('options');
  const [permissionState, setPermissionState] = useState<PermissionStateType>('idle');
  const [deniedType, setDeniedType] = useState<DeniedType>('');

  const handleClose = () => {
    setSubView('options');
    setPermissionState('idle');
    setDeniedType('');
    onClose();
  };

  const handleOptionPress = async (option: 'camera' | 'gallery' | 'pdf') => {
    if (option === 'camera') {
      setPermissionState('requesting');
      // Simulate permission check
      const status = await fileUploadService.requestPermission('camera');
      if (status === 'granted') {
        setPermissionState('idle');
        setSubView('camera');
      } else {
        setPermissionState('denied');
        setDeniedType('camera');
      }
    } else if (option === 'gallery') {
      setPermissionState('requesting');
      const status = await fileUploadService.requestPermission('gallery');
      if (status === 'granted') {
        setPermissionState('idle');
        setSubView('gallery');
      } else {
        setPermissionState('denied');
        setDeniedType('gallery');
      }
    } else {
      // PDF documents don't require camera/gallery permission
      setSubView('pdf');
    }
  };

  // Mock settings bypass click
  const handleOpenSettingsMock = () => {
    alert('Mock Settings Opened: Camera and Photo Library permissions have been set to GRANTED.');
    setPermissionState('idle');
    setDeniedType('');
    setSubView('options');
  };

  // Mock selectors handlers
  const handleSelectMockFile = (name: string, type: string, sizeMB: number) => {
    const dummyBase64 = type.startsWith('image/')
      ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      : 'data:application/pdf;base64,JVBERi0xLjQKJdDFzOQgMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAyIDAgUiA+PgplbmRvYmoKMiAwIG9iagogIDw8IC9UeXBlIC9QYWdlcyAvS2lkcyBbMyAwIFJdIC9Db3VudCAxID4+CmVuZG9iagozIDAgb2JqCiAgPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiA+PgplbmRvYmoK';

    const kycFile: KYCFile = {
      documentType,
      fileName: name,
      mimeType: type,
      fileSize: sizeMB * 1024 * 1024,
      uploadProgress: 0,
      uploadStatus: 'idle',
      previewUri: type.startsWith('image/') 
        ? 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500' 
        : type.startsWith('video/') 
        ? 'https://www.w3schools.com/html/mov_bbb.mp4'
        : undefined,
      fileData: dummyBase64,
    };
    onFileSelect(kycFile);
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        {/* Backdrop Pressable */}
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        {/* Permission Denied Alert View */}
        {permissionState === 'denied' ? (
          <View style={styles.alertCard}>
            <Text style={styles.alertTitle}>Permission Required</Text>
            <Text style={styles.alertText}>
              Abhinnati needs access to your {deniedType === 'camera' ? 'Camera' : 'Photo Library'} to upload documents. Please enable it in device settings.
            </Text>
            <View style={styles.alertBtnRow}>
              <Pressable onPress={handleClose} style={[styles.alertBtn, styles.alertCancelBtn]}>
                <Text style={styles.alertCancelText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleOpenSettingsMock} style={[styles.alertBtn, styles.alertConfirmBtn]}>
                <Text style={styles.alertConfirmText}>Open Settings</Text>
              </Pressable>
            </View>
          </View>
        ) : subView === 'options' ? (
          /* MAIN BOTTOM SHEET SHEET */
          <View style={styles.sheetContainer}>
            <View style={styles.dragIndicator} />
            <Text style={styles.sheetTitle}>Upload Document</Text>
            
            <View style={styles.optionsList}>
              <Pressable onPress={() => handleOptionPress('camera')} style={styles.optionItem}>
                <View style={styles.optionIconBg}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="#9A5A12" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    <Circle cx="12" cy="13" r="4" stroke="#9A5A12" strokeWidth={2} />
                  </Svg>
                </View>
                <Text style={styles.optionLabel}>Take Photo</Text>
              </Pressable>

              <Pressable onPress={() => handleOptionPress('gallery')} style={styles.optionItem}>
                <View style={styles.optionIconBg}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z" stroke="#9A5A12" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    <Circle cx="8.5" cy="8.5" r="1.5" fill="#9A5A12" />
                    <Path d="M21 15l-5-5L5 21" stroke="#9A5A12" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <Text style={styles.optionLabel}>Choose from Gallery</Text>
              </Pressable>

              <Pressable onPress={() => handleOptionPress('pdf')} style={styles.optionItem}>
                <View style={styles.optionIconBg}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#9A5A12" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M14 2v6h6" stroke="#9A5A12" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <Text style={styles.optionLabel}>Choose PDF / Documents</Text>
              </Pressable>

              <Pressable onPress={handleClose} style={[styles.optionItem, styles.cancelOption]}>
                <Text style={styles.cancelOptionText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        ) : subView === 'camera' ? (
          /* MOCK CAMERA SCREEN */
          <View style={styles.fullOverlayContainer}>
            <View style={styles.cameraViewport}>
              <View style={styles.cameraHeader}>
                <Pressable onPress={() => setSubView('options')} style={styles.cameraCloseBtn}>
                  <Text style={styles.cameraCloseText}>← Back</Text>
                </Pressable>
                <Text style={styles.cameraTitle}>Simulated Camera</Text>
              </View>
              
              <View style={styles.cameraFrame}>
                <Text style={styles.cameraOverlayText}>Center the document in the frame</Text>
              </View>

              <View style={styles.cameraFooter}>
                <Pressable 
                  onPress={() => handleSelectMockFile(`Camera_Snap_${Date.now().toString().slice(-4)}.jpg`, 'image/jpeg', 2.4)}
                  style={styles.shutterBtn}
                >
                  <View style={styles.shutterInner} />
                </Pressable>
              </View>
            </View>
          </View>
        ) : subView === 'gallery' ? (
          /* MOCK GALLERY SELECTION SCREEN */
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Pressable onPress={() => setSubView('options')} style={styles.pickerBackBtn}>
                <Text style={styles.pickerBackText}>← Back</Text>
              </Pressable>
              <Text style={styles.pickerTitle}>Choose Image</Text>
            </View>

            <ScrollView contentContainerStyle={styles.galleryGrid}>
              {documentType === 'prevOrdersVideo' ? (
                <>
                  <Pressable 
                    onPress={() => handleSelectMockFile('order_delivery_video.mp4', 'video/mp4', 2.4)}
                    style={styles.galleryItem}
                  >
                    <View style={[styles.galleryMockThumb, { backgroundColor: '#2A2520' }]} />
                    <Text style={styles.galleryItemName}>order_delivery_video.mp4 (2.4MB)</Text>
                  </Pressable>
                  <Pressable 
                    onPress={() => handleSelectMockFile('cake_decoration_work.mp4', 'video/mp4', 4.8)}
                    style={styles.galleryItem}
                  >
                    <View style={[styles.galleryMockThumb, { backgroundColor: '#2A2520' }]} />
                    <Text style={styles.galleryItemName}>cake_decoration_work.mp4 (4.8MB)</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable 
                    onPress={() => handleSelectMockFile('shop_licence_scan.jpg', 'image/jpeg', 1.8)}
                    style={styles.galleryItem}
                  >
                    <View style={styles.galleryMockThumb} />
                    <Text style={styles.galleryItemName}>shop_licence_scan.jpg (1.8MB)</Text>
                  </Pressable>

                  <Pressable 
                    onPress={() => handleSelectMockFile('GST_Proof_Photo.png', 'image/png', 3.2)}
                    style={styles.galleryItem}
                  >
                    <View style={styles.galleryMockThumb} />
                    <Text style={styles.galleryItemName}>GST_Proof_Photo.png (3.2MB)</Text>
                  </Pressable>

                  <Pressable 
                    onPress={() => handleSelectMockFile('oversized_file.jpg', 'image/jpeg', 12.4)} // oversized trigger
                    style={styles.galleryItem}
                  >
                    <View style={[styles.galleryMockThumb, { backgroundColor: '#FBE7CC' }]} />
                    <Text style={styles.galleryItemName}>oversized_file.jpg (12.4MB - Fail Check)</Text>
                  </Pressable>
                </>
              )}
            </ScrollView>
          </View>
        ) : (
          /* MOCK DOCUMENT SELECTOR SCREEN */
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Pressable onPress={() => setSubView('options')} style={styles.pickerBackBtn}>
                <Text style={styles.pickerBackText}>← Back</Text>
              </Pressable>
              <Text style={styles.pickerTitle}>Choose Document</Text>
            </View>

            <ScrollView contentContainerStyle={styles.docList}>
              <Pressable 
                onPress={() => handleSelectMockFile('Shop_Act_Licence_2026.pdf', 'application/pdf', 4.5)}
                style={styles.docItem}
              >
                <Text style={styles.docItemName}>Shop_Act_Licence_2026.pdf (4.5MB)</Text>
              </Pressable>

              <Pressable 
                onPress={() => handleSelectMockFile('GST_Certificate_Bandra.pdf', 'application/pdf', 2.1)}
                style={styles.docItem}
              >
                <Text style={styles.docItemName}>GST_Certificate_Bandra.pdf (2.1MB)</Text>
              </Pressable>

              <Pressable 
                onPress={() => handleSelectMockFile('unsupported_format.txt', 'text/plain', 0.2)} // invalid trigger
                style={styles.docItem}
              >
                <Text style={[styles.docItemName, { color: '#B91C1C' }]}>unsupported_format.txt (Unsupported Format)</Text>
              </Pressable>
            </ScrollView>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(42, 37, 32, 0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheetContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
    alignItems: 'center',
    shadowColor: '#2A2520',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  dragIndicator: {
    width: 38,
    height: 4,
    backgroundColor: '#EFE3CC',
    borderRadius: 2,
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 16,
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    color: '#2A2520',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  optionsList: {
    width: '100%',
    gap: 12,
  },
  optionItem: {
    width: '100%',
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBF6EC',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EFE3CC',
  },
  optionIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FBE7CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionLabel: {
    fontSize: 14,
    fontFamily: 'Mukta-Medium',
    fontWeight: '500',
    color: '#3D362E',
  },
  cancelOption: {
    backgroundColor: '#2A2520',
    borderColor: '#2A2520',
    justifyContent: 'center',
    marginTop: 6,
  },
  cancelOptionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
  },
  alertCard: {
    width: 310,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 'auto',
    marginTop: 'auto',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  alertTitle: {
    fontSize: 16,
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    color: '#2A2520',
    marginBottom: 8,
  },
  alertText: {
    fontSize: 13,
    fontFamily: 'Mukta-Regular',
    color: '#6B5F4E',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  alertBtnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  alertBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertCancelBtn: {
    borderWidth: 1,
    borderColor: '#EFE3CC',
    backgroundColor: '#FFFFFF',
  },
  alertCancelText: {
    fontFamily: 'Mukta-Medium',
    fontSize: 13,
    color: '#6B5F4E',
  },
  alertConfirmBtn: {
    backgroundColor: '#2A2520',
  },
  alertConfirmText: {
    fontFamily: 'Mukta-SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  fullOverlayContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  cameraViewport: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cameraHeader: {
    height: 90,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  cameraCloseBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
  },
  cameraCloseText: {
    color: '#FFFFFF',
    fontFamily: 'Mukta-Medium',
    fontSize: 13,
  },
  cameraTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Mukta-SemiBold',
    marginLeft: 30,
  },
  cameraFrame: {
    alignSelf: 'center',
    width: 320,
    height: 420,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraOverlayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Mukta-Regular',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cameraFooter: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  shutterBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
  },
  pickerContainer: {
    width: '100%',
    height: '60%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  pickerHeader: {
    height: 60,
    borderBottomWidth: 1,
    borderColor: '#EFE3CC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  pickerBackBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#EFE3CC',
    borderRadius: 6,
  },
  pickerBackText: {
    color: '#6B5F4E',
    fontFamily: 'Mukta-Medium',
    fontSize: 13,
  },
  pickerTitle: {
    fontSize: 15,
    fontFamily: 'Mukta-SemiBold',
    marginLeft: 20,
    color: '#2A2520',
  },
  galleryGrid: {
    padding: 16,
    gap: 16,
  },
  galleryItem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#EFE3CC',
    borderRadius: 8,
  },
  galleryMockThumb: {
    width: 50,
    height: 50,
    backgroundColor: '#F1E7D5',
    borderRadius: 6,
    marginRight: 14,
  },
  galleryItemName: {
    fontSize: 13,
    fontFamily: 'Mukta-Medium',
    color: '#3D362E',
    flex: 1,
  },
  docList: {
    padding: 16,
    gap: 12,
  },
  docItem: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#EFE3CC',
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
    backgroundColor: '#FBF6EC',
  },
  docItemName: {
    fontSize: 13,
    fontFamily: 'Mukta-Medium',
    color: '#3D362E',
  },
});
export default UploadBottomSheet;
