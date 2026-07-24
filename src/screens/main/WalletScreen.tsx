import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../types/navigation';
import { colors, typography } from '../../theme';
import { COMMISSION_RATE } from '../../config/commission';
import { tokenStore } from '../../services/tokenStore';
import { authService } from '../../services/authService';
import { apiClient } from '../../services/apiClient';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Wallet'>,
  NativeStackScreenProps<RootStackParamList>
>;

interface UserTool {
  id: string;
  name: string;
  account: string;
  minRange: number;
  maxRange: number;
  isEnabled: boolean;
}

const filterTabs = ['Top Picks', '100-499', '500-8000', '8001+'];

const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const generateDynamicOrdersPool = () => {
  const range100 = [100, 120, 125, 137, 150, 180, 200, 220, 240, 250, 280, 300, 320, 357, 380, 420, 450, 479, 490];
  const range500 = [500, 650, 780, 890, 1200, 1500, 1800, 2200, 2500, 3200, 3800, 4500, 4800, 5200, 6000, 7200, 7800];
  const range8000 = [8500, 9500, 12000, 14000, 18500, 22000, 25000, 32000, 45000];

  const pool: { id: string; amount: number }[] = [];

  const addRandoms = (list: number[], count: number) => {
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    for (let i = 0; i < count; i++) {
      const amt = shuffled[i % shuffled.length];
      const codeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let c = 0; c < 6; c++) {
        code += codeChars.charAt(Math.floor(Math.random() * codeChars.length));
      }
      pool.push({ id: code, amount: amt });
    }
  };

  addRandoms(range100, 8);
  addRandoms(range500, 8);
  addRandoms(range8000, 5);

  return shuffleArray(pool);
};

