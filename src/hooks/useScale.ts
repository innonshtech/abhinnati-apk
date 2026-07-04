import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Reference dimensions from Figma design handoff
const REF_WIDTH = 393;
const REF_HEIGHT = 852;

export const horizontalScale = (size: number) => {
  return PixelRatio.roundToNearestPixel(size * (SCREEN_WIDTH / REF_WIDTH));
};

export const verticalScale = (size: number) => {
  return PixelRatio.roundToNearestPixel(size * (SCREEN_HEIGHT / REF_HEIGHT));
};

export const moderateScale = (size: number, factor = 0.5) => {
  return PixelRatio.roundToNearestPixel(size + (horizontalScale(size) - size) * factor);
};

export const useScale = () => {
  return {
    s: horizontalScale,
    vs: verticalScale,
    ms: moderateScale,
    screenWidth: SCREEN_WIDTH,
    screenHeight: SCREEN_HEIGHT,
  };
};

export default useScale;
