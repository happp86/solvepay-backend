import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors, typography, borderRadius } from '../../theme';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Header } from '../../components/common/Header';
import { Avatar } from '../../components/common/Avatar';
import { NumericKeypad } from '../../components/payment/NumericKeypad';
import { Button } from '../../components/common/Button';
import { mockTeamMembers } from '../../mock';
import { COMMISSION_RATE } from '../../config/commission';
import { calculateCommission, formatCurrency } from '../../utils/commission';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;

export const PaymentScreen: React.FC<Props> = ({ route, navigation }) => {
  const initialRecipient = route.params?.recipientName || mockTeamMembers[0].name;
  const initialAvatar = route.params?.recipientAvatar || mockTeamMembers[0].avatar;
  const [amountStr, setAmountStr] = useState(route.params?.initialAmount || '150');
  const [recipient, setRecipient] = useState({ name: initialRecipient, avatar: initialAvatar });
  const [selectedSource, setSelectedSource] = useState('SolvePay Wallet Balance ($24,850.50)');
  const [loading, setLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const handleKeyPress = (key: string) => {
    if (key === '.' && amountStr.includes('.')) return;
    if (amountStr === '0' && key !== '.') {
      setAmountStr(key);
    } else {
      if (amountStr.length < 7) {
        setAmountStr((prev) => prev + key);
      }
    }
  };

  const handleDeletePress = () => {
    if (amountStr.length <= 1) {
      setAmountStr('0');
    } else {
      setAmountStr((prev) => prev.slice(0, -1));
    }
  };

  const handleConfirmTransfer = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessModalVisible(true);
    }, 600);
  };

  const handleDone = () => {
    setSuccessModalVisible(false);
    navigation.replace('OrderDetails', { transactionId: 'TXN-90283' });
  };

  return (
    <ScreenWrapper scrollable={false} contentContainerStyle={styles.container}>
      <Header onBackPress={() => navigation.goBack()} title="Send Money" />

      {/* Recipient Selection Header */}
      <View style={styles.recipientCard}>
        <Text style={styles.cardLabel}>TRANSFER RECIPIENT</Text>
        <TouchableOpacity style={styles.recipientSelector} activeOpacity={0.8}>
          <Avatar uri={recipient.avatar} name={recipient.name} size={44} />
          <View style={styles.recipientInfo}>
            <Text style={styles.recipientName}>{recipient.name}</Text>
            <Text style={styles.recipientStatus}>Verified SolvePay Account</Text>
          </View>
          <Text style={styles.changeText}>Change</Text>
        </TouchableOpacity>
      </View>

      {/* Amount Display */}
      <View style={styles.amountContainer}>
        <Text style={styles.currencySymbol}>₹</Text>
        <Text style={styles.amountValue}>{amountStr || '0'}</Text>
      </View>
      <Text style={styles.feeHint}>No transfer fee applied • Instant delivery</Text>

      {/* Commission Preview Row */}
      <View style={styles.commissionRow}>
        <Text style={styles.commissionLabel}>💰 Commission ({COMMISSION_RATE}%)</Text>
        <Text style={styles.commissionValue}>
          {formatCurrency(calculateCommission(parseFloat(amountStr || '0')))}
        </Text>
      </View>

      {/* Payment Source Switcher */}
      <View style={styles.sourceBox}>
        <Text style={styles.sourceLabel}>PAY WITH</Text>
        <Text style={styles.sourceVal}>⚡ {selectedSource}</Text>
      </View>

      {/* Numeric Keypad */}
      <NumericKeypad onKeyPress={handleKeyPress} onDeletePress={handleDeletePress} />

      {/* Submit Button */}
      <View style={styles.footer}>
        <Button
          title={`Send ${formatCurrency(parseFloat(amountStr || '0'))} Now`}
          variant="primary"
          size="large"
          loading={loading}
          disabled={parseFloat(amountStr || '0') <= 0}
          onPress={handleConfirmTransfer}
        />
      </View>

      {/* Success Animated Modal */}
      <Modal visible={successModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successBadge}>
              <Text style={styles.successIcon}>✓</Text>
            </View>
            <Text style={styles.modalTitle}>Payment Sent!</Text>
            <Text style={styles.modalDesc}>
              Successfully transferred <Text style={{ fontWeight: 'bold' }}>{formatCurrency(parseFloat(amountStr || '0'))}</Text> to {recipient.name}.
            </Text>
            <View style={styles.modalCommissionRow}>
              <Text style={styles.modalCommissionLabel}>🏆 Commission Earned ({COMMISSION_RATE}%)</Text>
              <Text style={styles.modalCommissionValue}>{formatCurrency(calculateCommission(parseFloat(amountStr || '0')))}</Text>
            </View>

            <Button title="View Transaction Receipt" variant="primary" size="large" onPress={handleDone} style={styles.modalBtn} />
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  recipientCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: 14,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  recipientSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipientInfo: {
    marginLeft: 12,
    flex: 1,
  },
  recipientName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  recipientStatus: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    color: colors.primaryDark,
  },
  changeText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs,
    color: colors.primary,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  currencySymbol: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 36,
    color: colors.textPrimary,
    marginRight: 4,
  },
  amountValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 52,
    color: colors.textPrimary,
  },
  feeHint: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  sourceBox: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.lg,
    marginHorizontal: 20,
    marginTop: 16,
    alignItems: 'center',
  },
  sourceLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 9,
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  sourceVal: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xs,
    color: colors.primaryDark,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: 28,
    alignItems: 'center',
  },
  successBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successIcon: {
    fontSize: 36,
    color: colors.primary,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  modalDesc: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: typography.lineHeight.base,
  },
  modalBtn: {
    width: '100%',
  },
  commissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginTop: 8,
  },
  commissionLabel: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs,
    color: colors.primaryDark,
  },
  commissionValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.sm,
    color: colors.primaryDark,
  },
  modalCommissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    width: '100%',
    marginBottom: 20,
  },
  modalCommissionLabel: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs,
    color: colors.primaryDark,
    flex: 1,
  },
  modalCommissionValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },
});
