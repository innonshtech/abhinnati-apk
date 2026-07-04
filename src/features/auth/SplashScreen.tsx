import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BrandLogo from '../../components/common/BrandLogo';
import { theme } from '../../constants/theme';
import { verticalScale } from '../../hooks/useScale';

export const SplashScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <BrandLogo size={180} showText={true} />
        <ActivityIndicator 
          size="large" 
          color={theme.colors.marigold} 
          style={styles.spinner} 
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF6EC', // Cream background matching brand tokens
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    marginTop: verticalScale(40),
  },
});

export default SplashScreen;
