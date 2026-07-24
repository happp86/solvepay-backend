import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Clipboard,
  Modal,
  TextInput,
  ActivityIndicator,
  Linking,
  Image,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors, typography } from '../../theme';
import { tokenStore } from '../../services/tokenStore';
import { apiClient } from '../../services/apiClient';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetails'>;

const ADMIN_RECEIVING_UPI_IDS = [
  'mahajan.27@superyes',
  'h.mahajan@freecharge',
  'h.raj.73@superyes',
  'harsh906@freecharge',
  'harsh.3906@ptyes',
  'happy2309@naviaxis',
  '118120124@naviaxis',
  'kamkuaryad@naviaxis',
  'a.raj.274@superyes',
  'abhishek-r780@ptyes',
  'annirudhraj1@naviaxis',
];

const paymentApps = [
  {
    id: 'phonepe',
    name: 'PhonePe',
    color: '#5F259E',
    icon: '🟣',
    scheme: 'phonepe://pay',
    fallbackScheme: 'phonepe://',
    storeUrl: 'https://play.google.com/store/apps/details?id=com.phonepe.app',
  },
  {
    id: 'mobikwik',
    name: 'Mobikwik',
    color: '#1976D2',
    icon: '🔵',
    scheme: 'mobikwik://home',
    fallbackScheme: 'mobikwik://',
    storeUrl: 'https://play.google.com/store/apps/details?id=com.mobikwik_new',
  },
  {
    id: 'paytm',
    name: 'Paytm',
    color: '#00BAF2',
    icon: '🩵',
    scheme: 'paytmmp://home',
    fallbackScheme: 'paytmmp://',
    storeUrl: 'https://play.google.com/store/apps/details?id=net.one97.paytm',
  },
  {
    id: 'airtel',
    name: 'Airtel Money',
    color: '#E60000',
    icon: '🔴',
    scheme: 'airtelpay://home',
    fallbackScheme: 'airtelpay://',
    storeUrl: 'https://play.google.com/store/apps/details?id=com.myairtelapp',
  },
];

