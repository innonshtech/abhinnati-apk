import React from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import { theme } from '../../constants/theme';
import { horizontalScale, verticalScale } from '../../hooks/useScale';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  elevation?: 'low' | 'high';
  style?: any;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  elevation = 'low',
  style,
}) => {
  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      style={[
        styles.card,
        elevation === 'high' ? theme.shadows.high : theme.shadows.low,
        style,
      ]}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.card,
    padding: horizontalScale(16),
    marginVertical: verticalScale(8),
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
});

export default Card;
