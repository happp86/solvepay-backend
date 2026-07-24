import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors, typography } from '../../theme';
import { tokenStore } from '../../services/tokenStore';
import { apiClient } from '../../services/apiClient';

type Props = NativeStackScreenProps<RootStackParamList, 'Tasks'>;

interface DayReward {
  day: number;
  reward: number;
  requiredOrders: number;
  dateStr: string;
}

const rewardSchedule: DayReward[] = [
  { day: 1, reward: 30, requiredOrders: 10, dateStr: '2026-07-21' },
  { day: 2, reward: 30, requiredOrders: 10, dateStr: '2026-07-22' },
  { day: 3, reward: 60, requiredOrders: 20, dateStr: '2026-07-23' },
  { day: 4, reward: 60, requiredOrders: 20, dateStr: '2026-07-24' },
  { day: 5, reward: 90, requiredOrders: 30, dateStr: '2026-07-25' },
  { day: 6, reward: 90, requiredOrders: 30, dateStr: '2026-07-26' },
  { day: 7, reward: 100, requiredOrders: 45, dateStr: '2026-07-27' },
];

export const TasksScreen: React.FC<Props> = ({ navigation }) => {
  const user = tokenStore.getUser();
  const [completedOrdersCount, setCompletedOrdersCount] = useState<number>(0);
  const [claimedDays, setClaimedDays] = useState<{ [day: number]: boolean }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchUserOrders = useCallback(async () => {
    try {
      const res = await apiClient.get('/orders/my-orders');
      if (Array.isArray(res)) {
        const approved = res.filter((o: any) => o.status === 'COMPLETED');
        setCompletedOrdersCount(approved.length);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUserOrders();
  }, [fetchUserOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserOrders();
  };

  const handleClaim = async (item: DayReward) => {
    if (claimedDays[item.day]) {
      Alert.alert('Already Claimed', `You have already claimed Day ${item.day} reward.`);
      return;
    }

    if (completedOrdersCount < item.requiredOrders) {
      Alert.alert(
        'Task Incomplete 🔒',
        `You need to complete ${item.requiredOrders} approved orders to unlock Day ${item.day} reward of ₹${item.reward.toFixed(2)}. Current: ${completedOrdersCount}/${item.requiredOrders}`,
      );
      return;
    }

    // Credit to user balance
    try {
      if (user && user.wallet) {
        const currentBal = parseFloat(user.wallet.balance || '0');
        const newBal = (currentBal + item.reward).toFixed(2);
        await tokenStore.setUser({
          ...user,
          wallet: { ...user.wallet, balance: newBal },
        });
      }
      setClaimedDays((prev) => ({ ...prev, [item.day]: true }));

      Alert.alert(
        'Reward Claimed! 🥳',
        `Day ${item.day} Reward +₹${item.reward.toFixed(2)} credited directly to your wallet balance!`,
      );
    } catch {
      Alert.alert('Notice', 'Reward claimed!');
    }
  };

  const claimedCount = Object.keys(claimedDays).length;
  const overallProgressPercent = Math.min(100, Math.round((claimedCount / 7) * 100));

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reward Center</Text>
        <View style={{ width: 36 }} />
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
        {/* Overall Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeaderRow}>
            <Text style={styles.progressTitle}>Overall Progress</Text>
            <Text style={styles.progressPercent}>{overallProgressPercent}%</Text>
          </View>
          <Text style={styles.progressSub}>Complete daily rewards to unlock the final bonus</Text>

          {/* 7-Step Circle Indicators */}
          <View style={styles.stepCirclesRow}>
            {[1, 2, 3, 4, 5, 6, 7].map((num) => {
              const isClaimed = Boolean(claimedDays[num]);
              return (
                <View
                  key={num}
                  style={[
                    styles.stepCircle,
                    isClaimed && styles.stepCircleClaimed,
                  ]}
                >
                  <Text style={[styles.stepNumberText, isClaimed && styles.stepTextClaimed]}>
                    {num}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 7-Day Reward List Section Header */}
        <View style={styles.listHeaderRow}>
          <View>
            <Text style={styles.listTitle}>7-Day Reward List</Text>
            <Text style={styles.listSub}>Claim each day after completing the required orders</Text>
          </View>
          <View style={styles.claimedBadge}>
            <Text style={styles.claimedBadgeText}>{claimedCount}/7</Text>
          </View>
        </View>

        {/* List of 7 Days */}
        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          rewardSchedule.map((item) => {
            const isClaimed = Boolean(claimedDays[item.day]);
            const isEligible = completedOrdersCount >= item.requiredOrders;
            const progressRatio = Math.min(1, completedOrdersCount / item.requiredOrders);

            let statusLabel = 'In progress';
            let btnStyle = styles.btnInProgress;
            let textStyle = styles.btnTextInProgress;

            if (isClaimed) {
              statusLabel = 'Claimed ✓';
              btnStyle = styles.btnClaimed;
              textStyle = styles.btnTextClaimed;
            } else if (isEligible) {
              statusLabel = 'Claim';
              btnStyle = styles.btnClaimable;
              textStyle = styles.btnTextClaimable;
            } else if (item.day > 1 && completedOrdersCount < rewardSchedule[item.day - 2].requiredOrders) {
              statusLabel = 'Locked';
              btnStyle = styles.btnLocked;
              textStyle = styles.btnTextLocked;
            }

            return (
              <View key={item.day} style={styles.rewardCard}>
                {/* Left Yellow Badge */}
                <View style={styles.dayBadgeBox}>
                  <Text style={styles.dayBadgeText}>Day {item.day}</Text>
                </View>

                {/* Middle Details */}
                <View style={styles.cardCenter}>
                  <View style={styles.rewardRow}>
                    <Text style={styles.rewardTitle}>Reward ₹ {item.reward.toFixed(2)}</Text>
                    <Text style={styles.dateText}>{item.dateStr}</Text>
                  </View>

                  <Text style={styles.ordersCountSub}>
                    {completedOrdersCount}/{item.requiredOrders} Orders Completed
                  </Text>

                  {/* Yellow Progress Bar */}
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progressRatio * 100}%` }]} />
                  </View>
                </View>

                {/* Right Action Button */}
                <TouchableOpacity
                  style={[styles.claimBtn, btnStyle]}
                  onPress={() => handleClaim(item)}
                  disabled={isClaimed}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.claimBtnText, textStyle]}>{statusLabel}</Text>
                </TouchableOpacity>
              </View>
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

  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  progressPercent: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    color: '#0EA5E9',
  },
  progressSub: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },

  stepCirclesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleClaimed: {
    backgroundColor: '#0EA5E9',
  },
  stepNumberText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
    color: colors.textSecondary,
  },
  stepTextClaimed: {
    color: '#fff',
  },

  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  listTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  listSub: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  claimedBadge: {
    backgroundColor: '#E0F2FE',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  claimedBadgeText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
    color: '#0EA5E9',
  },

  rewardCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 1,
  },
  dayBadgeBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FEF9C3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dayBadgeText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 12,
    color: '#854D0E',
  },
  cardCenter: {
    flex: 1,
    marginRight: 10,
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  dateText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  ordersCountSub: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 6,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },

  claimBtn: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 12,
  },
  btnInProgress: {
    backgroundColor: '#F1F5F9',
  },
  btnTextInProgress: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 12,
    color: colors.textPrimary,
  },
  btnClaimable: {
    backgroundColor: colors.primary,
  },
  btnTextClaimable: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 12,
    color: '#fff',
  },
  btnClaimed: {
    backgroundColor: '#E2E8F0',
  },
  btnTextClaimed: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 12,
    color: '#64748B',
  },
  btnLocked: {
    backgroundColor: '#F1F5F9',
  },
  btnTextLocked: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    color: '#94A3B8',
  },
});
