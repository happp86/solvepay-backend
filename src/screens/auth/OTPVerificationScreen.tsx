import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors, typography, borderRadius } from '../../theme';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';

type Props = NativeStackScreenProps<RootStackParamList, 'OTPVerification'>;

export const OTPVerificationScreen: React.FC<Props> = ({ route, navigation }) => {
  const emailOrPhone = route.params?.emailOrPhone || 'alexander@solvepay.com';
  const [code, setCode] = useState(['5', '9', '2', '8']);
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    }, 600);
  };

  return (
    <ScreenWrapper contentContainerStyle={styles.container}>
      <Header onBackPress={() => navigation.goBack()} title="Verify Identity" />

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>📲</Text>
        </View>

        <Text style={styles.title}>Enter OTP Code</Text>
        <Text style={styles.description}>
          We have sent a 4-digit code to{' '}
          <Text style={styles.emailHighlight}>{emailOrPhone}</Text>.
        </Text>

        <View style={styles.otpRow}>
          {code.map((digit, index) => (
            <View key={index} style={styles.otpBox}>
              <Text style={styles.otpText}>{digit}</Text>
            </View>
          ))}
        </View>

        <View style={styles.timerRow}>
          <Text style={styles.timerText}>Didn't receive code? </Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.resendText}>Resend (00:45)</Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Verify & Continue"
          variant="primary"
          size="large"
          loading={loading}
          onPress={handleVerify}
          style={styles.btn}
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  content: {
    paddingHorizontal: 24,
    marginTop: 20,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 36,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  description: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.base,
    marginBottom: 32,
  },
  emailHighlight: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.semiBold,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  otpBox: {
    width: 60,
    height: 64,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  otpText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xxl,
    color: colors.textPrimary,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  timerText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  resendText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },
  btn: {
    width: '100%',
  },
});
