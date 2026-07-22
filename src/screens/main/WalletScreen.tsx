import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../types/navigation';
import { colors, typography } from '../../theme';
import { COMMISSION_RATE } from '../../config/commission';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Wallet'>,
  NativeStackScreenProps<RootStackParamList>
>;

const filterTabs = ['Top Picks', '100-499', '500-8000', '8001+'];

const mockOrders = [
  { id: 'nVj438', amount: 240, income: 7.2, special: 3.0 },
  { id: 'IuIS7W', amount: 200, income: 6.0, special: 3.0 },
  { id: 'ItCI', amount: 250, income: 7.5, special: 3.0 },
  { id: 'MQhJ0Z', amount: 300, income: 9.0, special: 3.0 },
  { id: 'ASHp', amount: 479, income: 14.37, special: 3.0 },
  { id: 'BNx2K', amount: 150, income: 4.5, special: 3.0 },
];

const mockTool = {
  name: 'Freecharge',
  account: '8959731155',
};

export const WalletScreen: React.FC<Props> = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState('Top Picks');
  const [showToolModal, setShowToolModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');

  const handleClaim = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowToolModal(true);
  };

  const handleConfirm = () => {
    setShowToolModal(false);
    navigation.navigate('OrderDetails', { transactionId: selectedOrderId });
  };

  const balanceData = {
    balance: 9.6,
    reward: 6.6,
    pending: 0,
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Payment</Text>
        </View>

        {/* Top Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />

          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <Text style={styles.cashbackLabel}>Cashback</Text>
              <Text style={styles.cashbackRate}>{COMMISSION_RATE}%</Text>
              <View style={styles.miniBox}>
                <Text style={styles.miniLabel}>Balance</Text>
                <Text style={styles.miniAmt}>₹{balanceData.balance}</Text>
              </View>
            </View>

            <View style={styles.cardRight}>
              {/* Bar chart */}
              <View style={styles.barChart}>
                {[35, 60, 90, 70, 50, 75, 55].map((h, i) => (
                  <View
                    key={i}
                    style={[
                      styles.bar,
                      {
                        height: h * 0.65,
                        backgroundColor: i < 4 ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.3)',
                      },
                    ]}
                  />
                ))}
              </View>
              <View style={styles.miniBox}>
                <Text style={styles.miniLabel}>Reward</Text>
                <Text style={styles.miniAmt}>₹{balanceData.reward}</Text>
              </View>
              <View style={[styles.miniBox, { marginTop: 8 }]}>
                <Text style={styles.miniLabel}>Pending</Text>
                <Text style={styles.miniAmt}>₹{balanceData.pending}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Notice */}
        <View style={styles.noticeRow}>
          <Text style={styles.noticeIcon}>⚠️</Text>
          <Text style={styles.noticeText}>
            Please use Freecharge or Mobikwik or Paytm wallet for payment!
          </Text>
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {filterTabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterTab, activeFilter === tab && styles.filterTabActive]}
              onPress={() => setActiveFilter(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterTabText, activeFilter === tab && styles.filterTabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Order List */}
        <View style={styles.orderList}>
          {mockOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderTop}>
                <Text style={styles.orderCurrency}>INR</Text>
                <View style={styles.orderCodeRow}>
                  <Text style={styles.orderCodeLabel}>Code  </Text>
                  <Text style={styles.orderCode}>{order.id}</Text>
                </View>
              </View>

              <View style={styles.orderBottom}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderAmtLabel}>
                    Amount: <Text style={styles.orderAmt}>₹{order.amount}</Text>
                  </Text>
                  <View style={styles.incomeRow}>
                    <Text style={styles.orderIncomeLabel}>Income: </Text>
                    <Text style={styles.orderIncome}>+{order.income}</Text>
                    <View style={styles.specialBadge}>
                      <Text style={styles.specialText}>+₹{order.special.toFixed(2)} Special</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.claimBtn}
                  onPress={() => handleClaim(order.id)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.claimBtnText}>Claim</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Select Tool Modal */}
      <Modal
        visible={showToolModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowToolModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowToolModal(false)}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select tool</Text>

            <View style={styles.toolRow}>
              <View style={styles.toolIconBg}>
                <Text style={styles.toolIcon}>💳</Text>
              </View>
              <View style={styles.toolInfo}>
                <Text style={styles.toolName}>{mockTool.name}</Text>
                <Text style={styles.toolAccount}>{mockTool.account}</Text>
              </View>
              <View style={styles.radioOuter}>
                <View style={styles.radioInner} />
              </View>
            </View>

            <Text style={styles.modalNote}>
              * After selecting the payment tool, please use the selected tool to make payment,
              otherwise the account will not be credited.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowToolModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConfirm}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmBtnText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FA' },
  container: { paddingBottom: 30 },

  pageHeader: {
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 14,
  },
  pageTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 20,
    color: colors.primary,
  },

  balanceCard: {
    backgroundColor: colors.primary,
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 20,
    overflow: 'hidden',
    minHeight: 165,
  },
  decorCircle1: {
    position: 'absolute',
    top: -30,
    right: 55,
    width: 115,
    height: 115,
    borderRadius: 60,
    backgroundColor: '#F5A623',
    opacity: 0.88,
  },
  decorCircle2: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 95,
    height: 95,
    borderRadius: 50,
    backgroundColor: '#4A90D9',
    opacity: 0.78,
  },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between' },
  cardLeft: { flex: 1 },
  cashbackLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  cashbackRate: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 36,
    color: '#fff',
    marginBottom: 10,
  },
  miniBox: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
    marginRight: 8,
  },
  miniLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
  miniAmt: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    color: '#fff',
    marginTop: 2,
  },
  cardRight: { width: 125, alignItems: 'flex-end' },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 52,
    marginBottom: 8,
  },
  bar: { width: 12, borderRadius: 4, marginLeft: 3 },

  noticeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 10,
  },
  noticeIcon: { fontSize: 14, marginRight: 6, marginTop: 1 },
  noticeText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.primary,
    flex: 1,
    lineHeight: 18,
    textAlign: 'center',
  },

  filterScroll: { marginTop: 4 },
  filterContent: { paddingHorizontal: 16, paddingVertical: 8 },
  filterTab: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#E8E8E8',
    marginRight: 10,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: '#fff',
    fontFamily: typography.fontFamily.bold,
  },

  orderList: { paddingHorizontal: 16 },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderCurrency: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 22,
    color: colors.textPrimary,
  },
  orderCodeRow: { flexDirection: 'row', alignItems: 'center' },
  orderCodeLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  orderCode: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 13,
    color: colors.primary,
  },
  orderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderInfo: { flex: 1 },
  orderAmtLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  orderAmt: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  incomeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  orderIncomeLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  orderIncome: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
    color: colors.primary,
    marginRight: 6,
  },
  specialBadge: {
    backgroundColor: '#EEF8FF',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#BDE0FF',
  },
  specialText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 10,
    color: '#4A90D9',
  },
  claimBtn: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
    color: '#fff',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 24,
  },
  modalTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 20,
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  toolIconBg: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FF6A00',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  toolIcon: { fontSize: 22 },
  toolInfo: { flex: 1 },
  toolName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  toolAccount: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  modalNote: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    color: colors.primary,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    color: '#fff',
  },
});
