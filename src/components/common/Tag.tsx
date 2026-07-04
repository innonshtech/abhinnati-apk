import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../constants/theme';
import { horizontalScale, verticalScale, moderateScale } from '../../hooks/useScale';

interface TagProps {
  text: string;
  variant?: 'spotlight' | 'local_issue' | 'community' | 'neutral' | 'success';
  icon?: React.ReactNode;
  style?: any;
  textStyle?: any;
}

export const Tag: React.FC<TagProps> = ({
  text,
  variant = 'neutral',
  icon,
  style,
  textStyle,
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'spotlight':
        return {
          container: styles.spotlightContainer,
          text: styles.spotlightText,
        };
      case 'local_issue':
        return {
          container: styles.localIssueContainer,
          text: styles.localIssueText,
        };
      case 'community':
        return {
          container: styles.communityContainer,
          text: styles.communityText,
        };
      case 'success':
        return {
          container: styles.successContainer,
          text: styles.successText,
        };
      case 'neutral':
      default:
        return {
          container: styles.neutralContainer,
          text: styles.neutralText,
        };
    }
  };

  const currentStyles = getStyles();

  return (
    <View style={[styles.tag, currentStyles.container, style]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[styles.text, currentStyles.text, textStyle]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: verticalScale(4),
    paddingHorizontal: horizontalScale(10),
    borderRadius: theme.radii.pill,
  },
  iconContainer: {
    marginRight: horizontalScale(4),
  },
  text: {
    fontSize: moderateScale(theme.typography.sizes.micro),
    fontWeight: '600',
    fontFamily: theme.typography.fontFamily.semiBold,
  },
  spotlightContainer: {
    backgroundColor: theme.colors.marigoldTintBg,
  },
  spotlightText: {
    color: theme.colors.marigoldTintText,
  },
  localIssueContainer: {
    backgroundColor: '#F1E7D5',
  },
  localIssueText: {
    color: '#6B5F4E',
  },
  communityContainer: {
    backgroundColor: '#F1E7D5',
  },
  communityText: {
    color: '#6B5F4E',
  },
  successContainer: {
    backgroundColor: theme.colors.successBg,
  },
  successText: {
    color: theme.colors.success,
  },
  neutralContainer: {
    backgroundColor: theme.colors.board,
  },
  neutralText: {
    color: theme.colors.textSecondary,
  },
});

export default Tag;
