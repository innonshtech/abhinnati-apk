import React from 'react';
import Svg, { Rect, Path, Circle, Polygon, Polyline, G } from 'react-native-svg';

interface IconProps {
  color?: string;
  size?: number;
}

// 1. Home Services Icon (House with Roof & Door)
export const CategoryHomeIcon: React.FC<IconProps> = ({ color = '#9A5A12' }) => (
  <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
    <G transform="translate(7, 7) scale(1.0)">
      {/* Chimney */}
      <Rect x={32} y={15} width={4} height={10} fill={color} />
      {/* Roof */}
      <Polygon points="25,12 42,25 8,25" fill={color} />
      {/* House Wall */}
      <Path d="M12 25 L12 39 A 2 2 0 0 0 14 41 L36 41 A 2 2 0 0 0 38 39 L38 25 Z" fill={color} />
      {/* Door Cutout */}
      <Rect x={21} y={30} width={8} height={11} rx={1} fill="#FBE7CC" />
    </G>
  </Svg>
);

// 2. Food Icon (Fork & Spoon)
export const CategoryFoodIcon: React.FC<IconProps> = ({ color = '#9A5A12' }) => (
  <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
    <G transform="translate(7, 7) scale(1.0)">
      {/* Fork */}
      <Path d="M17 12 L17 22 A 3 3 0 0 0 20 25 L20 38 A 1.5 1.5 0 0 0 23 38 L23 25 A 3 3 0 0 0 26 22 L26 12 Z" fill={color} />
      {/* Spoon */}
      <Path d="M30 14 C30 9, 36 9, 36 14 C36 21, 33 24, 33 27 L33 38 A 1.5 1.5 0 0 1 30 38 L30 27 C30 24, 27 21, 27 14 C27 9, 30 9, 30 14 Z" fill={color} />
    </G>
  </Svg>
);

// 3. Health Icon (Solid circle with white plus cross)
export const CategoryHealthIcon: React.FC<IconProps> = ({ color = '#9A5A12' }) => (
  <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
    <G transform="translate(7, 7) scale(1.0)">
      <Circle cx={25} cy={25} r={16} fill={color} />
      <Rect x={22} y={15} width={6} height={20} rx={1.5} fill="#FBE7CC" />
      <Rect x={15} y={22} width={20} height={6} rx={1.5} fill="#FBE7CC" />
    </G>
  </Svg>
);

// 4. Beauty & Wellness Icon (Woman face silhouette)
export const CategoryBeautyIcon: React.FC<IconProps> = ({ color = '#9A5A12' }) => (
  <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
    <G transform="translate(7, 7) scale(1.0)">
      <Path d="M25 10 C18 10 13 14.5 13 22 C13 28 16 32.5 21 34 C19.5 36.5 20 39.5 23 39.5 C25.5 39.5 27 37 28.5 34.5 C31 35 34 35 37 32 C39.5 29.5 40 25.5 40 22 C40 14.5 35 10 25 10 Z M31 25.5 C29.5 25.5 28.5 24 28.5 22.5 C28.5 21 29.5 19.5 31 19.5 C32.5 19.5 33.5 21 33.5 22.5 C33.5 24 32.5 25.5 31 25.5 Z" fill={color} />
    </G>
  </Svg>
);

// 5. Auto Icon (Front-view of Car with headlights and windshield)
export const CategoryAutoIcon: React.FC<IconProps> = ({ color = '#9A5A12' }) => (
  <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
    <G transform="translate(7, 7) scale(1.0)">
      <Path d="M18 15 L32 15 Q35 15 36 20 L39 20 Q41 20 41 23 L41 32 Q41 34 39 34 L39 37 Q39 39 37 39 L35 39 Q33 39 33 37 L33 34 L17 34 L17 37 Q17 39 15 39 L13 39 Q11 39 11 37 L11 34 Q9 34 9 32 L9 23 Q9 20 11 20 L14 20 Q15 15 18 15 Z" fill={color} />
      <Circle cx={15} cy={27} r={2.5} fill="#FBE7CC" />
      <Circle cx={35} cy={27} r={2.5} fill="#FBE7CC" />
      <Path d="M19 18 L31 18 L33 22 L17 22 Z" fill="#FBE7CC" />
    </G>
  </Svg>
);

// 6. Education Icon (Graduation mortarboard cap & tassel)
export const CategoryEducationIcon: React.FC<IconProps> = ({ color = '#9A5A12' }) => (
  <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
    <G transform="translate(7, 7) scale(1.0)">
      <Polygon points="25,12 41,20 25,28 9,20" fill={color} />
      <Path d="M17 24.5 L17 30 C17 33, 25 35, 25 35 C25 35, 33 33, 33 30 L33 24.5 L25 28.5 Z" fill={color} />
      <Path d="M35 21 L37 27 L37 32 Q37 34 35.5 34 Q34 34 34 32 L34 27 Z" fill={color} />
    </G>
  </Svg>
);

