import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { Bell, ChevronDown } from 'lucide-react-native';
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
  langButtonBackground = theme.colors.white,
}) => {
  return (
    <View style={[styles.container, { backgroundColor: headerBackground }]}>
      {/* Locality Dropdown Selector */}
      <Pressable onPress={onLocalityPress} style={styles.localityFrame}>
        <Text style={styles.localityName} numberOfLines={1}>
          {localityName}
        </Text>
        <ChevronDown
          size={18}
          color={theme.colors.textTertiary}
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

        <Pressable onPress={onNotificationsPress} style={styles.bellBtn}>
          <Bell
            size={16}
            color={theme.colors.orange}
            fill={theme.colors.orange}
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  localityFrame: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  localityName: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: '600',
    fontSize: theme.typography.sizes.h2,
    lineHeight: theme.typography.lineHeights.h2,
    color: theme.colors.charcoal,
    maxWidth: 200,
  },
  dropdownArrow: {
    marginLeft: 6,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 26,
  },
  bellBtn: {
    width: 20,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Header;
