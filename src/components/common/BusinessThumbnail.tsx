import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { theme } from '../../theme';

interface BusinessThumbnailProps {
  width: number;
  height: number;
  borderRadius?: number;
  colors?: string[]; // e.g. ['#FBE7CC', '#FFF0DC']
  style?: StyleProp<ViewStyle>;
}

export const BusinessThumbnail: React.FC<BusinessThumbnailProps> = ({
  width,
  height,
  borderRadius = theme.radius.button,
  colors,
  style,
}) => {
  // Select gradient colors based on passed values or defaults
  const gradientColors = colors && colors.length > 0
    ? colors
    : [theme.colors.peachBg, '#FFF0DC'];

  return (
    <View style={[{ width, height, borderRadius, overflow: 'hidden' }, style]}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="90%" y2="100%">
            <Stop offset="0%" stopColor={gradientColors[0]} stopOpacity="1" />
            <Stop offset="71.43%" stopColor={gradientColors[1] || gradientColors[0]} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#grad)" />
      </Svg>
    </View>
  );
};

export default BusinessThumbnail;