// 7. Shopping Icon (Shopping bag)
export const CategoryShoppingIcon: React.FC<IconProps> = ({ color = '#9A5A12' }) => (
  <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
    <G transform="translate(7, 7) scale(1.0)">
      <Path d="M19 19 C19 11, 31 11, 31 19" fill="none" stroke={color} strokeWidth={3.5} />
      <Rect x={13} y={19} width={24} height={20} rx={3} fill={color} />
    </G>
  </Svg>
);

// 8. Professional Services Icon (Briefcase case)
export const CategoryProfessionalIcon: React.FC<IconProps> = ({ color = '#9A5A12' }) => (
  <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
    <G transform="translate(7, 7) scale(1.0)">
      <Path d="M20 16 C20 12, 30 12, 30 16" fill="none" stroke={color} strokeWidth={3.0} />
      <Rect x={11} y={17} width={28} height={20} rx={4} fill={color} />
      <Rect x={22} y={23} width={6} height={5} rx={1} fill="#FBE7CC" />
    </G>
  </Svg>
);

// 9. Pets Icon (Paw print)
export const CategoryPetsIcon: React.FC<IconProps> = ({ color = '#9A5A12' }) => (
  <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
    <G transform="translate(7, 7) scale(1.0)">
      <Path d="M25 24 C21 24, 18 28, 18 32 C18 36, 21 38, 25 38 C29 38, 32 36, 32 32 C32 28, 29 24, 25 24 Z" fill={color} />
      <Circle cx={16} cy={20} r={4.0} fill={color} />
      <Circle cx={22} cy={16} r={4.0} fill={color} />
      <Circle cx={28} cy={16} r={4.0} fill={color} />
      <Circle cx={34} cy={20} r={4.0} fill={color} />
    </G>
  </Svg>
);

// 10. Construction Icon (Hard hat helmet)
export const CategoryConstructionIcon: React.FC<IconProps> = ({ color = '#9A5A12' }) => (
  <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
    <G transform="translate(7, 7) scale(1.0)">
      <Path d="M13 28 C13 18, 21 13, 25 13 C29 13, 37 18, 37 28 Z" fill={color} />
      <Path d="M9 28 L41 28 C43 28, 43 31, 41 31 L9 31 C7 31, 7 28, 9 28 Z" fill={color} />
      <Rect x={23} y={13} width={4} height={15} rx={1} fill="#FBE7CC" opacity={0.4} />
    </G>
  </Svg>
);

// 11. Events Icon (Party popper with sparks)
export const CategoryEventsIcon: React.FC<IconProps> = ({ color = '#9A5A12' }) => (
  <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
    <G transform="translate(7, 7) scale(1.0)">
      <Path d="M12 38 L24 26 L12 14 Z" fill={color} transform="rotate(45 18 26)" />
      <Path d="M30 16 Q32 12 36 14 Q32 16 30 16 Z" fill={color} />
      <Path d="M34 22 Q38 20 40 24 Q36 24 34 22 Z" fill={color} />
      <Path d="M26 12 Q28 8 32 10 Q28 12 26 12 Z" fill={color} />
      <Circle cx={28} cy={22} r={2} fill={color} />
      <Circle cx={36} cy={10} r={1.5} fill={color} />
    </G>
  </Svg>
);

// 12. Fitness Icon (Dumbbell weights)
export const CategoryFitnessIcon: React.FC<IconProps> = ({ color = '#9A5A12' }) => (
  <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
    <G transform="translate(7, 7) scale(1.0)">
      <Rect x={12} y={23} width={26} height={4} fill={color} />
      <Rect x={10} y={15} width={3} height={20} rx={1} fill={color} />
      <Rect x={7} y={18} width={3} height={14} rx={1} fill={color} />
      <Rect x={37} y={15} width={3} height={20} rx={1} fill={color} />
      <Rect x={40} y={18} width={3} height={14} rx={1} fill={color} />
    </G>
  </Svg>
);

// 13. Agriculture Icon (Farm tractor cab and wheels)
export const CategoryAgricultureIcon: React.FC<IconProps> = ({ color = '#9A5A12' }) => (
  <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
    <G transform="translate(7, 7) scale(1.0)">
      <Rect x={20} y={16} width={12} height={10} rx={1} fill={color} />
      <Circle cx={19} cy={31} r={7.5} fill={color} />
      <Circle cx={19} cy={31} r={3.5} fill="#FBE7CC" />
      <Circle cx={33} cy={33.5} r={5} fill={color} />
      <Circle cx={33} cy={33.5} r={2} fill="#FBE7CC" />
      <Rect x={26} y={24} width={10} height={7} fill={color} />
      <Rect x={31} y={19} width={2} height={5} fill={color} />
    </G>
  </Svg>
);

