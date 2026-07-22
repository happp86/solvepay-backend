import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Clipboard,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors, typography } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetails'>;

const mockOrderDetails = {
  amount: 188.0,
  expireSeconds: 29 * 60 + 55,
  payeeAccount: '20122551857',
  payeeName: 'VIMLA BAI',
  ifsc: 'FINO0001112',
  type: 'IMPS',
  payoutWallet: 'Freecharge',
  payoutAccount: '8959731155',
  payoutUPI: 'harshu.27@freecharge',
  status: 'Pending',
  no: 'R20260721201852153586',
};

export const OrderDetailsScreen: React.FC<Props> = ({ navigation }) => {
  const [timeLeft, setTimeLeft] = useState(mockOrderDetails.expireSeconds);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleCopy = (value: string, label: string) => {
    Clipboard.setString(value);
    Alert.alert('Copied', `${label} copied to clipboard.`);
  };

  const handleCancel = () => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  const handleUploadVoucher = () => {
    Alert.alert('Upload Voucher', 'Please select payment screenshot to upload.');
  };

  const handlePay = () => {
    Alert.alert('SolvePay', 'Payment initiated. Please complete transfer via your payment tool.');
  };

  const detailRows: { label: string; value: string; copyable?: boolean; isNote?: boolean; hasAction?: boolean; actionLabel?: string; actionDanger?: boolean }[] = [
    { label: 'PayeeAccount:', value: mockOrderDetails.payeeAccount, copyable: true },
    { label: 'PayeeName:', value: mockOrderDetails.payeeName, copyable: true },
    { label: 'IFSC:', value: mockOrderDetails.ifsc, copyable: true, isNote: true },
    { label: 'Type:', value: mockOrderDetails.type, copyable: true },
    { label: 'Payout Wallet:', value: mockOrderDetails.payoutWallet, hasAction: true, actionLabel: 'Change' },
    { label: 'Payout Account:', value: mockOrderDetails.payoutAccount, copyable: true },
    { label: 'Payout UPI:', value: mockOrderDetails.payoutUPI, copyable: true },
    { label: 'Status:', value: mockOrderDetails.status, hasAction: true, actionLabel: 'Cancel', actionDanger: true },
    { label: 'NO:', value: mockOrderDetails.no, copyable: true },
  ];

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Amount + Expire */}
        <View style={styles.amountSection}>
          <Text style={styles.amountText}>INR {mockOrderDetails.amount.toFixed(2)}</Text>
          <View style={styles.expireRow}>
            <Text style={styles.expireLabel}>Expire: </Text>
            <Text style={styles.expireTime}>{formatTime(timeLeft)}</Text>
          </View>
        </View>

        {/* Detail Card */}
        <View style={styles.detailCard}>
          {detailRows.map((row, idx) => (
            <View key={idx}>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>{row.label}</Text>
                <View style={styles.detailRight}>
                  <Text style={styles.detailVal} numberOfLines={1}>{row.value}</Text>
                  {row.copyable && (
                    <TouchableOpacity
                      onPress={() => handleCopy(row.value, row.label.replace(':', ''))}
                      style={styles.copyBtn}
                    >
                      <Text style={styles.copyIcon}>📋</Text>
                    </TouchableOpacity>
                  )}
                  {row.hasAction && (
                    <TouchableOpacity
                      style={[styles.actionTag, row.actionDanger && styles.actionTagDanger]}
                      onPress={row.actionDanger ? handleCancel : undefined}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.actionTagText, row.actionDanger && styles.actionTagTextDanger]}>
                        {row.actionLabel}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              {row.isNote && (
                <Text style={styles.noteText}>Note : IF IFSC Mismatched , Do Not Pay</Text>
              )}
              {idx < detailRows.length - 1 && <View style={styles.rowDivider} />}
            </View>
          ))}
        </View>

        {/* Upload Voucher */}
        <TouchableOpacity
          style={styles.voucherBtn}
          onPress={handleUploadVoucher}
          activeOpacity={0.8}
        >
          <Text style={styles.voucherBtnText}>Upload Voucher  &gt;</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Go Pay Button */}
      <View style={styles.payBtnContainer}>
        <TouchableOpacity style={styles.payBtn} onPress={handlePay} activeOpacity={0.88}>
          <Text style={styles.payBtnText}>go pay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
    backgroundColor: '#F5F7FA',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 22,
    color: colors.primary,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 20,
    color: colors.primary,
  },
  container: { paddingHorizontal: 16, paddingBottom: 100 },

  amountSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  amountText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 32,
    color: colors.primary,
    marginBottom: 10,
  },
  expireRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  expireLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  expireTime: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },

  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  detailKey: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  detailRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1.5,
    justifyContent: 'flex-end',
  },
  detailVal: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 13,
    color: colors.textPrimary,
    flexShrink: 1,
    textAlign: 'right',
  },
  copyBtn: { marginLeft: 8 },
  copyIcon: { fontSize: 14 },
  actionTag: {
    marginLeft: 10,
    backgroundColor: '#E8F9F0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionTagDanger: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  actionTagText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 12,
    color: colors.primary,
  },
  actionTagTextDanger: {
    color: '#EF4444',
  },
  noteText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: '#F59E0B',
    marginBottom: 8,
    textAlign: 'right',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },

  voucherBtn: {
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 14,
  },
  voucherBtnText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 15,
    color: colors.primary,
  },

  payBtnContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: 28,
  },
  payBtn: {
    backgroundColor: colors.primary,
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
  },
  payBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
    color: '#fff',
  },
});
