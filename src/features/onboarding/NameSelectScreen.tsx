import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Image, Modal, TouchableWithoutFeedback } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Plus, Camera, Image as ImageIcon, Trash2 } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { RootStackParamList } from '../../navigation/types';
import { api } from '../../api/client';

type NavigationProp = StackNavigationProp<RootStackParamList, 'NameSelect'>;

export const NameSelectScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, login, preferredLanguage } = useAuthStore();
  const isMr = preferredLanguage === 'mr';
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isPhotoSheetVisible, setIsPhotoSheetVisible] = useState(false);
  const nameInputRef = useRef<TextInput>(null);

  const strings = {
    title: isMr ? 'तुमचे नाव काय आहे?' : 'What should we call you?',
    label: isMr ? 'तुमचे नाव' : 'Your name',
    placeholder: isMr ? 'स्नेहा पाटील' : 'Sneha Patil',
    btnContinue: isMr ? 'पुढे जा' : 'Continue',
  };

  const handleContinue = async () => {
    if (!name.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      // Call backend API to update user profile in PostgreSQL database, passing both name and profileImage
      const res = await api.updateProfile({ 
        name: name.trim(),
        profileImage: profileImage
      });
      if (res.success) {
        // Save updated name to auth profile locally in AsyncStorage/Zustand store
        if (user) {
          await login({
            ...user,
            name: res.data?.displayName || name.trim(),
          });
        } else {
          // Fallback if no user exists (developer mode bypass)
          await login({
            id: `user-${Date.now()}`,
            name: res.data?.displayName || name.trim(),
            phone: '+919999999999',
            role: 'resident',
          });
        }
        navigation.navigate('Permissions');
      } else {
        setError(isMr ? 'नाव जतन करण्यात त्रुटी आली. पुन्हा प्रयत्न करा.' : 'Failed to save name. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || (isMr ? 'काहीतरी चुकीचे घडले. पुन्हा प्रयत्न करा.' : 'Something went wrong. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const getNamePreview = (fullName: string) => {
    const trimmed = fullName.trim();
    if (!trimmed) return 'Sneha P.';
    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) {
      return parts[0];
    }
    const firstName = parts[0];
    const lastInitial = parts[1][0] ? `${parts[1][0].toUpperCase()}.` : '';
    return `${firstName} ${lastInitial}`;
  };

  const previewName = getNamePreview(name);
  const noteText = isMr 
    ? `तुमच्या पोस्ट्स आणि रिव्ह्यूवर “${previewName}” असे दिसेल.`
    : `Shown as “${previewName}” on your posts and reviews.`;

  const animatedButtonStyle = useAnimatedStyle(() => {
    const isEnabled = name.trim().length > 0 && !loading;
    return {
      opacity: withTiming(isEnabled ? 1.0 : 0.5, { duration: 250 }),
      transform: [
        { scale: withTiming(isEnabled ? 1.0 : 0.98, { duration: 250 }) }
      ]
    };
  });

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.viewport}>
          
          {/* Back chevron button */}
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={15}
          >
            <View style={styles.backChevron} />
          </Pressable>

          {/* Screen Title */}
          <Text style={styles.title}>{strings.title}</Text>

          {/* Profile Circle Avatar Frame */}
          <Pressable onPress={() => setIsPhotoSheetVisible(true)} style={styles.avatarFrame}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImage} />
            ) : (
              <Plus size={32} color="#9A5A12" strokeWidth={3.0} />
            )}
          </Pressable>

          {/* Add Profile Photo Label Pressable */}
          <Pressable
            onPress={() => setIsPhotoSheetVisible(true)}
            style={styles.addPhotoLabelContainer}
          >
            <Text style={styles.addPhotoLabel}>
              {isMr ? 'प्रोफाईल फोटो जोडा' : 'Add profile photo'}
            </Text>
          </Pressable>

          {/* Name Field Label */}
          <Text style={styles.fieldLabel}>{strings.label}</Text>

          {/* Input Box Card Container */}
          <Pressable
            onPress={() => nameInputRef.current?.focus()}
            style={styles.inputContainer}
          >
            <TextInput
              ref={nameInputRef}
              value={name}
              onChangeText={setName}
              placeholder={strings.placeholder}
              placeholderTextColor="#A89A82"
              maxLength={40}
              style={styles.textInput}
              autoFocus
            />
          </Pressable>

          {/* Name Display Note Description */}
          <Text style={styles.noteText}>{noteText}</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Continue Button */}
          <Animated.View style={[styles.submitButton, animatedButtonStyle]}>
            <Pressable
              onPress={handleContinue}
              disabled={!name.trim() || loading}
              style={styles.pressableButton}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>{strings.btnContinue}</Text>
              )}
            </Pressable>
          </Animated.View>

          {/* 6-Dot Pagination Indicators */}
          <View style={styles.indicatorWrapper}>
            {[0, 1, 2, 3, 4, 5].map((idx) => {
              const isActive = idx === 3; // 4th dot is active
              return (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    isActive ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              );
            })}
          </View>

          {/* Camera/Gallery Selector Bottom Sheet (WhatsApp/Instagram style) */}
          <PhotoUploadBottomSheet
            visible={isPhotoSheetVisible}
            onClose={() => setIsPhotoSheetVisible(false)}
            onCameraPress={async () => {
              setIsPhotoSheetVisible(false);
              setLoading(true);
              await new Promise((r) => setTimeout(r, 800));
              setProfileImage('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80');
              setLoading(false);
            }}
            onGalleryPress={async () => {
              setIsPhotoSheetVisible(false);
              setLoading(true);
              await new Promise((r) => setTimeout(r, 800));
              setProfileImage('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80');
              setLoading(false);
            }}
            onRemovePress={() => {
              setIsPhotoSheetVisible(false);
              setProfileImage(null);
            }}
            hasPhoto={!!profileImage}
            isMr={isMr}
          />

        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF6EC', // Warm cream page background
  },
  flex: {
    flex: 1,
  },
  viewport: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FBF6EC',
  },
  backButton: {
    position: 'absolute',
    left: 22,
    top: 66,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backChevron: {
    width: 8,
    height: 8,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#2A2520',
    transform: [{ rotate: '45deg' }],
  },
  title: {
    position: 'absolute',
    left: 52,
    top: 54,
    height: 37,
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    fontSize: 22,
    lineHeight: 37,
    color: '#2A2520',
    right: 22,
  },
  avatarFrame: {
    position: 'absolute',
    width: 72,
    height: 72,
    left: 156.5,
    top: 125,
    backgroundColor: '#FBE7CC',
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  fieldLabel: {
    position: 'absolute',
    left: 22,
    top: 258,
    height: 22,
    fontFamily: 'Mukta-Medium',
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 22,
    color: '#6B5F4E',
  },
  inputContainer: {
    position: 'absolute',
    left: 22,
    width: 349,
    height: 54,
    top: 288,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0CFB0',
    borderRadius: 12,
    justifyContent: 'center',
  },
  textInput: {
    height: 27,
    fontFamily: 'Mukta-Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 27,
    color: '#2A2520',
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  noteText: {
    position: 'absolute',
    left: 22,
    right: 22,
    top: 356,
    height: 22,
    fontFamily: 'Mukta-Regular',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 22,
    color: '#8A7C66',
  },
  submitButton: {
    position: 'absolute',
    left: 22,
    width: 349,
    height: 50,
    top: 724,
    backgroundColor: '#2A2520',
    borderRadius: 12,
    overflow: 'hidden',
  },
  pressableButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 25,
    color: '#FFFFFF',
  },
  indicatorWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 792,
    height: 7,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
  activeDot: {
    width: 20,
    backgroundColor: '#E58A2B',
  },
  inactiveDot: {
    width: 7,
    backgroundColor: '#E0CFB0',
  },
  errorText: {
    position: 'absolute',
    left: 22,
    right: 22,
    top: 680,
    fontFamily: 'Mukta-Regular',
    fontWeight: '400',
    fontSize: 14,
    color: '#D32F2F', // Red error text
    textAlign: 'center',
  },
  addPhotoLabelContainer: {
    position: 'absolute',
    left: 22,
    right: 22,
    top: 207,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoLabel: {
    textAlign: 'center',
    fontFamily: 'Mukta-Medium',
    fontWeight: '500',
    fontSize: 14,
    color: '#9A5A12',
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(26, 23, 20, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    alignItems: 'center',
    width: '100%',
  },
  sheetDragHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#D8CDB8',
    marginBottom: 20,
    opacity: 0.8,
  },
  sheetTitle: {
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 28,
    color: '#2A2520',
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  sheetRow: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    gap: 32,
  },
  sheetOption: {
    alignItems: 'center',
  },
  sheetIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  sheetOptionText: {
    fontFamily: 'Mukta-Regular',
    fontSize: 13,
    lineHeight: 18,
    color: '#6B5F4E',
  },
});

interface PhotoUploadBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onCameraPress: () => void;
  onGalleryPress: () => void;
  onRemovePress: () => void;
  hasPhoto: boolean;
  isMr: boolean;
}

