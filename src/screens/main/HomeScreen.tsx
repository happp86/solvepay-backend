import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../types/navigation';
import { colors, typography } from '../../theme';

import { tokenStore } from '../../services/tokenStore';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const mockTransactions = [
  { id: '1', type: 'Deposit', amount: 188.0, time: '10:32 AM', status: 'Completed' },
  { id: '2', type: 'Deposit', amount: 240.0, time: '09:15 AM', status: 'Completed' },
  { id: '3', type: 'Deposit', amount: 500.0, time: 'Yesterday', status: 'Completed' },
  { id: '4', type: 'Deposit', amount: 120.0, time: 'Yesterday', status: 'Completed' },
];

import Clipboard from '@react-native-clipboard/clipboard';
import { Alert } from 'react-native';

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const user = tokenStore.getUser();
  const userName = user?.username || 'User';
  const displayAppId = user?.appId || user?.referralCode || '100001';
  const balance = user?.wallet?.balance ? parseFloat(user.wallet.balance).toFixed(2) : '0.00';

  const handleCopyAppId = () => {
    Clipboard.setString(displayAppId);
    Alert.alert('Copied! 📋', `App ID (${displayAppId}) copied to clipboard. Share it with your friends!`);
  };

  const quickActions = [
    { icon: '₮', label: 'USDT', onPress: () => navigation.navigate('Wallet') },
    { icon: '📋', label: 'Task', onPress: () => navigation.navigate('Tasks') },
    { icon: '👥', label: 'Team', onPress: () => navigation.navigate('Team') },
    { icon: '📦', label: 'Order', onPress: () => navigation.navigate('Statistics') },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.userInfoRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>{userName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.userText}>
            <Text style={styles.userName}>Welcome, {userName}</Text>
            <TouchableOpacity onPress={handleCopyAppId} activeOpacity={0.6}>
              <Text style={styles.userId}>App ID: {displayAppId} 📋</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.bellBtn}>
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        {/* Decorative circles */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />

        <View style={styles.balanceCardContent}>
          <View style={styles.balanceLeft}>
            <Text style={styles.cashbackLabel}>Cashback</Text>
            <Text style={styles.cashbackRate}>3.5%</Text>

            {/* Balance Box */}
            <View style={styles.miniBox}>
              <Text style={styles.miniBoxLabel}>Balance</Text>
              <Text style={styles.miniBoxAmount}>₹{balance}</Text>
            </View>
          </View>

          <View style={styles.balanceRight}>
            {/* Bar chart visual */}
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

            {/* Reward & Pending */}
            <View style={styles.miniBox}>
              <Text style={styles.miniBoxLabel}>Reward</Text>
              <Text style={styles.miniBoxAmount}>₹0.00</Text>
            </View>
            <View style={[styles.miniBox, { marginTop: 8 }]}>
              <Text style={styles.miniBoxLabel}>Pending</Text>
              <Text style={styles.miniBoxAmount}>₹0.00</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Deposit & Withdrawal Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>⬆️</Text>
          <View>
            <Text style={styles.statLabel}>Total Deposit</Text>
            <Text style={styles.statValue}>₹1,048.00</Text>
          </View>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>⬇️</Text>
          <View>
            <Text style={styles.statLabel}>Withdrawal</Text>
            <Text style={styles.statValue}>₹0.00</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions Grid */}
      <View style={styles.quickGrid}>
        {quickActions.map((action, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.quickItem}
            onPress={action.onPress}
            activeOpacity={0.75}
          >
            <View style={styles.quickIconBg}>
              <Text style={styles.quickIcon}>{action.icon}</Text>
            </View>
            <Text style={styles.quickLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Newcomer Rewards Banner */}
      <View style={styles.rewardsBanner}>
        <View style={styles.rewardsLeft}>
          <Text style={styles.rewardsTitle}>🎁 Newcomer Rewards</Text>
          <Text style={styles.rewardsStatus}>In progress</Text>
        </View>
        <TouchableOpacity
          style={styles.rewardsBtn}
          onPress={() => navigation.navigate('Tasks')}
          activeOpacity={0.8}
        >
          <Text style={styles.rewardsBtnText}>View →</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Transactions */}
      <View style={styles.txSection}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <View style={styles.txCard}>
          {mockTransactions.map((tx) => (
            <TouchableOpacity
              key={tx.id}
              style={styles.txRow}
              onPress={() => navigation.navigate('OrderDetails', { transactionId: tx.id })}
              activeOpacity={0.7}
            >
              <View style={styles.txIconBg}>
                <Text style={styles.txIcon}>⬇️</Text>
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txType}>Deposit INR</Text>
                <Text style={styles.txTime}>{tx.time}</Text>
              </View>
              <View style={styles.txRight}>
                <Text style={styles.txAmount}>+₹{tx.amount.toFixed(2)}</Text>
                <Text style={styles.txStatus}>{tx.status}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FA' },
  container: { paddingBottom: 30 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 12,
  },
  userInfoRow: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarLetter: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
    color: '#fff',
  },
  userText: {},
  userName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  userId: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  bellIcon: { fontSize: 18 },

  balanceCard: {
    backgroundColor: colors.primary,
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 20,
    overflow: 'hidden',
    minHeight: 170,
  },
  decorCircle1: {
    position: 'absolute',
    top: -30,
    right: 60,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5A623',
    opacity: 0.85,
  },
  decorCircle2: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4A90D9',
    opacity: 0.75,
  },
  balanceCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceLeft: { flex: 1 },
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
    marginRight: 8,
  },
  miniBoxLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
  miniBoxAmount: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    color: '#fff',
    marginTop: 2,
  },
  balanceRight: { width: 130, alignItems: 'flex-end' },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 55,
    marginBottom: 8,
  },
  bar: {
    width: 12,
    borderRadius: 4,
    marginLeft: 3,
  },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: { fontSize: 22, marginRight: 10 },
  statLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: colors.textSecondary,
  },
  statValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    color: colors.textPrimary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E8E8E8',
    marginHorizontal: 16,
  },

  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  quickItem: { alignItems: 'center' },
  quickIconBg: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickIcon: { fontSize: 22 },
  quickLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
    color: colors.textPrimary,
  },

  rewardsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  rewardsLeft: {},
  rewardsTitle: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  rewardsStatus: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rewardsBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  rewardsBtnText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 13,
    color: colors.primary,
  },

  txSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  txCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  txIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txIcon: { fontSize: 16 },
  txInfo: { flex: 1 },
  txType: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  txTime: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  txRight: { alignItems: 'flex-end' },
  txAmount: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    color: colors.primary,
  },
  txStatus: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
