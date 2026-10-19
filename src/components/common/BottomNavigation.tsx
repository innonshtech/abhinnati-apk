import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, Animated, useWindowDimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  CustomHomeIcon,
  CustomSearchIcon,
  CustomCalendarIcon,
  CustomProfileIcon,
} from './Icons';
import { theme } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';

type TabName = 'Home' | 'Explore' | 'Bookings' | 'Profile';

interface BottomNavigationProps {
  activeTab: TabName;
  onTabPress: (tab: TabName) => void;
}

const TABS: TabName[] = ['Home', 'Explore', 'Bookings', 'Profile'];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabPress,
}) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  // Responsive container width: standard ~361px, responsive across all devices
  const containerWidth = Math.min(Math.max(windowWidth - 32, 320), 380);
  const tabWidth = containerWidth / 4;
  const capsuleMargin = 4;
  const capsuleWidth = tabWidth - (capsuleMargin * 2);

  const tabIndex = activeTab === 'Home' ? 0 : activeTab === 'Explore' ? 1 : activeTab === 'Bookings' ? 2 : 3;

  // Animation for the sliding capsule background
  const slideAnim = useRef(new Animated.Value(tabIndex * tabWidth + capsuleMargin)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: tabIndex * tabWidth + capsuleMargin,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [tabIndex, tabWidth, capsuleMargin]);

  const getIcon = (tab: TabName, isFocused: boolean) => {
    const size = 20;
    switch (tab) {
      case 'Home':
        return <CustomHomeIcon isFocused={isFocused} size={size} />;
      case 'Explore':
        return <CustomSearchIcon isFocused={isFocused} size={size} />;
      case 'Bookings':
        return <CustomCalendarIcon isFocused={isFocused} size={size} />;
      case 'Profile':
        return <CustomProfileIcon isFocused={isFocused} size={size} />;
    }
  };

  const getLabel = (tab: TabName) => {
    switch (tab) {
      case 'Home':
        return t('tabs.home');
      case 'Explore':
        return t('tabs.explore');
      case 'Bookings':
        return t('tabs.bookings');
      case 'Profile':
        return t('tabs.profile');
    }
  };

  const bottomOffset = Math.max(insets.bottom, Platform.OS === 'android' ? 24 : 18) + 12;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.tabBarWrapper,
        {
          width: containerWidth,
          bottom: bottomOffset,
        },
      ]}
    >
      <View style={styles.tabBarContainer}>
        {/* Animated Capsule Background */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.activeCapsule,
            {
              width: capsuleWidth,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        />

        {/* 4 Tabs Row */}
        <View style={styles.tabsRow}>
          {TABS.map((tab) => {
            const isFocused = activeTab === tab;

            return (
              <Pressable
                key={tab}
                onPress={() => onTabPress(tab)}
                style={styles.tabButton}
                android_ripple={{ color: 'transparent' }}
              >
                <View style={styles.iconContainer}>
                  {getIcon(tab, isFocused)}
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.tabLabel,
                    isFocused ? styles.activeTabLabel : styles.inactiveTabLabel,
                  ]}
                >
                  {getLabel(tab)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    height: 70,
    alignSelf: 'center',
    zIndex: 9999,
  },
  tabBarContainer: {
    width: '100%',
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EFE3CC',
    shadowColor: '#2A2520',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,
  },
  activeCapsule: {
    position: 'absolute',
    height: 60,
    top: 5,
    borderRadius: 30,
    backgroundColor: '#D0D0D0',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  tabButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    gap: 4,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: 'Mukta-Medium',
    fontWeight: '500',
    color: '#6B5F4E',
    textAlign: 'center',
  },
  activeTabLabel: {
    fontFamily: 'Mukta-Bold',
    fontWeight: '700',
    color: '#2A2520',
  },
  inactiveTabLabel: {
    fontFamily: 'Mukta-Medium',
    fontWeight: '500',
    color: '#6B5F4E',
  },
});

export default BottomNavigation;