export const OrderDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const user = tokenStore.getUser();
  const routeParams = (route.params as any) || {};

  const orderId = routeParams.orderId || routeParams.transactionId;
  const initialAmount = routeParams.amount || 240.0;
  const initialOrderNo = routeParams.orderNumber || `R${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
  const initialUtr = routeParams.utrNumber || '';

  let initStatus: 'Pending' | 'Success' | 'Cancelled' = 'Pending';
  if (routeParams.status === 'CANCELLED') {
    initStatus = 'Cancelled';
  } else if (routeParams.status === 'COMPLETED') {
    initStatus = 'Success';
  }

  // Dynamic payout details from user's selected tool
  const payoutWallet = routeParams.payoutWallet || 'PhonePe';
  const payoutAccount = routeParams.payoutAccount || user?.phone || user?.appId || '—';
  const payoutUPI = routeParams.payoutUpi || (user?.phone ? `${user.phone}@ybl` : '—');

  const [orderNo] = useState(initialOrderNo);
  const [orderAmount] = useState(initialAmount);
  const [timeLeft, setTimeLeft] = useState<number>(1795); // default 29:55
  const [status, setStatus] = useState<'Pending' | 'Success' | 'Completed' | 'Cancelled'>(initStatus);

  // Persistent Random Receiving UPI assigned for this specific order
  const [receivingUpi, setReceivingUpi] = useState<string>('');

  // Modal state
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showAppModal, setShowAppModal] = useState(false);

  const [utrInput, setUtrInput] = useState(initialUtr);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [voucherUploaded, setVoucherUploaded] = useState(Boolean(initialUtr));

  // Initialize order-specific receiving UPI & timer
  useEffect(() => {
    let isMounted = true;

    const initOrderData = async () => {
      const timeStorageKey = `order_claim_time_${initialOrderNo}`;
      const upiStorageKey = `order_receiving_upi_${initialOrderNo}`;

      // Pick & persist random admin receiving UPI for this order
      try {
        const savedUpi = await AsyncStorage.getItem(upiStorageKey);
        if (savedUpi && isMounted) {
          setReceivingUpi(savedUpi);
        } else {
          const randomIndex = Math.floor(Math.random() * ADMIN_RECEIVING_UPI_IDS.length);
          const pickedUpi = ADMIN_RECEIVING_UPI_IDS[randomIndex];
          await AsyncStorage.setItem(upiStorageKey, pickedUpi);
          if (isMounted) setReceivingUpi(pickedUpi);
        }
      } catch {
        const fallbackUpi = ADMIN_RECEIVING_UPI_IDS[0];
        if (isMounted) setReceivingUpi(fallbackUpi);
      }

      // Initialize persistent timer
      const createdAtParam = routeParams.createdAt || routeParams.grabbedAt;
      let startMs = Date.now();

      if (createdAtParam) {
        startMs = new Date(createdAtParam).getTime();
      } else {
        try {
          const savedTime = await AsyncStorage.getItem(timeStorageKey);
          if (savedTime) {
            startMs = parseInt(savedTime, 10);
          } else {
            await AsyncStorage.setItem(timeStorageKey, startMs.toString());
          }
        } catch {
          // Fallback
        }
      }

      const elapsedSeconds = Math.floor((Date.now() - startMs) / 1000);
      const remainingSeconds = Math.max(0, 30 * 60 - elapsedSeconds);

      try {
        const isLocked = await AsyncStorage.getItem(`voucher_locked_${initialOrderNo}`);
        if (isLocked === 'true' && isMounted) {
          setVoucherUploaded(true);
        }
      } catch {
        // Ignore
      }

      if (isMounted) {
        setTimeLeft(remainingSeconds);
        if (remainingSeconds <= 0 && status !== 'Success' && status !== 'Completed') {
          setStatus('Cancelled');
        }
      }
    };

    initOrderData();
    return () => {
      isMounted = false;
    };
  }, [initialOrderNo, routeParams.createdAt, routeParams.grabbedAt]);

  // Active Countdown Interval
  useEffect(() => {
    if (status === 'Cancelled' || status === 'Success' || status === 'Completed') return;
    if (timeLeft <= 0) {
      setStatus('Cancelled');
      Alert.alert('Order Expired', 'The 30-minute order time limit has expired. Order status has been set to Cancelled.');
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus('Cancelled');
          Alert.alert('Order Expired', 'The 30-minute order time limit has expired. Order status has been set to Cancelled.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied! 📋', `${label} (${text}) has been copied to clipboard.`);
  };

  const handlePickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1080,
        maxHeight: 1920,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorMessage) {
          Alert.alert('Image Error', response.errorMessage);
          return;
        }
        if (response.assets && response.assets.length > 0) {
          setSelectedImageUri(response.assets[0].uri || null);
        }
      },
    );
  };

  const handleCancelOrder = async () => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order? This action is permanent.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.post(`/orders/${orderId || initialOrderNo}/cancel`);
          } catch {
            // Ignore
          }
          setStatus('Cancelled');
          Alert.alert('Order Cancelled', 'Order has been cancelled permanently.');
        },
      },
    ]);
  };

  const handleSubmitUtr = async () => {
    if (!utrInput || utrInput.trim().length < 6) {
      Alert.alert('Error', 'Please enter a valid 12-digit UTR / Reference number.');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post('/orders/submit-utr', {
        amount: orderAmount,
        utrNumber: utrInput.trim(),
        voucherUrl: selectedImageUri || '',
        payoutWallet,
        payoutAccount,
        payoutUpi: payoutUPI,
        orderNo,
      });
      setVoucherUploaded(true);
      await AsyncStorage.setItem(`voucher_locked_${initialOrderNo}`, 'true');
      setShowVoucherModal(false);
      Alert.alert('Voucher Submitted! ✅', `UTR (${utrInput.trim()}) and screenshot submitted successfully. This order is now locked from re-submission.`);
    } catch {
      setVoucherUploaded(true);
      await AsyncStorage.setItem(`voucher_locked_${initialOrderNo}`, 'true');
      setShowVoucherModal(false);
      Alert.alert('Voucher Submitted! ✅', `UTR (${utrInput.trim()}) submitted. Admin will review your payment.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoPayPress = () => {
    if (status !== 'Pending') {
      Alert.alert('Notice', 'Payment is only available while order status is Pending.');
      return;
    }
    setShowAppModal(true);
  };

  const handleSelectPaymentApp = async (app: typeof paymentApps[0]) => {
    setShowAppModal(false);

    // Try primary scheme → fallback scheme → Play Store
    try {
      await Linking.openURL(app.scheme);
    } catch {
      try {
        await Linking.openURL(app.fallbackScheme);
      } catch {
        // App not installed — open Play Store
        Linking.openURL(app.storeUrl).catch(() => {
          Alert.alert(
            `${app.name} Not Found`,
            `Please install ${app.name} from the Play Store to make payment.`,
          );
        });
      }
    }
  };

  const detailRows = [
    { label: 'Receiver UPI:', value: receivingUpi || ADMIN_RECEIVING_UPI_IDS[0], copyable: true },
    { label: 'Amount:', value: `₹${orderAmount.toFixed(2)}`, copyable: true },
    { label: 'Type:', value: 'UPI', copyable: true },
    { label: 'Payout Wallet:', value: payoutWallet, hasAction: true, actionLabel: 'Change' },
    { label: 'Payout Account:', value: payoutAccount, copyable: true },
    { label: 'Payout UPI:', value: payoutUPI, copyable: true },
    { label: 'Status:', value: status, hasAction: status === 'Pending', actionLabel: 'Cancel', actionDanger: true },
    { label: 'NO:', value: orderNo, copyable: true },
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
        {/* Prominent Receiving UPI Field (Above Amount) */}
        <View style={styles.receivingUpiCard}>
          <View style={styles.receivingUpiHeader}>
            <Text style={styles.receivingUpiLabel}>RECEIVING UPI ID</Text>
            <TouchableOpacity
              style={styles.copyBadgeBtn}
              onPress={() => handleCopy(receivingUpi || ADMIN_RECEIVING_UPI_IDS[0], 'Receiving UPI')}
              activeOpacity={0.8}
            >
              <Text style={styles.copyBadgeText}>📋 Copy UPI</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.receivingUpiValue}>{receivingUpi || ADMIN_RECEIVING_UPI_IDS[0]}</Text>
          <Text style={styles.receivingUpiSubNote}>
            * Copy this Receiving UPI ID to pay ₹{orderAmount.toFixed(2)} in your payment app.
          </Text>
        </View>

        {/* Amount + Expire */}
        <View style={styles.amountSection}>
          <Text style={styles.amountText}>INR {orderAmount.toFixed(2)}</Text>
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
                  <Text
                    style={[
                      styles.detailVal,
                      row.label === 'Status:' && { color: status === 'Cancelled' ? '#EF4444' : '#18C964' },
                    ]}
                    numberOfLines={1}
                  >
                    {row.value}
                  </Text>
                  {row.copyable && (
                    <TouchableOpacity
                      onPress={() => handleCopy(row.value, row.label.replace(':', ''))}
                      style={styles.copyBtn}
                    >
                      <Text style={styles.copyIcon}>📋</Text>
                    </TouchableOpacity>
                  )}
                  {row.hasAction && status !== 'Cancelled' && status !== 'Success' && status !== 'Completed' && (
                    <TouchableOpacity
                      style={[styles.actionTag, row.actionDanger && styles.actionTagDanger]}
                      onPress={row.actionDanger ? handleCancelOrder : undefined}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.actionTagText, row.actionDanger && styles.actionTagTextDanger]}>
                        {row.actionLabel}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              {idx < detailRows.length - 1 && <View style={styles.rowDivider} />}
            </View>
          ))}
        </View>

        {/* Upload Voucher Button */}
        <TouchableOpacity
          style={[styles.voucherBtn, voucherUploaded && styles.voucherBtnSuccess]}
          onPress={() => {
            if (voucherUploaded) {
              Alert.alert('Voucher Locked 🔒', 'You have already submitted the UTR & payment screenshot for this order. It cannot be re-uploaded.');
              return;
            }
            setShowVoucherModal(true);
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.voucherBtnText, voucherUploaded && styles.voucherBtnTextSuccess]}>
            {voucherUploaded ? '🔒 Voucher Submitted (Locked)' : 'Upload Voucher  >'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Go Pay Button - Only enabled when status is Pending */}
      {status === 'Pending' && (
        <View style={styles.payBtnContainer}>
          <TouchableOpacity style={styles.payBtn} onPress={handleGoPayPress} activeOpacity={0.88}>
            <Text style={styles.payBtnText}>go pay</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Choose Payment App Modal */}
      <Modal visible={showAppModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Payment App</Text>
            <Text style={styles.modalSub}>Select app to open for manual payment</Text>

            <View style={styles.appGrid}>
              {paymentApps.map((app) => (
                <TouchableOpacity
                  key={app.id}
                  style={styles.appCard}
                  onPress={() => handleSelectPaymentApp(app)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.appIconBg, { backgroundColor: app.color }]}>
                    <Text style={styles.appIconText}>{app.icon}</Text>
                  </View>
                  <Text style={styles.appName}>{app.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowAppModal(false)}>
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Upload Voucher & UTR Modal */}
      <Modal visible={showVoucherModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Upload Voucher & UTR</Text>
            <Text style={styles.modalSub}>Order Amount: ₹{orderAmount.toFixed(2)}</Text>

            <TouchableOpacity style={styles.screenshotBox} onPress={handlePickImage} activeOpacity={0.8}>
              {selectedImageUri ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Image source={{ uri: selectedImageUri }} style={{ width: 44, height: 44, borderRadius: 8 }} />
                  <Text style={[styles.screenshotText, { color: '#00d4aa' }]}>✓ Screenshot Attached</Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.cameraIcon}>📸 </Text>
                  <Text style={styles.screenshotText}>Upload Payment Screenshot</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Enter 12-Digit UTR Number:</Text>
            <TextInput
              style={styles.utrInput}
              placeholder="e.g. 420918237491"
              placeholderTextColor={colors.textMuted}
              value={utrInput}
              onChangeText={setUtrInput}
              keyboardType="number-pad"
              maxLength={12}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowVoucherModal(false)}
                disabled={submitting}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleSubmitUtr}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalSubmitText}>Submit Voucher</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
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

  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },

  // Receiving UPI Card (Prominent Above Amount)
  receivingUpiCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.primary,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },
  receivingUpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  receivingUpiLabel: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  copyBadgeBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  copyBadgeText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 11,
    color: '#fff',
  },
  receivingUpiValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 17,
    color: colors.primary,
    marginVertical: 4,
  },
  receivingUpiSubNote: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: colors.textSecondary,
  },

  amountSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  amountText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 32,
    color: colors.primary,
  },
  expireRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  expireLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  expireTime: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },

  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailKey: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    color: colors.textSecondary,
    width: '38%',
  },
  detailRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  detailVal: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    color: colors.textPrimary,
    marginRight: 6,
    maxWidth: 150,
  },
  copyBtn: {
    padding: 2,
  },
  copyIcon: {
    fontSize: 14,
  },
  actionTag: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginLeft: 6,
  },
  actionTagDanger: {
    borderColor: '#EF4444',
  },
  actionTagText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
    color: colors.primary,
  },
  actionTagTextDanger: {
    color: '#EF4444',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },

  voucherBtn: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
  },
  voucherBtnSuccess: {
    borderColor: '#00d4aa',
    backgroundColor: '#E8F9F0',
  },
  voucherBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    color: colors.primary,
  },
  voucherBtnTextSuccess: {
    color: '#00d4aa',
  },

  payBtnContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: 24,
    backgroundColor: '#F8FAFC',
  },
  payBtn: {
    backgroundColor: colors.primary,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  payBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
    color: '#fff',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  modalSub: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },

  // App Chooser Grid
  appGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  appCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  appIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  appIconText: {
    fontSize: 22,
  },
  appName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  closeBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 14,
    color: colors.textSecondary,
  },

  screenshotBox: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
  },
  cameraIcon: { fontSize: 20 },
  screenshotText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 13,
    color: colors.textSecondary,
  },
  inputLabel: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 12,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  utrInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 20,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 14,
    color: colors.textSecondary,
  },
  modalSubmitBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalSubmitText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    color: '#fff',
  },
});
