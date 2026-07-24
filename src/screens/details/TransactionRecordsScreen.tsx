import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors, typography } from '../../theme';
import { apiClient } from '../../services/apiClient';

type Props = NativeStackScreenProps<RootStackParamList, 'TransactionRecords'>;

const filterTabs = ['All', 'Approved', 'Pending', 'Cancelled'];

export const TransactionRecordsScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [allOrders, setAllOrders] = useState<any[]>([]);

  const fetchTransactionRecords = useCallback(async () => {
    try {
      const res = await apiClient.get('/orders/my-orders');
      if (Array.isArray(res)) {
        setAllOrders(res);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactionRecords();
  }, [fetchTransactionRecords]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactionRecords();
  };

  const filteredOrders = allOrders.filter((order) => {
    if (activeTab === 'Approved') return order.status === 'COMPLETED';
    if (activeTab === 'Pending') return order.status === 'IN_PROGRESS' || order.status === 'AVAILABLE';
    if (activeTab === 'Cancelled') return order.status === 'CANCELLED';
    return true; // All
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { text: '✓ Approved', style: styles.badgeGreen };
      case 'CANCELLED':
        return { text: '✕ Cancelled / Expired', style: styles.badgeRed };
      default:
        return { text: '⏳ Pending', style: styles.badgeYellow };
    }
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Records</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        {filterTabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No Records Found</Text>
            <Text style={styles.emptySub}>
              Your claimed orders and transaction history will appear here.
            </Text>
          </View>
        ) : (
          filteredOrders.map((item) => {
            const amt = parseFloat(item.amount || 0);
            const comm = parseFloat(item.estimatedEarnings || amt * 0.04);
            const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleString('en-IN') : '';
            const badge = getStatusBadge(item.status);

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() =>
                  navigation.navigate('OrderDetails', {
                    orderId: item.id,
                    orderNumber: item.orderNumber,
                    amount: amt,
                    status: item.status,
                    utrNumber: item.utrNumber,
                    createdAt: item.createdAt,
                  })
                }
                activeOpacity={0.8}
              >
                <View style={styles.rowBetween}>
                  <Text style={styles.orderNum}>NO: {item.orderNumber}</Text>
                  <Text style={[styles.badge, badge.style]}>{badge.text}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.rowBetween}>
                  <View>
                    <Text style={styles.label}>Amount</Text>
                    <Text style={styles.valAmount}>₹{amt.toFixed(2)}</Text>
                  </View>

                  <View style={{ alignItems: 'center' }}>
                    <Text style={styles.label}>4% Profit</Text>
                    <Text style={styles.valProfit}>+₹{comm.toFixed(2)}</Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.label}>Payout Tool</Text>
                    <Text style={styles.valTool}>{item.payoutWallet || 'Freecharge'}</Text>
                  </View>
                </View>

                {item.utrNumber ? (
                  <View style={styles.utrBox}>
                    <Text style={styles.utrText}>UTR: {item.utrNumber}</Text>
                  </View>
                ) : null}

                <Text style={styles.dateText}>{dateStr}</Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
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

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#fff',
    fontFamily: typography.fontFamily.bold,
  },

  container: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  centerLoading: { paddingVertical: 60, alignItems: 'center' },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: { fontSize: 44, marginBottom: 10 },
  emptyTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptySub: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },

  card: {
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
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNum: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  badge: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeGreen: {
    color: '#00d4aa',
    backgroundColor: '#E8F9F0',
  },
  badgeYellow: {
    color: '#D97706',
    backgroundColor: '#FEF3C7',
  },
  badgeRed: {
    color: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  label: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  valAmount: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  valProfit: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    color: '#00d4aa',
  },
  valTool: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
    color: colors.primary,
  },
  utrBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
  },
  utrText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 11,
    color: '#4F86F7',
  },
  dateText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 10,
    textAlign: 'right',
  },
});
