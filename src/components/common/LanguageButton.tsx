import React from 'react';
import { Pressable, StyleSheet, Text, GestureResponderEvent } from 'react-native';
import { theme } from '../../theme';

interface LanguageButtonProps {
  language: 'en' | 'mr';
  onPress: (event: GestureResponderEvent) => void;
  backgroundColor?: string;
}

export const LanguageButton: React.FC<LanguageButtonProps> = ({
  language,
  onPress,
  backgroundColor = theme.colors.white,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, opacity: pressed ? 0.7 : 1.0 },
      ]}
    >
      <Text style={styles.text}>
        {language === 'mr' ? 'म' : 'EN'}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 26,
    borderWidth: 1.0,
    borderColor: theme.colors.borderMedium,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.caption,
    lineHeight: theme.typography.lineHeights.caption,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
});

export default LanguageButton;
