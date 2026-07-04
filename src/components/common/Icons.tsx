import React from 'react';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

interface CustomHomeIconProps {
  isFocused: boolean;
  size?: number;
}

export const CustomHomeIcon: React.FC<CustomHomeIconProps> = ({ isFocused, size = 20 }) => {
  const strokeColor = '#2A2520';
  const roofFill = isFocused ? '#E58A2B' : 'transparent';
  const bodyFill = isFocused ? '#E58A2B' : 'transparent';
  const doorFill = isFocused ? '#FFFFFF' : 'transparent';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* House Body */}
      <Path
        d="M5 9h14v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9Z"
        fill={bodyFill}
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* House Door */}
      <Path
        d="M9 22v-6a3 3 0 0 1 6 0v6Z"
        fill={doorFill}
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* House Roof */}
      <Path
        d="M3 9 12 2l9 7Z"
        fill={roofFill}
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

interface CustomSearchIconProps {
  isFocused: boolean;
  size?: number;
}

export const CustomSearchIcon: React.FC<CustomSearchIconProps> = ({ isFocused, size = 20 }) => {
  const strokeColor = '#3D362E';
  const circleFill = isFocused ? '#E58A2B' : 'transparent';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Search Lens */}
      <Circle
        cx="11"
        cy="11"
        r="7"
        fill={circleFill}
        stroke={strokeColor}
        strokeWidth={2}
      />
      {/* Handle */}
      <Path
        d="m21 21-4.3-4.3"
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
};

interface CustomCalendarIconProps {
  isFocused: boolean;
  size?: number;
}

export const CustomCalendarIcon: React.FC<CustomCalendarIconProps> = ({ isFocused, size = 20 }) => {
  const strokeColor = '#3D362E';

  if (isFocused) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="4" width="18" height="16" rx="2" stroke={strokeColor} strokeWidth={2} />
        <Path d="M3 4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4H3V4Z" fill="#3D362E" />
        <Path d="M3 8h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z" fill="#E58A2B" />
        <Line x1="3" y1="8" x2="21" y2="8" stroke={strokeColor} strokeWidth={2} />
        <Path d="M8 2v4M16 2v4" stroke={strokeColor} strokeWidth={2} strokeLinecap="round" />
        
        <Rect x="6" y="11" width="2" height="2" fill="#FFFFFF" />
        <Rect x="11" y="11" width="2" height="2" fill="#FFFFFF" />
        <Rect x="16" y="11" width="2" height="2" fill="#FFFFFF" />
        <Rect x="6" y="15" width="2" height="2" fill="#FFFFFF" />
        <Rect x="11" y="15" width="2" height="2" fill="#FFFFFF" />
        <Rect x="16" y="15" width="2" height="2" fill="#FFFFFF" />
      </Svg>
    );
  } else {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="4" width="18" height="16" rx="2" stroke={strokeColor} strokeWidth={2} />
        <Line x1="3" y1="8" x2="21" y2="8" stroke={strokeColor} strokeWidth={2} />
        <Path d="M8 2v4M16 2v4" stroke={strokeColor} strokeWidth={2} strokeLinecap="round" />
        
        <Rect x="6" y="11" width="2" height="2" fill="#6B5F4E" />
        <Rect x="11" y="11" width="2" height="2" fill="#6B5F4E" />
        <Rect x="16" y="11" width="2" height="2" fill="#6B5F4E" />
        <Rect x="6" y="15" width="2" height="2" fill="#6B5F4E" />
        <Rect x="11" y="15" width="2" height="2" fill="#6B5F4E" />
        <Rect x="16" y="15" width="2" height="2" fill="#6B5F4E" />
      </Svg>
    );
  }
};

interface CustomProfileIconProps {
  isFocused: boolean;
  size?: number;
}

export const CustomProfileIcon: React.FC<CustomProfileIconProps> = ({ isFocused, size = 20 }) => {
  const strokeColor = '#3D362E';
  const fill = isFocused ? '#E58A2B' : 'transparent';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="7"
        r="4"
        fill={fill}
        stroke={strokeColor}
        strokeWidth={2}
      />
      <Path
        d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
        fill={fill}
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

interface SproutIconProps {
  size?: number;
}

export const SproutIcon: React.FC<SproutIconProps> = ({ size = 40 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Stem */}
    <Path
      d="M12 22V13"
      stroke="#D07A25"
      strokeWidth={2.5}
      strokeLinecap="round"
    />
    {/* Left Leaf */}
    <Path
      d="M12 14C9 14 5 12.5 5 9C5 5.5 8.5 5 12 8.5"
      stroke="#D07A25"
      strokeWidth={2.5}
      fill="#D07A25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Right Leaf */}
    <Path
      d="M12 14C15 14 19 12.5 19 9C19 5.5 15.5 5 12 8.5"
      stroke="#D07A25"
      strokeWidth={2.5}
      fill="#D07A25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface CustomChevronLeftProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const CustomChevronLeft: React.FC<CustomChevronLeftProps> = ({
  size = 24,
  color = '#2A2520',
  strokeWidth = 3,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 19l-7-7 7-7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

interface CustomChevronRightProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const CustomChevronRight: React.FC<CustomChevronRightProps> = ({
  size = 24,
  color = '#C9A877',
  strokeWidth = 3,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 5l7 7-7 7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

interface CustomBellIconProps {
  size?: number;
  color?: string;
}

export const CustomBellIcon: React.FC<CustomBellIconProps> = ({
  size = 24,
  color = '#E58A2B',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
        fill={color}
      />
    </Svg>
  );
};
