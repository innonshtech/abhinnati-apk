import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ActivityIndicator, Modal, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { KYCFile } from '../../services/fileUploadService';

interface DocumentUploadCardProps {
  label: string;
  file: KYCFile | null;
  required?: boolean;
  onPressUpload: () => void;
  onRemove: () => void;
  onRetry: () => void;
}

export const DocumentUploadCard: React.FC<DocumentUploadCardProps> = ({
  label,
  file,
  required = false,
  onPressUpload,
  onRemove,
  onRetry
}) => {
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const getFriendlySize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 1;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleCardPress = () => {
    if (!file || file.uploadStatus === 'idle') {
      onPressUpload();
    } else if (file.uploadStatus === 'uploaded') {
      setShowOptionsModal(true);
    }
  };

  const handleView = () => {
    setShowOptionsModal(false);
    setShowPreviewModal(true);
  };

  const handleReplace = () => {
    setShowOptionsModal(false);
    onPressUpload();
  };

  const handleRemove = () => {
    setShowOptionsModal(false);
    onRemove();
  };

  // Render Card States
  const renderCardContent = () => {
    if (!file || file.uploadStatus === 'idle') {
      // IDLE DASHED UPLOAD CARD
      return (
        <Pressable onPress={onPressUpload} style={styles.uploadBox}>
          <Text style={styles.uploadPlaceholderText}>
            + Upload {label} {required && '*'}
          </Text>
        </Pressable>
      );
    }

    if (file.uploadStatus === 'uploading') {
      // UPLOADING PROGRESS STATE
      return (
        <View style={styles.uploadingBox}>
          <View style={styles.uploadingHeader}>
            <Text style={styles.uploadingLabel} numberOfLines={1}>
              Uploading {file.fileName}
            </Text>
            <Text style={styles.uploadingPercent}>{file.uploadProgress}%</Text>
          </View>
          {/* Progress Bar Track */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${file.uploadProgress}%` }]} />
          </View>
        </View>
      );
    }

    if (file.uploadStatus === 'failed') {
      // FAILED RETRY CARD
      return (
        <View style={styles.failedBox}>
          <View style={styles.failedLeft}>
            <Text style={styles.failedText} numberOfLines={1}>
              Upload failed: {file.fileName}
            </Text>
          </View>
          <Pressable onPress={onRetry} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </Pressable>
        </View>
      );
    }

    // UPLOADED SUCCESS STATE
    return (
      <Pressable onPress={handleCardPress} style={styles.uploadedFileRow}>
        <View style={styles.fileInfoLeft}>
          <Text style={styles.uploadedFileName} numberOfLines={1}>
            {file.fileName}
          </Text>
          <Text style={styles.fileSizeText}>
            ({getFriendlySize(file.fileSize)})
          </Text>
        </View>
        <Svg width={9} height={7} viewBox="0 0 9 7">
          <Path d="M1 3.5l2.5 2.5 4.5-5" stroke="#2E7D52" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </Pressable>
    );
  };

  return (
    <View style={styles.cardWrapper}>
      {renderCardContent()}

      {/* OPTIONS ACTION BOTTOM DRAWER MODAL */}
      <Modal
        visible={showOptionsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowOptionsModal(false)} />
          <View style={styles.drawerContainer}>
            <View style={styles.dragBar} />
            <Text style={styles.drawerTitle}>{label}</Text>
            
            <View style={styles.drawerOptions}>
              <Pressable onPress={handleView} style={styles.drawerBtn}>
                <Text style={styles.drawerBtnText}>View Document</Text>
              </Pressable>
              
              <Pressable onPress={handleReplace} style={styles.drawerBtn}>
                <Text style={styles.drawerBtnText}>Replace Document</Text>
              </Pressable>
              
              <Pressable onPress={handleRemove} style={[styles.drawerBtn, styles.drawerRemoveBtn]}>
                <Text style={styles.drawerRemoveText}>Remove Document</Text>
              </Pressable>

              <Pressable onPress={() => setShowOptionsModal(false)} style={styles.drawerCancelBtn}>
                <Text style={styles.drawerCancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* PREVIEW VIEW MODAL */}
      <Modal
        visible={showPreviewModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPreviewModal(false)}
      >
        <View style={styles.previewBackdrop}>
          <View style={styles.previewHeader}>
            <Pressable onPress={() => setShowPreviewModal(false)} style={styles.previewCloseBtn}>
              <Text style={styles.previewCloseText}>Close</Text>
            </Pressable>
            <Text style={styles.previewTitle}>{label} Preview</Text>
          </View>

          <View style={styles.previewBody}>
            {file?.previewUri ? (
              <Image source={{ uri: file.previewUri }} style={styles.previewImage} resizeMode="contain" />
            ) : (
              <View style={styles.pdfPreviewContainer}>
                <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
                  <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#9A5A12" strokeWidth={2} />
                  <Path d="M14 2v6h6" stroke="#9A5A12" strokeWidth={2} />
                </Svg>
                <Text style={styles.pdfText}>{file?.fileName}</Text>
                <Text style={styles.pdfSubtext}>PDF Document ({getFriendlySize(file?.fileSize || 0)})</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    width: '100%',
    marginBottom: 10,
  },
  uploadBox: {
    width: '100%',
    height: 49,
    backgroundColor: '#FBF6EC',
    borderWidth: 1.4,
    borderStyle: 'dashed',
    borderColor: '#C9A877',
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadPlaceholderText: {
    fontSize: 14,
    fontFamily: 'Mukta-Medium',
    fontWeight: '500',
    color: '#9A5A12',
    lineHeight: 23,
  },
  uploadingBox: {
    width: '100%',
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE3CC',
    borderRadius: 11,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  uploadingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  uploadingLabel: {
    fontSize: 13,
    fontFamily: 'Mukta-Medium',
    fontWeight: '500',
    color: '#6B5F4E',
    flex: 1,
    marginRight: 10,
  },
  uploadingPercent: {
    fontSize: 12,
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    color: '#9A5A12',
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#F5ECE0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#E58A2B',
  },
  failedBox: {
    width: '100%',
    height: 49,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  failedLeft: {
    flex: 1,
    marginRight: 10,
  },
  failedText: {
    fontSize: 13,
    fontFamily: 'Mukta-Medium',
    fontWeight: '500',
    color: '#991B1B',
  },
  retryBtn: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#EF4444',
    borderRadius: 6,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
  },
  uploadedFileRow: {
    width: '100%',
    height: 41,
    backgroundColor: '#F1E7D5',
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fileInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  uploadedFileName: {
    fontSize: 14,
    fontFamily: 'Mukta-Regular',
    color: '#3D362E',
    lineHeight: 23,
    maxWidth: '75%',
  },
  fileSizeText: {
    fontSize: 11,
    fontFamily: 'Mukta-Regular',
    color: '#8A7C66',
    marginLeft: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(42, 37, 32, 0.4)',
    justifyContent: 'flex-end',
  },
  drawerContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
    alignItems: 'center',
  },
  dragBar: {
    width: 38,
    height: 4,
    backgroundColor: '#EFE3CC',
    borderRadius: 2,
    marginBottom: 16,
  },
  drawerTitle: {
    fontSize: 15,
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    color: '#2A2520',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  drawerOptions: {
    width: '100%',
    gap: 12,
  },
  drawerBtn: {
    width: '100%',
    height: 50,
    backgroundColor: '#FBF6EC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFE3CC',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  drawerBtnText: {
    fontSize: 14,
    fontFamily: 'Mukta-Medium',
    fontWeight: '500',
    color: '#3D362E',
  },
  drawerRemoveBtn: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  drawerRemoveText: {
    fontSize: 14,
    fontFamily: 'Mukta-Medium',
    fontWeight: '500',
    color: '#991B1B',
  },
  drawerCancelBtn: {
    width: '100%',
    height: 50,
    backgroundColor: '#2A2520',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  drawerCancelText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: '#000000',
  },
  previewHeader: {
    height: 90,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: '#2A2520',
  },
  previewCloseBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
  },
  previewCloseText: {
    color: '#FFFFFF',
    fontFamily: 'Mukta-Medium',
    fontSize: 13,
  },
  previewTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Mukta-SemiBold',
    marginLeft: 30,
  },
  previewBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewImage: {
    width: '100%',
    height: '80%',
  },
  pdfPreviewContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },
  pdfText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Mukta-Medium',
    textAlign: 'center',
  },
  pdfSubtext: {
    color: '#8A7C66',
    fontSize: 13,
    fontFamily: 'Mukta-Regular',
  },
});
export default DocumentUploadCard;