const PhotoUploadBottomSheet: React.FC<PhotoUploadBottomSheetProps> = ({
  visible,
  onClose,
  onCameraPress,
  onGalleryPress,
  onRemovePress,
  hasPhoto,
  isMr,
}) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.sheetBackdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              <View style={styles.sheetDragHandle} />
              
              <Text style={styles.sheetTitle}>
                {isMr ? 'प्रोफाईल फोटो' : 'Profile photo'}
              </Text>
              
              <View style={styles.sheetRow}>
                {/* Camera Option */}
                <View style={styles.sheetOption}>
                  <Pressable onPress={onCameraPress} style={[styles.sheetIconCircle, { backgroundColor: '#E8F5E9' }]}>
                    <Camera size={24} color="#2E7D52" />
                  </Pressable>
                  <Text style={styles.sheetOptionText}>
                    {isMr ? 'कॅमेरा' : 'Camera'}
                  </Text>
                </View>

                {/* Gallery Option */}
                <View style={styles.sheetOption}>
                  <Pressable onPress={onGalleryPress} style={[styles.sheetIconCircle, { backgroundColor: '#E3F2FD' }]}>
                    <ImageIcon size={24} color="#1565C0" />
                  </Pressable>
                  <Text style={styles.sheetOptionText}>
                    {isMr ? 'गॅलरी' : 'Gallery'}
                  </Text>
                </View>

                {/* Remove Option (Conditional) */}
                {hasPhoto && (
                  <View style={styles.sheetOption}>
                    <Pressable onPress={onRemovePress} style={[styles.sheetIconCircle, { backgroundColor: '#FFEBEE' }]}>
                      <Trash2 size={24} color="#C62828" />
                    </Pressable>
                    <Text style={styles.sheetOptionText}>
                      {isMr ? 'काढून टाका' : 'Remove'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default NameSelectScreen;