export const WalletScreen: React.FC<Props> = ({ navigation }) => {
  const user = tokenStore.getUser();
  const userKey = user?.id || user?.phone || 'guest';
  const storageKey = `user_payment_tools_${userKey}`;

  const [activeFilter, setActiveFilter] = useState('Top Picks');
  const [showToolModal, setShowToolModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState(() => generateDynamicOrdersPool());
  const [userTools, setUserTools] = useState<UserTool[]>([]);
  const [selectedToolId, setSelectedToolId] = useState<string>('');
  const [, forceUpdate] = useState(0);

  const loadTools = useCallback(async () => {
    try {
      const savedToolsStr = await AsyncStorage.getItem(storageKey);
      if (savedToolsStr) {
        const parsed = JSON.parse(savedToolsStr);
        setUserTools(parsed);
        if (parsed.length > 0 && !selectedToolId) {
          setSelectedToolId(parsed[0].id);
        }
      } else {
        setUserTools([]);
      }
    } catch {
      setUserTools([]);
    }
  }, [storageKey, selectedToolId]);

  useEffect(() => {
    loadTools();
  }, [loadTools]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await authService.refreshUser();
    await loadTools();
    setOrders(generateDynamicOrdersPool());
    forceUpdate((n) => n + 1);
    setRefreshing(false);
  }, [loadTools]);

  const handleFilterChange = (tab: string) => {
    setActiveFilter(tab);
    setOrders(generateDynamicOrdersPool());
  };

  const handleClaim = async (orderId: string) => {
    const savedToolsStr = await AsyncStorage.getItem(storageKey);
    let currentTools: UserTool[] = [];
    if (savedToolsStr) {
      currentTools = JSON.parse(savedToolsStr);
    }
    const enabledTools = currentTools.filter((t) => t.isEnabled !== false);

    if (enabledTools.length === 0) {
      Alert.alert(
        'No Payment Tool Linked ⚠️',
        'You must bind at least one payment tool (Freecharge, Mobikwik, Paytm) before claiming orders.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Add Tool Now',
            onPress: () => navigation.navigate('Tools'),
          },
        ],
      );
      return;
    }

    setUserTools(enabledTools);
    if (!selectedToolId || !enabledTools.some((t) => t.id === selectedToolId)) {
      setSelectedToolId(enabledTools[0].id);
    }
    setSelectedOrderId(orderId);
    setShowToolModal(true);
  };

  const handleConfirm = async () => {
    setShowToolModal(false);

    const activeTool = userTools.find((t) => t.id === selectedToolId) || userTools[0];
    if (!activeTool) {
      Alert.alert('Error', 'Please select a valid payment tool.');
      return;
    }

    const matchedOrder = orders.find((o) => o.id === selectedOrderId);
    const amountVal = matchedOrder ? matchedOrder.amount : 240.0;
    const generatedOrderNo = `R${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;

    const toolName = activeTool.name;
    const toolAccount = user?.phone || user?.appId || activeTool.account;
    const toolUpi = activeTool.account;

    try {
      const created = await apiClient.post('/orders/submit-utr', {
        amount: amountVal,
        utrNumber: '',
        payoutWallet: toolName,
        payoutAccount: toolAccount,
        payoutUpi: toolUpi,
        orderNo: generatedOrderNo,
      });

      navigation.navigate('OrderDetails', {
        orderId: created?.id || generatedOrderNo,
        orderNumber: generatedOrderNo,
        amount: amountVal,
        status: 'IN_PROGRESS',
        utrNumber: '',
        payoutWallet: toolName,
        payoutAccount: toolAccount,
        payoutUpi: toolUpi,
      });
    } catch {
      navigation.navigate('OrderDetails', {
        orderId: generatedOrderNo,
        orderNumber: generatedOrderNo,
        amount: amountVal,
        status: 'IN_PROGRESS',
        utrNumber: '',
        payoutWallet: toolName,
        payoutAccount: toolAccount,
        payoutUpi: toolUpi,
      });
    }
  };

  const balanceData = {
    balance: user?.wallet?.balance ? parseFloat(user.wallet.balance).toFixed(2) : '0.00',
    reward: user?.wallet?.totalEarned ? parseFloat(user.wallet.totalEarned).toFixed(2) : '0.00',
    pending: '0.00',
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Payment</Text>
        </View>

        {/* Top Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />

          <View style={styles.balanceCardContent}>
            <View style={styles.balanceLeft}>
              <Text style={styles.cashbackLabel}>Cashback</Text>
              <Text style={styles.cashbackRate}>{COMMISSION_RATE}%</Text>

              <View style={styles.miniBox}>
                <Text style={styles.miniBoxLabel}>Balance</Text>
                <Text style={styles.miniBoxAmount}>₹{balanceData.balance}</Text>
              </View>
            </View>

            <View style={styles.balanceRight}>
              <View style={styles.barChart}>
                {[40, 65, 100, 75, 55, 80, 60].map((h, i) => (
                  <View
                    key={i}
                    style={[
                      styles.bar,
                      {
                        height: h * 0.7,
                        backgroundColor: i < 4 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)',
                      },
                    ]}
                  />
                ))}
              </View>

              <View style={styles.miniBox}>
                <Text style={styles.miniBoxLabel}>Reward</Text>
                <Text style={styles.miniBoxAmount}>+₹3.00</Text>
              </View>
              <View style={[styles.miniBox, { marginTop: 8 }]}>
                <Text style={styles.miniBoxLabel}>Pending</Text>
                <Text style={styles.miniBoxAmount}>₹{balanceData.pending}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Warning Alert Banner */}
        <View style={styles.warningBanner}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            Please use PhonePe, Mobikwik, Paytm or Airtel wallet for payment!
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
              onPress={() => handleFilterChange(tab)}
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
          {orders
            .filter((order) => {
              if (activeFilter === '100-499') return order.amount >= 100 && order.amount <= 499;
              if (activeFilter === '500-8000') return order.amount >= 500 && order.amount <= 8000;
              if (activeFilter === '8001+') return order.amount >= 8001;
              return true;
            })
            .map((order) => {
              const income = (order.amount * (COMMISSION_RATE / 100)).toFixed(2);
              const specialBonus = 3.0;
              return (
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
                        <Text style={styles.orderIncome}>+{income}</Text>
                        <View style={styles.specialBadge}>
                          <Text style={styles.specialText}>+₹{specialBonus.toFixed(2)} Special</Text>
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
              );
            })}
        </View>
      </ScrollView>

      {/* Dynamic Select Tool Modal */}
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

            {userTools.map((tool) => {
              const isSelected = selectedToolId === tool.id;
              return (
                <TouchableOpacity
                  key={tool.id}
                  style={[styles.toolRow, isSelected && styles.toolRowSelected]}
                  onPress={() => setSelectedToolId(tool.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.toolIconBg}>
                    <Text style={styles.toolIcon}>💳</Text>
                  </View>
                  <View style={styles.toolInfo}>
                    <Text style={styles.toolName}>{tool.name}</Text>
                    <Text style={styles.toolAccount}>{tool.account}</Text>
                  </View>
                  <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}

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
  pageHeader: {
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pageTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 22,
    color: colors.primary,
  },
  container: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },

  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  decorCircle1: {
    position: 'absolute',
    top: -40,
    right: 30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F5A623',
    opacity: 0.85,
  },
  decorCircle2: {
    position: 'absolute',
    top: -10,
    right: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#4A90D9',
    opacity: 0.75,
  },
  balanceCardContent: { flexDirection: 'row', justifyContent: 'space-between' },
  balanceLeft: { flex: 1 },
  cashbackLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },
  cashbackRate: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 34,
    color: '#fff',
    marginVertical: 4,
  },
  miniBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  miniBoxLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
  },
  miniBoxAmount: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    color: '#fff',
  },
  balanceRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 45, marginBottom: 8 },
  bar: { width: 4, borderRadius: 2 },

  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  warningIcon: { fontSize: 16, marginRight: 8 },
  warningText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    color: '#B45309',
    flex: 1,
  },

  filterScroll: { marginBottom: 16 },
  filterContent: { gap: 8 },
  filterTab: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  filterTabActive: { backgroundColor: colors.primary },
  filterTabText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 13,
    color: colors.textSecondary,
  },
  filterTabTextActive: { color: '#fff', fontFamily: typography.fontFamily.bold },

  orderList: {},
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderCurrency: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  orderCodeRow: { flexDirection: 'row', alignItems: 'center' },
  orderCodeLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  orderCode: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 12,
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
    fontSize: 16,
    color: colors.textPrimary,
  },
  incomeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap', gap: 6 },
  orderIncomeLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  orderIncome: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    color: colors.primary,
  },
  specialBadge: {
    backgroundColor: '#E0F2FE',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  specialText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 10,
    color: '#0EA5E9',
  },
  claimBtn: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 9,
  },
  claimBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    color: '#fff',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  toolRowSelected: {
    borderColor: colors.primary,
    backgroundColor: '#E8F9F0',
  },
  toolIconBg: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FF5722',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  toolIcon: { fontSize: 20 },
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
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  modalNote: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: colors.textSecondary,
    marginVertical: 14,
    lineHeight: 16,
  },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    color: colors.textSecondary,
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
    fontSize: 14,
    color: '#fff',
  },
});
