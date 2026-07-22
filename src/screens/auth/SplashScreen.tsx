import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, StatusBar, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors, typography, borderRadius } from '../../theme';
import { Button } from '../../components/common/Button';
import { tokenStore } from '../../services/tokenStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      await tokenStore.init();
      const user = tokenStore.getUser();
      const token = tokenStore.getAccessToken();
      if (user && token) {
        // User is logged in! Auto-navigate to MainTabs
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else {
        setCheckingAuth(false);
      }
    };
    checkSession();
  }, [navigation]);

  if (checkingAuth) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar backgroundColor={colors.darkBg} barStyle="light-content" />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.darkBg} barStyle="light-content" />

      {/* Hero Brand Illustration / Logo */}
      <View style={styles.heroSection}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.appLogoImage}
          resizeMode="contain"
        />
        <Text style={styles.appTitleText}>SolvePay</Text>
        <Text style={styles.tagline}>Future of Intelligent Payments & Team Cashflow</Text>
        <Text style={styles.description}>
          Send, spend, track statistics, and manage your team finances all in one modern mobile workspace.
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <Button
          title="Get Started"
          variant="primary"
          size="large"
          onPress={() => navigation.navigate('Register')}
          style={styles.actionBtn}
        />
        <Button
          title="Sign In to Existing Account"
          variant="outline"
          size="large"
          onPress={() => navigation.navigate('Login')}
          style={{ ...styles.actionBtn, ...styles.outlineBtn }}
          textStyle={{ color: colors.textLight }}
        />
        <Text style={styles.versionText}>SolvePay v1.0.0 • Secure 256-Bit Encrypted</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBg,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appLogoImage: {
    width: 100,
    height: 100,
    borderRadius: 22,
    marginBottom: 16,
  },
  appTitleText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 28,
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 12,
  },
  tagline: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.display,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: typography.lineHeight.display,
    marginBottom: 16,
  },
  description: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 12,
    lineHeight: typography.lineHeight.base,
  },
  footer: {
    width: '100%',
  },
  actionBtn: {
    marginBottom: 12,
  },
  outlineBtn: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  versionText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
});
