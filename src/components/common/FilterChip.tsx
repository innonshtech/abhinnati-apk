import React from 'react';
import { Pressable, StyleSheet, Text, GestureResponderEvent } from 'react-native';
import { Star } from 'lucide-react-native';
import { theme } from '../../theme';

interface FilterChipProps {
  label: string;
  isActive?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  showStar?: boolean;
  isStaticLabel?: boolean; // True for the first "Filters" label chip
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  isActive = false,
  onPress,
  showStar = false,
  isStaticLabel = false,
}) => {
  // Determine styles based on active and static state
  const bgStyle = isStaticLabel
    ? styles.staticBg
    : isActive
    ? styles.activeBg
    : styles.inactiveBg;

  const textStyle = isStaticLabel
    ? styles.staticText
    : isActive
    ? styles.activeText
    : styles.inactiveText;

  const starColor = isActive ? theme.colors.white : theme.colors.orange;

  return (
    <Pressable
      onPress={isStaticLabel ? undefined : onPress}
      disabled={isStaticLabel}
      style={({ pressed }) => [
        styles.chip,
        bgStyle,
        !isStaticLabel && pressed && { opacity: 0.8 },
      ]}
    >
      {showStar && (
        <Star
          size={12}
          color={starColor}
          fill={starColor}
          style={styles.starIcon}
        />
      )}
      <Text style={[styles.text, textStyle]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    height: 32,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  staticBg: {
    backgroundColor: '#2A2520',
    borderColor: '#2A2520',
  },
  activeBg: {
    backgroundColor: '#2A2520',
    borderColor: '#2A2520',
  },
  inactiveBg: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0CFB0',
  },
  text: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    lineHeight: 20,
    includeFontPadding: false,
  },
  staticText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activeText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  inactiveText: {
    fontWeight: '400',
    color: '#3D362E',
  },
  starIcon: {
    marginRight: 4,
  },
});

export default FilterChip;
