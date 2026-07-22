import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export const SplashScreen = () => {
  const fadeAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(0.9);

  useEffect(() => {
    fadeAnim.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.ease),
    });
    scaleAnim.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.ease),
    });
  }, [fadeAnim, scaleAnim]);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [{ scale: scaleAnim.value }],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, animatedStyles]}>
        {/* Placeholder for SolvePay Logo */}
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>S</Text>
        </View>
        <Text style={styles.brandName}>SolvePay</Text>
        <Text style={styles.tagline}>Smart. Secure. Fast.</Text>
      </Animated.View>
      
      <Animated.View style={[styles.loaderContainer, animatedStyles]}>
        <ActivityIndicator size="large" color="#18C964" />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA', // Background
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#18C964', // Primary Color
    borderRadius: 24, // Rounded Design
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#18C964',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: {
    color: '#FFFFFF', // Secondary Color
    fontSize: 40,
    fontWeight: 'bold',
    // fontFamily: 'Poppins-Bold', 
  },
  brandName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A', // Accent color
    // fontFamily: 'Poppins-ExtraBold',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: '#64748B',
    // fontFamily: 'Poppins-Medium',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 60,
  },
});
