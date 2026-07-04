import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuthStore } from '../../store/useAuthStore';
import { RootStackParamList } from '../../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../api/client';
import { CustomChevronLeft } from '../../components/common/Icons';
import Svg, { Rect, Path } from 'react-native-svg';
import { Plus, X } from 'lucide-react-native';

type NavigationProp = StackNavigationProp<RootStackParamList, 'WriteReview'>;
type RouteProps = RouteProp<RootStackParamList, 'WriteReview'>;

const RatingStar: React.FC<{ size?: number; color?: string; fill?: string }> = ({
  size = 28,
  color = '#D8C29A',
  fill = 'transparent'
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      stroke={color}
      strokeWidth={1.8}
      fill={fill}
      strokeLinejoin="round"
    />
  </Svg>
);

export const WriteReviewScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { bookingId, initialRating, businessName } = route.params;
  const { preferredLanguage } = useAuthStore();

  const [rating, setRating] = useState<number>(initialRating || 4); // Default 4 stars or initialRating
  const [reviewText, setReviewText] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handlePhotoUploadPress = () => {
    Alert.alert(
      isMr ? 'फोटो जोडा' : 'Add Photo',
      isMr ? 'फोटो घेण्यासाठी स्त्रोत निवडा' : 'Choose source for photo',
      [
        {
          text: isMr ? 'कॅमेरा' : 'Camera',
          onPress: async () => {
            setUploading(true);
            // Simulate camera capture latency
            await new Promise((r) => setTimeout(r, 800));
            setImageUrl('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&q=80');
            setUploading(false);
          },
        },
        {
          text: isMr ? 'गॅलरीतून निवडा' : 'Choose from Gallery',
          onPress: async () => {
            setUploading(true);
            // Simulate gallery picker latency
            await new Promise((r) => setTimeout(r, 800));
            setImageUrl('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80');
            setUploading(false);
          },
        },
        {
          text: isMr ? 'रद्द करा' : 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const isMr = preferredLanguage === 'mr';

  const strings = {
    title: isMr ? 'रिव्ह्यू लिहा' : 'Write Review',
    yourRating: isMr ? 'तुमचे रेटिंग' : 'Your rating',
    yourReview: isMr ? 'तुमचा अभिप्राय' : 'Your review',
    placeholder: isMr ? 'तुमचा अनुभव शेअर करा...' : 'Share your experience...',
    addPhoto: isMr ? 'फोटो जोडा' : 'Add photo',
    submit: isMr ? 'रिव्ह्यू सबमिट करा' : 'Submit review',
    success: isMr ? 'रिव्ह्यू यशस्वीरित्या सबमिट केला!' : 'Review submitted successfully!',
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.submitReview(bookingId, rating, reviewText);
      Alert.alert(isMr ? 'धन्यवाद' : 'Thank you', strings.success);
      navigation.navigate('ResidentMain');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header section */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={15}>
          <CustomChevronLeft size={20} color="#2A2520" strokeWidth={3} />
          <Text style={styles.backText}>{strings.title}</Text>
        </Pressable>
      </View>

      {/* Header Divider */}
      <View style={styles.headerDivider} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Business Logo & Name Section */}
        <View style={styles.businessContainer}>
          <View style={styles.logoFrame}>
            <Svg width={40} height={40}>
              <Rect width={40} height={40} rx={12} fill="#FDF1DF" />
              <Path
                d="M12 28a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4"
                stroke="#9A5A12"
                strokeWidth={2}
                fill="none"
              />
              <Path
                d="M20 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                stroke="#9A5A12"
                strokeWidth={2}
                fill="none"
              />
            </Svg>
          </View>
          <Text style={styles.businessName}>{businessName || 'Aai’s Bakery'}</Text>
        </View>

        {/* Your Rating Selector */}
        <Text style={styles.sectionLabel}>{strings.yourRating}</Text>
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((star) => {
            const isActive = star <= rating;
            return (
              <Pressable key={star} onPress={() => setRating(star)} style={styles.starBox}>
                <RatingStar
                  size={30}
                  color={isActive ? '#E58A2B' : '#D8C29A'}
                  fill={isActive ? '#E58A2B' : 'transparent'}
                />
              </Pressable>
            );
          })}
        </View>

        {/* Your Review Textbox */}
        <Text style={[styles.sectionLabel, styles.marginReview]}>{strings.yourReview}</Text>
        <View style={styles.inputCard}>
          <TextInput
            value={reviewText}
            onChangeText={setReviewText}
            placeholder={strings.placeholder}
            placeholderTextColor="#A89A82"
            multiline
            numberOfLines={5}
            style={styles.textInput}
          />
        </View>

        {/* Photo Upload Card */}
        {imageUrl ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: imageUrl }} style={styles.previewImage} />
            <Pressable onPress={() => setImageUrl(null)} style={styles.removeImageBtn} hitSlop={10}>
              <X size={12} color="#FFFFFF" strokeWidth={2.5} />
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={handlePhotoUploadPress} disabled={uploading} style={styles.uploadCard}>
            {uploading ? (
              <ActivityIndicator size="small" color="#9A5A12" />
            ) : (
              <View style={styles.uploadInner}>
                <Plus size={16} color="#9A5A12" strokeWidth={3} />
                <Text style={styles.uploadText}>{strings.addPhoto}</Text>
              </View>
            )}
          </Pressable>
        )}
      </ScrollView>

      {/* Bottom Submit Button */}
      <View style={styles.footer}>
        <Pressable onPress={handleSubmit} disabled={submitting || !reviewText.trim()} style={[styles.submitBtn, (!reviewText.trim() || submitting) && styles.submitBtnDisabled]}>
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>{strings.submit}</Text>
          )}
        </Pressable>
      </View>
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
    height: 98,
    backgroundColor: '#FBF6EC',
    zIndex: 10,
  },
  backBtn: {
    position: 'absolute',
    left: 22,
    top: 58,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 15,
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    color: '#2A2520',
    marginLeft: 6,
    lineHeight: 25,
  },
  headerDivider: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 98,
    height: 1,
    backgroundColor: '#EFE3CC',
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 114, // 98 header + 16 padding
    paddingBottom: 120,
  },
  businessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 26,
  },
  logoFrame: {
    width: 40,
    height: 40,
    borderRadius: 12,
    overflow: 'hidden',
  },
  businessName: {
    fontSize: 15,
    fontFamily: 'Mukta-Bold',
    fontWeight: '600',
    color: '#2A2520',
    marginLeft: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    color: '#6B5F4E',
    marginBottom: 2,
  },
  marginReview: {
    marginTop: 24,
  },
  starRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  starBox: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputCard: {
    width: '100%',
    height: 140,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE3CC',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 2,
  },
  textInput: {
    fontSize: 14,
    fontFamily: 'Mukta-Regular',
    color: '#2A2520',
    textAlignVertical: 'top',
    height: '100%',
    padding: 0,
  },
  uploadCard: {
    width: 100,
    height: 100,
    backgroundColor: '#FBF6EC',
    borderWidth: 1.4,
    borderStyle: 'dashed',
    borderColor: '#C9A877',
    borderRadius: 12,
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadInner: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 11,
    fontFamily: 'Mukta-Medium',
    fontWeight: '500',
    color: '#9A5A12',
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
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 15,
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default WriteReviewScreen;
