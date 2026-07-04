import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle, StyleProp } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import BusinessThumbnail from './BusinessThumbnail';
import VerifiedBadge from './VerifiedBadge';
import Rating from './Rating';
import { theme } from '../../theme';

interface BusinessCardProps {
  layout: 'grid' | 'list';
  title: string;
  category?: string;
  distance?: string;
  rating?: number;
  reviewsCount?: number;
  isVerified?: boolean;
  thumbnailColors?: string[];
  onPress?: () => void;
  showViewButton?: boolean; // Displays "View" button for Search page
  viewButtonText?: string;
  onViewPress?: () => void;
  style?: StyleProp<ViewStyle>;
  showNewBadge?: boolean;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  layout,
  title,
  category,
  distance,
  rating,
  reviewsCount = 0,
  isVerified = false,
  thumbnailColors,
  onPress,
  showViewButton = false,
  viewButtonText = 'View',
  onViewPress,
  style,
  showNewBadge = false,
}) => {
  if (layout === 'grid') {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.gridCard,
          pressed && { opacity: 0.9 },
          style,
        ]}
      >
        <BusinessThumbnail
          width={170}
          height={64}
          borderRadius={0}
          colors={thumbnailColors}
          style={styles.gridCover}
        />
        {showNewBadge && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
        <View style={styles.gridInfoContainer}>
          <Text style={styles.gridTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.gridSubtitle} numberOfLines={1}>
            {category} {distance ? `· ${distance}` : ''}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.listCard,
        pressed && { opacity: 0.9 },
        style,
      ]}
    >
      {/* Thumbnail Left */}
      <BusinessThumbnail
        width={44}
        height={44}
        borderRadius={12}
        colors={thumbnailColors}
        style={styles.listThumbnail}
      />

      {/* Center content */}
      <View style={styles.listContent}>
        <View style={styles.nameRow}>
          <Text style={styles.listTitle} numberOfLines={1}>
            {title}
          </Text>
          {isVerified && <VerifiedBadge />}
          {showNewBadge && (
            <View style={styles.listNewBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
        </View>

        {rating !== undefined ? (
          <View style={styles.ratingRow}>
            <Rating
              rating={rating}
              reviewsCount={reviewsCount}
              showReviews={true}
              size={12}
              textColor={theme.colors.textSecondary}
            />
            <Text style={styles.listSubtitle}>
              {category ? ` · ${category}` : ''}
              {distance ? ` · ${distance}` : ''}
            </Text>
          </View>
        ) : (
          <Text style={styles.listSubtitle} numberOfLines={1}>
            {category} {distance ? `· ${distance}` : ''}
          </Text>
        )}
      </View>

      {/* Right Action */}
      {showViewButton ? (
        <Pressable
          onPress={onViewPress || onPress}
          style={({ pressed }) => [
            styles.viewBtn,
            pressed && { backgroundColor: theme.colors.borderLight },
          ]}
        >
          <Text style={styles.viewBtnText}>{viewButtonText}</Text>
        </Pressable>
      ) : (
        <ChevronRight
          size={14}
          color={theme.colors.textTertiary}
          style={styles.chevron}
        />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  // Grid layout styles
  gridCard: {
    width: 170,
    height: 116,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE3CC',
    borderRadius: 16,
    overflow: 'hidden',
  },
  gridCover: {
    width: '100%',
    height: 64,
  },
  gridInfoContainer: {
    paddingHorizontal: 11,
    paddingTop: 8,
    paddingBottom: 4,
    justifyContent: 'flex-start',
  },
  gridTitle: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: '#2A2520',
    fontWeight: '600',
    includeFontPadding: false,
  },
  gridSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    color: '#8A7C66',
    marginTop: 0,
    includeFontPadding: false,
  },

  // List layout styles
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    height: 64,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#EFE3CC',
    width: '100%',
  },
  listThumbnail: {
    marginRight: 13,
  },
  listContent: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    gap: 6,
  },
  listTitle: {
    fontSize: 15,
    lineHeight: 25,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: '600',
    color: '#2A2520',
    includeFontPadding: false,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listSubtitle: {
    fontSize: 13,
    lineHeight: 22,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#6B5F4E',
    includeFontPadding: false,
  },
  chevron: {
    marginLeft: 8,
    color: '#C2B193',
  },
  viewBtn: {
    borderWidth: 1.5,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.white,
    width: 72,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  viewBtnText: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: '600',
    color: theme.colors.charcoal,
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#DA2525',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    zIndex: 10,
  },
  listNewBadge: {
    backgroundColor: '#DA2525',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    marginLeft: 6,
  },
  newBadgeText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: '700',
    fontSize: 9,
    lineHeight: 12,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

export default BusinessCard;
