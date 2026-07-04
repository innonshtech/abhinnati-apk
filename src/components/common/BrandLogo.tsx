import React from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';

interface BrandLogoProps {
  size?: number;
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 166, showText = true }) => {
  const logoImg = require('../../../assets/logo.png');
  
  // Scale proportionally to match the Figma spec (166 width x 159 height box)
  const scale = size / 166;
  const imgWidth = size;
  const imgHeight = size * (138 / 166);
  
  return (
    <View style={[styles.container, { width: size }]}>
      <Image
        source={logoImg}
        style={{ width: imgWidth, height: imgHeight }}
        resizeMode="contain"
      />
      {showText && (
        <View style={[styles.textContainer, { marginTop: 6 * scale }]}>
          <Text style={[styles.subTextNavy, { fontSize: 15 * scale }]}>अभिजात </Text>
          <Text style={[styles.subTextOrange, { fontSize: 15 * scale }]}>उन्नती</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subTextNavy: {
    fontWeight: '600',
    color: '#1A335E', // Navy Blue color matching the logo "abhi" part
    letterSpacing: 0.2,
  },
  subTextOrange: {
    fontWeight: '600',
    color: '#E58A2B', // Marigold color matching the logo "nnati" part
    letterSpacing: 0.2,
  },
});

export default BrandLogo;


