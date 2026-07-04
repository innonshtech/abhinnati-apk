import React from 'react';
import { StyleSheet, Text, ActivityIndicator, Pressable } from 'react-native';
import { theme } from '../../constants/theme';
import { horizontalScale, verticalScale, moderateScale } from '../../hooks/useScale';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: any;
  textStyle?: any;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';

  const getContainerStyle = () => {
    if (disabled) return styles.disabled;
    if (isPrimary) return styles.primary;
    if (isDanger) return styles.danger;
    return styles.secondary;
  };

  const getTextStyle = () => {
    if (disabled) return styles.disabledText;
    if (isPrimary || isDanger) return styles.primaryText;
    return styles.secondaryText;
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        getContainerStyle(),
        pressed && !disabled && !loading && { transform: [{ scale: 0.96 }] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary || isDanger ? theme.colors.white : theme.colors.charcoal} size="small" />
      ) : (
        <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: verticalScale(50),
    borderRadius: theme.radii.button,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: horizontalScale(24),
    minWidth: horizontalScale(120),
  },
  primary: {
    backgroundColor: theme.colors.charcoal,
  },
  danger: {
    backgroundColor: theme.colors.danger,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.0,
    borderColor: theme.colors.charcoal,
  },
  disabled: {
    backgroundColor: theme.colors.board,
    opacity: 0.6,
  },
  text: {
    fontSize: moderateScale(theme.typography.sizes.label),
    fontWeight: '600',
    fontFamily: theme.typography.fontFamily.semiBold,
    textAlign: 'center',
  },
  primaryText: {
    color: theme.colors.white,
  },
  secondaryText: {
    color: theme.colors.charcoal,
  },
  disabledText: {
    color: theme.colors.textSecondary,
  },
});

export default Button;
