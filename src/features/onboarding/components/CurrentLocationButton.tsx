import React from 'react';
import { StyleSheet, Text, Pressable } from 'react-native';

interface CurrentLocationButtonProps {
  onPress: () => void;
  loading: boolean;
  isMarathi: boolean;
}

export const CurrentLocationButton: React.FC<CurrentLocationButtonProps> = ({
  onPress,
  loading,
  isMarathi,
}) => {
  const strings = {
    btnText: isMarathi ? 'माझे चालू लोकेशन वापरा' : 'Use current location',
    detectingText: isMarathi ? 'लोकेशन शोधत आहे...' : 'Detecting your location...',
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.gpsLinkFrame,
        pressed && styles.pressed,
        loading && styles.disabled,
      ]}
      accessibilityLabel={loading ? strings.detectingText : strings.btnText}
      accessibilityRole="button"
    >
      <Text style={styles.gpsLinkText}>
        {loading ? strings.detectingText : strings.btnText}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  gpsLinkFrame: {
    height: 25,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 13,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.8,
  },
  gpsLinkText: {
    fontSize: 15,
    fontFamily: 'Mukta-Medium',
    fontWeight: '500',
    color: '#9A5A12',
    lineHeight: 25,
  },
});

export default CurrentLocationButton;
