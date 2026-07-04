import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, Animated, Dimensions } from 'react-native';
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

const capsulePositions = [0, 81, 163, 245];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabPress,
}) => {
  const { preferredLanguage } = useAuthStore();
  const isMr = preferredLanguage === 'mr';

  const tabIndex = activeTab === 'Home' ? 0 : activeTab === 'Explore' ? 1 : activeTab === 'Bookings' ? 2 : 3;

  // Animation for the sliding capsule background
  const slideAnim = useRef(new Animated.Value(capsulePositions[tabIndex])).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: capsulePositions[tabIndex],
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [tabIndex]);

  const getLabel = (tab: TabName) => {
    switch (tab) {
      case 'Home':
        return isMr ? 'माझा परिसर' : 'Home';
      case 'Explore':
        return isMr ? 'शोधा' : 'Explore';
      case 'Bookings':
        return isMr ? 'बुकिंग्स' : 'Bookings';
      case 'Profile':
        return isMr ? 'प्रोफाईल' : 'Profile';
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Animated Capsule Background */}
        <Animated.View style={[styles.activeCapsule, { transform: [{ translateX: slideAnim }] }]} />

        {/* Tab 1: Home */}
        <Pressable onPress={() => onTabPress('Home')} style={[styles.tabButton, { left: 5 }]}>
          <View style={styles.iconContainer}>
            <CustomHomeIcon isFocused={activeTab === 'Home'} size={20} />
          </View>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            style={[
              styles.tabLabel,
              activeTab === 'Home' ? styles.activeTabLabel : styles.inactiveTabLabel,
            ]}
          >
            {getLabel('Home')}
          </Text>
        </Pressable>

        {/* Tab 2: Explore */}
        <Pressable onPress={() => onTabPress('Explore')} style={[styles.tabButton, { left: 86 }]}>
          <View style={styles.iconContainer}>
            <CustomSearchIcon isFocused={activeTab === 'Explore'} size={20} />
          </View>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            style={[
              styles.tabLabel,
              activeTab === 'Explore' ? styles.activeTabLabel : styles.inactiveTabLabel,
            ]}
          >
            {getLabel('Explore')}
          </Text>
        </Pressable>

        {/* Tab 3: Bookings */}
        <Pressable onPress={() => onTabPress('Bookings')} style={[styles.tabButton, { left: 168 }]}>
          <View style={styles.iconContainer}>
            <CustomCalendarIcon isFocused={activeTab === 'Bookings'} size={20} />
          </View>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            style={[
              styles.tabLabel,
              activeTab === 'Bookings' ? styles.activeTabLabel : styles.inactiveTabLabel,
            ]}
          >
            {getLabel('Bookings')}
          </Text>
        </Pressable>

        {/* Tab 4: Profile */}
        <Pressable onPress={() => onTabPress('Profile')} style={[styles.tabButton, { left: 250 }]}>
          <View style={styles.iconContainer}>
            <CustomProfileIcon isFocused={activeTab === 'Profile'} size={20} />
          </View>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            style={[
              styles.tabLabel,
              activeTab === 'Profile' ? styles.activeTabLabel : styles.inactiveTabLabel,
            ]}
          >
            {getLabel('Profile')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 18,
    width: 361,
    height: 70,
    alignSelf: 'center',
    zIndex: 9999,
  },
  container: {
    width: 361,
    height: 70,
    borderRadius: theme.radius.tabBar,
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // translucent glass
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(239, 227, 204, 0.5)',     // glass border
    shadowColor: theme.colors.charcoal,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,
  },
  activeCapsule: {
    position: 'absolute',
    width: 106,
    height: 60,
    top: 5,
    left: 5,
    borderRadius: theme.radius.activeTabBg,
    backgroundColor: 'rgba(208, 208, 208, 0.7)', // active tab pill from Figma
  },
  tabButton: {
    position: 'absolute',
    width: 106,
    height: 60,
    top: 5,
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
    fontSize: theme.typography.sizes.micro,
    lineHeight: theme.typography.lineHeights.micro,
    textAlign: 'center',
  },
  activeTabLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    color: theme.colors.charcoal,
  },
  inactiveTabLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
});

export default BottomNavigation;
