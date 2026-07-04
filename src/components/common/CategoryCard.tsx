import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';

interface CategoryCardProps {
  label: string;
  icon: React.ComponentType<any>;
  onPress?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  label,
  icon: IconComponent,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={styles.iconContainer}>
        <IconComponent
          size={24}
          color={theme.colors.marigoldTintText || '#9A5A12'}
          strokeWidth={2.2}
        />
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '23%',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#FBE7CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: '500',
    fontSize: 10.5,
    lineHeight: 14,
    color: '#3D362E',
    textAlign: 'center',
    includeFontPadding: false,
    marginTop: 2,
  },
});

export default CategoryCard;
