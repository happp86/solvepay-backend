import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors, typography } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, any>;

export const PrivacyPolicyScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#F5F7FA" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Policy & Terms</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionHeader}>SolvePay Service Agreement</Text>
        <Text style={styles.lastUpdated}>Last Updated: July 2026</Text>

        <Text style={styles.paragraph}>
          Welcome to SolvePay. By accessing or using our application, mobile wallet, and payment management services, you agree to be bound by these terms and conditions.
        </Text>

        <Text style={styles.subHeader}>1. Privacy & Security Assurance</Text>
        <Text style={styles.paragraph}>
          SolvePay adheres to strict data privacy guidelines. Your personal credentials, account identifier (App ID), phone number, and financial logs are safely stored using industry-standard 256-bit encryption. We do not sell or share your data with unauthorized third parties.
        </Text>

        <Text style={styles.subHeader}>2. Account Registration & User App ID</Text>
        <Text style={styles.paragraph}>
          Every registered user is issued a unique 6-digit App ID. This ID is used for system identification, customer support, and administrative verification. You are responsible for maintaining the confidentiality of your login credentials.
        </Text>

        <Text style={styles.subHeader}>3. Wallet & Transaction Rules</Text>
        <Text style={styles.paragraph}>
          All transactions, cashback rewards, and wallet transfers processed on SolvePay comply with standard financial guidelines. Commissions and fees (if applicable) are transparently displayed prior to transaction confirmation.
        </Text>

        <Text style={styles.subHeader}>4. User Responsibilities</Text>
        <Text style={styles.paragraph}>
          Users must provide accurate information during registration. Any fraudulent activity, automated bot usage, or system manipulation will result in immediate suspension of account privileges.
        </Text>

        <Text style={styles.subHeader}>5. Support & Inquiries</Text>
        <Text style={styles.paragraph}>
          If you have questions regarding your privacy, account settings, or security, please contact the SolvePay support team through the official in-app help desk.
        </Text>

        <TouchableOpacity style={styles.agreeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.agreeBtnText}>I Understand & Agree</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    padding: 6,
  },
  backText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 15,
    color: colors.primary,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  lastUpdated: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 16,
  },
  subHeader: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 6,
  },
  paragraph: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  agreeBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 30,
  },
  agreeBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
