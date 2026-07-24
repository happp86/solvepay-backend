import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors, typography } from '../../theme';
import { authService } from '../../services/authService';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [securityPin, setSecurityPin] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!userName || userName.trim().length < 3) {
      Alert.alert('Validation Error', 'Username must be at least 3 characters.');
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters.');
      return;
    }
    if (!phone || phone.length !== 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!securityPin || securityPin.length !== 6) {
      Alert.alert('Validation Error', 'Please enter a 6-digit Security Pin. Remember this pin — it is needed to reset your password if forgotten.');
      return;
    }

    try {
      setLoading(true);
      await authService.register({
        username: userName,
        password,
        phone,
        securityPin,
        inviteCode,
      });
      Alert.alert('Success', 'Account registered successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] }),
        },
      ]);
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err.message || 'Something went wrong.';
      Alert.alert('User Already Registered', errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>SolvePay</Text>
          <Text style={styles.welcomeTitle}>Register</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* User Name */}
          <Text style={styles.inputLabel}>User Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter user name"
            placeholderTextColor={colors.textMuted}
            value={userName}
            onChangeText={setUserName}
            autoCapitalize="none"
          />

          {/* Password */}
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Phone */}
          <Text style={styles.inputLabel}>Phone</Text>
          <View style={styles.phoneRow}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="Enter phone number"
              placeholderTextColor={colors.textMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          {/* Security Pin */}
          <Text style={styles.inputLabel}>Security Pin (6-digit)</Text>
          <TextInput
            style={styles.input}
            placeholder="Create a 6-digit Security Pin"
            placeholderTextColor={colors.textMuted}
            value={securityPin}
            onChangeText={(t) => setSecurityPin(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            maxLength={6}
            secureTextEntry={true}
          />
          <Text style={styles.pinHint}>⚠️ Remember this Pin — used to reset forgotten password</Text>

          {/* Invite Code */}
          <Text style={styles.inputLabel}>Invite Code</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter invite code (optional)"
            placeholderTextColor={colors.textMuted}
            value={inviteCode}
            onChangeText={setInviteCode}
            autoCapitalize="characters"
          />

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.signUpBtn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            activeOpacity={0.85}
            disabled={loading}
          >
            <Text style={styles.signUpBtnText}>{loading ? 'Signing Up...' : 'Sign Up'}</Text>
          </TouchableOpacity>

          {/* Back to Login */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.loginRow}
          >
            <Text style={styles.loginText}>Already have an account? </Text>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>SolvePay v1.0.0</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F5F7FA' },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 24,
  },
  brandTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 28,
    color: colors.primary,
    marginBottom: 2,
  },
  welcomeTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  inputLabel: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontFamily: typography.fontFamily.regular,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: '#FAFAFA',
  },
  phoneRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FAFAFA',
  },
  countryCode: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#F0F0F0',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    justifyContent: 'center',
  },
  countryCodeText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontFamily: typography.fontFamily.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontFamily: typography.fontFamily.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  eyeBtn: { paddingHorizontal: 14 },
  eyeIcon: { fontSize: 18 },
  pinHint: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: '#E57C00',
    marginTop: 5,
    marginBottom: 2,
  },
  signUpBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  btnDisabled: { opacity: 0.6 },
  signUpBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    color: '#fff',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  loginLink: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
    color: colors.primary,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  versionText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
});