// 14. Electrical Icon (Plug & Wire)
export const CategoryElectricalIcon: React.FC<IconProps> = ({ color = '#9A5A12' }) => (
  <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
    <G transform="translate(7, 7) scale(1.0)">
      <Rect x={19} y={20} width={12} height={12} rx={2} fill={color} />
      <Rect x={21} y={13} width={2} height={7} fill={color} />
      <Rect x={27} y={13} width={2} height={7} fill={color} />
      <Path d="M25 32 C25 38, 33 36, 33 41" fill="none" stroke={color} strokeWidth={3.0} />
    </G>
  </Svg>
);

// 15. Gardening Icon (Watering can spout & handles)
export const CategoryGardeningIcon: React.FC<IconProps> = ({ color = '#9A5A12' }) => (
  <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
    <G transform="translate(7, 7) scale(1.0)">
      <Rect x={16} y={20} width={18} height={16} rx={4} fill={color} />
      <Path d="M16 23 C10 23, 10 33, 16 33" fill="none" stroke={color} strokeWidth={3.0} />
      <Path d="M34 28 L43 20 L44 23 L34 32 Z" fill={color} />
      <Path d="M21 20 C21 16, 29 16, 29 20" fill="none" stroke={color} strokeWidth={3.0} />
    </G>
  </Svg>
);

// 16. Photography Icon (Camera lens & body)
export const CategoryPhotographyIcon: React.FC<IconProps> = ({ color = '#9A5A12' }) => (
  <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
    <G transform="translate(7, 7) scale(1.0)">
      <Rect x={11} y={19} width={28} height={18} rx={3} fill={color} />
      <Rect x={15} y={15} width={6} height={4} rx={1} fill={color} />
      <Circle cx={25} cy={28} r={6.5} fill="#FBE7CC" />
      <Circle cx={25} cy={28} r={4.5} fill={color} />
    </G>
  </Svg>
);

// 17. Security Icon (Shield with Checkmark)
export const CategorySecurityIcon: React.FC<IconProps> = ({ color = '#9A5A12' }) => (
  <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
    <G transform="translate(7, 7) scale(1.0)">
      <Path d="M25 12 C32 12, 37 14, 37 17 C37 28, 30 36, 25 39 C20 36, 13 28, 13 17 C13 14, 18 12, 25 12 Z" fill={color} />
      <Polyline points="20,25 24,29 31,21" fill="none" stroke="#FBE7CC" strokeWidth={3.0} strokeLinecap="round" strokeLinejoin="round" />
    </G>
  </Svg>
);

// 18. Logistics Icon (Delivery Truck)
export const CategoryLogisticsIcon: React.FC<IconProps> = ({ color = '#9A5A12' }) => (
  <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
    <G transform="translate(7, 7) scale(1.0)">
      <Rect x={10} y={15} width={22} height={17} rx={1} fill={color} />
      <Path d="M32 20 L37 20 L40 25 L40 32 L32 32 Z" fill={color} />
      <Circle cx={16} cy={35} r={3.5} fill={color} />
      <Circle cx={16} cy={35} r={1.5} fill="#FBE7CC" />
      <Circle cx={35} cy={35} r={3.5} fill={color} />
      <Circle cx={35} cy={35} r={1.5} fill="#FBE7CC" />
    </G>
  </Svg>
);

// 19. Dairy & Milk Icon (Milk Bottle)
export const CategoryDairyIcon: React.FC<IconProps> = ({ color = '#9A5A12' }) => (
  <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
    <G transform="translate(7, 7) scale(1.0)">
      <Path d="M21 16 L29 16 L31 22 L31 38 C31 39.5, 29.5 40, 29 40 L21 40 C20.5 40, 19 39.5, 19 38 L19 22 Z" fill={color} />
      <Rect x={23} y={12} width={4} height={4} rx={1} fill={color} />
      <Rect x={22} y={24} width={6} height={10} rx={1} fill="#FBE7CC" />
    </G>
  </Svg>
);

// 20. Books & Stationery Icon (Stack of Books)
export const CategoryBooksIcon: React.FC<IconProps> = ({ color = '#9A5A12' }) => (
  <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
    <G transform="translate(7, 7) scale(1.0)">
      <Rect x={13} y={15} width={24} height={5} rx={1.5} fill={color} />
      <Rect x={11} y={15} width={3} height={5} fill={color} />
      <Rect x={13} y={22} width={24} height={5} rx={1.5} fill={color} />
      <Rect x={11} y={22} width={3} height={5} fill={color} />
      <Rect x={13} y={29} width={24} height={5} rx={1.5} fill={color} />
      <Rect x={11} y={29} width={3} height={5} fill={color} />
    </G>
  </Svg>
);

// Fallback legacy icons for other parts of the app mapping imports dynamically
export const CategoryTutorsIcon = CategoryEducationIcon;
export const CategoryStoresIcon = CategoryShoppingIcon;
export const CategoryMoreIcon = CategoryBooksIcon;
