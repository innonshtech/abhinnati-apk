import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { Bell, ChevronDown } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LanguageButton from './LanguageButton';
import { theme } from '../../theme';

interface HeaderProps {
  localityName: string;
  preferredLanguage: 'en' | 'mr';
  onLocalityPress: () => void;
  onLanguagePress: () => void;
  onNotificationsPress: () => void;
  headerBackground?: string;
  langButtonBackground?: string;
}

export const Header: React.FC<HeaderProps> = ({
  localityName,
  preferredLanguage,
  onLocalityPress,
  onLanguagePress,
  onNotificationsPress,
  headerBackground = theme.colors.transparent,
  langButtonBackground = theme.colors.cream,
}) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { backgroundColor: headerBackground, paddingTop: 66 }]}>
      {/* Locality Dropdown Selector */}
      <Pressable onPress={onLocalityPress} style={styles.localityFrame} hitSlop={8}>
        <Text style={styles.localityName} numberOfLines={1}>
          {localityName}
        </Text>
        <ChevronDown
          size={14}
          color="#8A7C66"
          strokeWidth={2.5}
          style={styles.dropdownArrow}
        />
      </Pressable>

      {/* Right Side Actions */}
      <View style={styles.headerActions}>
        <LanguageButton
          language={preferredLanguage}
          onPress={onLanguagePress}
          backgroundColor={langButtonBackground}
        />

        <Pressable onPress={onNotificationsPress} style={styles.bellBtn} hitSlop={8}>
          <Bell
            size={18}
            color="#E58A2B"
            fill="#E58A2B"
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  localityFrame: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
  },
  localityName: {
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    fontSize: 18,
    color: '#2A2520',
    maxWidth: 220,
  },
  dropdownArrow: {
    marginLeft: 8,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 30,
  },
  bellBtn: {
    width: 24,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Header;
