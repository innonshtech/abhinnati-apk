import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Star } from 'lucide-react-native';
import { theme } from '../../theme';

interface RatingProps {
  rating: number;
  reviewsCount?: number;
  textColor?: string;
  size?: number;
  showReviews?: boolean;
}

export const Rating: React.FC<RatingProps> = ({
  rating,
  reviewsCount = 0,
  textColor = theme.colors.textSecondary,
  size = 15,
  showReviews = true,
}) => {
  return (
    <View style={styles.container}>
      <Star
        size={size}
        color={theme.colors.orange}
        fill={theme.colors.orange}
        style={styles.star}
      />
      <Text style={[styles.text, { color: textColor }]}>
        {rating.toFixed(1)}
        {showReviews ? ` (${reviewsCount})` : ''}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 4,
  },
  text: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.lineHeights.small,
  },
});

export default Rating;
