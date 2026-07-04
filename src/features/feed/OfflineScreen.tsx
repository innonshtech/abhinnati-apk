import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Easing, Pressable, Dimensions } from 'react-native';
import { Cloud } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { useNetworkStore } from '../../store/useNetworkStore';
import { retryFailedRequests } from '../../api/client';

export const OfflineScreen: React.FC = () => {
  const { isOnline, setOnline } = useNetworkStore();
  const rotation = useRef(new Animated.Value(0)).current;

  // Spin rotation loop (60 FPS using useNativeDriver)
  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [rotation]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleContinueWorking = async () => {
    if (!isOnline) return;
    
    // Retry failed API requests
    await retryFailedRequests();
    // Dismiss the offline screen
    setOnline(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* White circle with brown cloud icon */}
        <View style={styles.cloudCircle}>
          <Cloud size={40} color={theme.colors.brownStem} fill={theme.colors.brownStem} />
        </View>

        {/* Status text */}
        <Text style={styles.title}>You're offline</Text>
        <Text style={styles.subtitle}>Please connect to Internet</Text>

        {/* Smooth 60 FPS loading spinner (20-25% smaller) centered below */}
        <Animated.View style={[styles.spinner, { transform: [{ rotate }] }]} />
      </View>

      {/* Continue working button at the bottom */}
      <View style={styles.footer}>
        <Pressable
          disabled={!isOnline}
          onPress={handleContinueWorking}
          style={[styles.button, !isOnline && styles.buttonDisabled]}
        >
          <Text style={[styles.buttonText, !isOnline && styles.buttonTextDisabled]}>
            Continue working
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.cream,
    justifyContent: 'space-between',
    zIndex: 99999,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  cloudCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.charcoal,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  spinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FBE7CC', // peachBg
    borderTopColor: '#E58A2B', // orange
    marginTop: 48,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  button: {
    backgroundColor: theme.colors.charcoal,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonDisabled: {
    backgroundColor: '#EFE3CC', // borderLight or disabled color
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: '#A89A82', // textMuted
  },
});

export default OfflineScreen;
