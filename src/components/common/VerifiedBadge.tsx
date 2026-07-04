import React from 'react';
import { BadgeCheck } from 'lucide-react-native';
import { theme } from '../../constants/theme';

interface VerifiedBadgeProps {
  size?: number;
  color?: string;
  style?: any;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  size = 18,
  color = theme.colors.white,
  style,
}) => {
  return (
    <BadgeCheck
      size={size}
      color={color}
      fill={theme.colors.marigold} // Marigold rosette fill
      style={style}
    />
  );
};

export default VerifiedBadge;
