import { theme as newTheme } from '../theme';

export const colors = newTheme.colors;
export const spacing = newTheme.spacing;
export const radii = {
  card: newTheme.radius.cardGrid,
  button: newTheme.radius.button,
  chip: newTheme.radius.chip,
  pill: newTheme.radius.activePill,
  avatar: 9999,
  screen: 47,
};
export const shadows = newTheme.shadows;
export const typography = newTheme.typography;

export const theme = {
  colors,
  spacing,
  radii,
  shadows,
  typography,
};

export default theme;
