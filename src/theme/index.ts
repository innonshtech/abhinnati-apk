import colors from './colors';
import spacing from './spacing';
import typography from './typography';
import radius from './radius';

export const theme = {
  colors,
  spacing,
  typography,
  radius,
  shadows: {
    low: {
      shadowColor: colors.charcoal,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    high: {
      shadowColor: colors.charcoal,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.08,
      shadowRadius: 15,
      elevation: 8,
    },
  },
};

export default theme;
export * from './colors';
export * from './spacing';
export * from './typography';
export * from './radius';
