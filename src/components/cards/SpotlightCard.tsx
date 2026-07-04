import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { Sparkles, MapPin } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { horizontalScale, verticalScale, moderateScale } from '../../hooks/useScale';
import Card from '../common/Card';
import Tag from '../common/Tag';
import VerifiedBadge from '../common/VerifiedBadge';
import Button from '../common/Button';
import { useAuthStore } from '../../store/useAuthStore';

interface SpotlightCardProps {
  businessName: string;
  category: string;
  distance: string;
  imageUrl?: string;
  rating?: number;
  onBook: () => void;
  onView: () => void;
  style?: any;
}

const translateDistance = (distStr: string, isMrLanguage: boolean) => {
  if (isMrLanguage || !distStr) return distStr;
  const marathiDigits = [/०/g, /१/g, /२/g, /३/g, /४/g, /५/g, /६/g, /७/g, /८/g, /९/g];
  let result = distStr;
  for (let i = 0; i < 10; i++) {
    result = result.replace(marathiDigits[i], String(i));
  }
  return result.replace('किमी', 'km').trim();
};

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  businessName,
  category,
  distance,
  imageUrl,
  rating,
  onBook,
  onView,
  style,
}) => {
  const { preferredLanguage } = useAuthStore();
  const isMr = preferredLanguage === 'mr';
  const displayDistance = translateDistance(distance, isMr);

  return (
    <Card elevation="high" style={[styles.card, style]}>
      {/* Spotlight header tag */}
      <View style={styles.header}>
        <Tag
          text={isMr ? "नवीन व्यावसायिक" : "New in your area"}
          variant="spotlight"
          icon={<Sparkles size={12} color={theme.colors.marigoldTintText} />}
          style={{ borderRadius: 8 }}
        />
        <View style={styles.distanceBadge}>
          <MapPin size={12} color={theme.colors.textSecondary} style={styles.pinIcon} />
          <Text style={styles.distanceText}>{displayDistance}</Text>
        </View>
      </View>

      {/* Main 16:9 Image */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Sparkles size={32} color={theme.colors.marigold} />
            <Text style={styles.placeholderText}>{category}</Text>
          </View>
        )}
      </View>

      {/* Metadata */}
      <View style={styles.infoContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.businessName}>{businessName}</Text>
          <VerifiedBadge size={16} style={styles.badge} />
        </View>
        
        <Text style={styles.metaText}>
          {category} • {isMr ? 'नुकतेच जोडले गेले' : 'Just Joined'} • {displayDistance}
        </Text>
      </View>

      {/* Bottom Action buttons */}
      <View style={styles.buttonRow}>
        <Button
          title={isMr ? "पहा" : "View"}
          variant="secondary"
          onPress={onView}
          style={styles.viewButton}
          textStyle={styles.viewButtonText}
        />
        <Button
          title={isMr ? "बुक करा" : "Book"}
          variant="primary"
          onPress={onBook}
          style={styles.bookButton}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 18,
    marginVertical: verticalScale(10),
    backgroundColor: theme.colors.white,
    paddingHorizontal: 12,
    paddingVertical: verticalScale(14),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EFE3CC',
    shadowColor: '#292421',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pinIcon: {
    marginRight: horizontalScale(2),
  },
  distanceText: {
    fontSize: moderateScale(theme.typography.sizes.caption),
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textSecondary,
  },
  imageContainer: {
    width: '100%',
    height: verticalScale(118),
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: verticalScale(12),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F6E2C4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(theme.typography.sizes.caption),
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textSecondary,
  },
  infoContainer: {
    marginBottom: verticalScale(10),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  businessName: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    fontFamily: theme.typography.fontFamily.semiBold,
    color: '#2A2520',
  },
  badge: {
    marginLeft: horizontalScale(6),
  },
  metaText: {
    fontSize: moderateScale(14),
    fontFamily: theme.typography.fontFamily.regular,
    color: '#6B5F4E',
    lineHeight: 23,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 9,
  },
  viewButton: {
    width: 162,
    height: 44,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D8C29A',
    borderRadius: 12,
    minWidth: 0,
    paddingHorizontal: 0,
  },
  viewButtonText: {
    fontSize: moderateScale(14),
    fontFamily: theme.typography.fontFamily.semiBold,
    color: '#2A2520',
  },
  bookButton: {
    width: 162,
    height: 44,
    backgroundColor: '#2A2520',
    borderRadius: 12,
    minWidth: 0,
    paddingHorizontal: 0,
  },
});

export default SpotlightCard;
