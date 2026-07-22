import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors, typography } from '../../theme';
import { tokenStore } from '../../services/tokenStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Tasks'>;

interface TaskItem {
  id: string;
  title: string;
  subtitle: string;
  reward: number;
  icon: string;
  category: 'newcomer' | 'daily' | 'achievement';
  actionType: 'claim' | 'go' | 'share';
  isCompleted: boolean;
  isClaimed: boolean;
  targetScreen?: keyof RootStackParamList;
}

export const TasksScreen: React.FC<Props> = ({ navigation }) => {
  const user = tokenStore.getUser();
  const inviteCode = user?.referralCode || 'SPY2026';
  const [totalEarned, setTotalEarned] = useState<number>(115);
  const [checkedInDay, setCheckedInDay] = useState<number>(1);
  const [todayCheckedIn, setTodayCheckedIn] = useState<boolean>(false);

  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: '1',
      title: '🎉 Welcome Bonus',
      subtitle: 'Complete registration & log in to SolvePay',
      reward: 50,
      icon: '🎁',
      category: 'newcomer',
      actionType: 'claim',
      isCompleted: true,
      isClaimed: true,
    },
    {
      id: '2',
      title: '💳 First Deposit Cashback',
      subtitle: 'Deposit ₹100 or more into your SolvePay wallet',
      reward: 30,
      icon: '💰',
      category: 'newcomer',
      actionType: 'claim',
      isCompleted: true,
      isClaimed: false,
    },
    {
      id: '3',
      title: '👥 Invite 1 Friend',
      subtitle: 'Share your Invite Code and invite active user',
      reward: 100,
      icon: '🚀',
      category: 'newcomer',
      actionType: 'share',
      isCompleted: false,
      isClaimed: false,
    },
    {
      id: '4',
      title: '🏦 Bind Payment Method',
      subtitle: 'Add UPI ID or Bank Account in Payment Tools',
      reward: 20,
      icon: '🏦',
      category: 'newcomer',
      actionType: 'go',
      isCompleted: false,
      isClaimed: false,
      targetScreen: 'Settings',
    },
    {
      id: '5',
      title: '📲 Share App on WhatsApp',
      subtitle: 'Spread SolvePay with your friends and groups',
      reward: 15,
      icon: '📲',
      category: 'daily',
      actionType: 'share',
      isCompleted: false,
      isClaimed: false,
    },
    {
      id: '6',
      title: '📊 Process 1 Order',
      subtitle: 'Complete 1 payment transaction order',
      reward: 25,
      icon: '📦',
      category: 'achievement',
      actionType: 'go',
      isCompleted: false,
      isClaimed: false,
      targetScreen: 'Payment',
    },
  ]);

  const dailyCheckInRewards = [
    { day: 1, amount: 5 },
    { day: 2, amount: 10 },
    { day: 3, amount: 15 },
    { day: 4, amount: 20 },
    { day: 5, amount: 25 },
    { day: 6, amount: 30 },
    { day: 7, amount: 50 },
  ];

  const addRewardToWallet = async (amount: number) => {
    if (user && user.wallet) {
      const currentBal = parseFloat(user.wallet.balance || '0');
      const newBal = (currentBal + amount).toFixed(2);
      const updatedUser = {
        ...user,
        wallet: { ...user.wallet, balance: newBal },
      };
      await tokenStore.setUser(updatedUser);
    }
  };

  const handleCheckIn = async () => {
    if (todayCheckedIn) {
      Alert.alert('Already Checked In! 📅', 'You have already collected today\'s check-in bonus. Come back tomorrow!');
      return;
    }
    const currentDay = checkedInDay;
    const reward = dailyCheckInRewards[currentDay - 1].amount;

    await addRewardToWallet(reward);
    setTodayCheckedIn(true);
    setTotalEarned((prev) => prev + reward);

    Alert.alert(
      'Check-in Success! 🎉',
      `Day ${currentDay} Check-In Bonus: +₹${reward.toFixed(2)} added to your wallet balance!`,
    );
  };

  const handleClaimTask = async (task: TaskItem) => {
    if (task.isClaimed) return;

    if (task.actionType === 'share') {
      try {
        await Share.share({
          message: `Join me on SolvePay! Use my Invite Code: ${inviteCode} to earn instant Cashback & Bonus Rewards! 🚀`,
        });
        Clipboard.setString(inviteCode);
      } catch (e) {
        console.log(e);
      }
    }

    if (!task.isCompleted && task.actionType === 'go') {
      if (task.targetScreen) {
        navigation.navigate(task.targetScreen as any);
      }
      return;
    }

    // Mark as completed and claimed
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, isCompleted: true, isClaimed: true } : t)),
    );

    await addRewardToWallet(task.reward);
    setTotalEarned((prev) => prev + task.reward);

    Alert.alert(
      'Reward Claimed! 🥳',
      `Congratulations! +₹${task.reward.toFixed(2)} bonus reward has been added to your wallet!`,
    );
  };

  return (
    <View style={styles.screen}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task & Rewards Center</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Total Rewards Banner */}
        <View style={styles.rewardBanner}>
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerSubTitle}>Total Rewards Collected</Text>
            <Text style={styles.bannerAmount}>₹{totalEarned.toFixed(2)}</Text>
            <Text style={styles.bannerNote}>🎁 Bonus rewards credited directly to your balance</Text>
          </View>
          <View style={styles.bannerBadge}>
            <Text style={styles.bannerBadgeIcon}>🏆</Text>
          </View>
        </View>

        {/* 7-Day Check-in Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📅 7-Day Daily Check-In</Text>
            <Text style={styles.sectionBadgeText}>Day {checkedInDay}/7</Text>
          </View>

          <View style={styles.checkInGrid}>
            {dailyCheckInRewards.map((item) => {
              const isPast = item.day < checkedInDay || (item.day === checkedInDay && todayCheckedIn);
              const isCurrent = item.day === checkedInDay && !todayCheckedIn;
              return (
                <View
                  key={item.day}
                  style={[
                    styles.checkInItem,
                    isPast && styles.checkInDone,
                    isCurrent && styles.checkInCurrent,
                  ]}
                >
                  <Text style={[styles.checkInDayText, isPast && styles.textWhite]}>
                    Day {item.day}
                  </Text>
                  <Text style={[styles.checkInAmount, isPast && styles.textWhite]}>
                    +₹{item.amount}
                  </Text>
                  <Text style={styles.checkInStatusIcon}>
                    {isPast ? '✅' : item.day === 7 ? '🎁' : '🪙'}
                  </Text>
                </View>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.checkInBtn, todayCheckedIn && styles.checkInBtnDisabled]}
            onPress={handleCheckIn}
            activeOpacity={0.85}
          >
            <Text style={styles.checkInBtnText}>
              {todayCheckedIn ? 'Checked In Today ✅' : `Check In Now (+₹${dailyCheckInRewards[checkedInDay - 1].amount})`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Newcomer Exclusive Tasks */}
        <Text style={styles.groupTitle}>🎁 Newcomer Exclusive Tasks</Text>

        {tasks.map((task) => (
          <View key={task.id} style={styles.taskCard}>
            <View style={styles.taskIconBg}>
              <Text style={styles.taskIcon}>{task.icon}</Text>
            </View>
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskSubtitle}>{task.subtitle}</Text>
              <View style={styles.rewardTag}>
                <Text style={styles.rewardTagText}>Reward: +₹{task.reward.toFixed(2)}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.actionBtn,
                task.isClaimed
                  ? styles.btnClaimed
                  : task.isCompleted
                  ? styles.btnClaim
                  : styles.btnGo,
              ]}
              onPress={() => handleClaimTask(task)}
              disabled={task.isClaimed}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>
                {task.isClaimed
                  ? 'Claimed ✅'
                  : task.isCompleted
                  ? 'Claim 🎉'
                  : task.actionType === 'share'
                  ? 'Invite 🚀'
                  : 'Do Task →'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
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
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F2F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  container: { padding: 16, paddingBottom: 40 },

  rewardBanner: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  bannerLeft: { flex: 1 },
  bannerSubTitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },
  bannerAmount: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 30,
    color: '#fff',
    marginVertical: 4,
  },
  bannerNote: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
  },
  bannerBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerBadgeIcon: { fontSize: 26 },

  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  sectionBadgeText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 12,
    color: colors.primary,
  },
  checkInGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  checkInItem: {
    width: '23%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  checkInDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkInCurrent: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  checkInDayText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 10,
    color: colors.textSecondary,
  },
  checkInAmount: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 12,
    color: colors.textPrimary,
    marginVertical: 2,
  },
  checkInStatusIcon: { fontSize: 14 },
  textWhite: { color: '#fff' },

  checkInBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  checkInBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  checkInBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    color: '#fff',
  },

  groupTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  taskIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  taskIcon: { fontSize: 20 },
  taskInfo: { flex: 1, marginRight: 8 },
  taskTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  taskSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rewardTag: {
    backgroundColor: '#FEF3C7',
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  rewardTagText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 10,
    color: '#D97706',
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnGo: {
    backgroundColor: colors.primaryLight,
  },
  btnClaim: {
    backgroundColor: colors.primary,
  },
  btnClaimed: {
    backgroundColor: '#E2E8F0',
  },
  actionBtnText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 12,
    color: colors.primary,
  },
});
