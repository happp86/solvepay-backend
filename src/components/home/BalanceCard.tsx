import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, borderRadius, typography, shadows } from '../../theme';

interface BalanceCardProps {
  balance: number;
  accountNumber: string;
  onSendPress: () => void;
  onReceivePress: () => void;
  onPayBillsPress: () => void;
  onTopUpPress: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  accountNumber,
  onSendPress,
  onReceivePress,
  onPayBillsPress,
  onTopUpPress,
}) => {
  const [hideBalance, setHideBalance] = useState(false);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.label}>Total Account Balance</Text>
          <Text style={styles.accountNo}>{accountNumber}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setHideBalance(!hideBalance)}
          style={styles.eyeButton}
          activeOpacity={0.7}
        >
          <Text style={styles.eyeIcon}>{hideBalance ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.balanceText}>
        {hideBalance ? '$ ••••••••' : `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
      </Text>

      <View style={styles.divider} />

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={onSendPress} activeOpacity={0.8}>
          <View style={styles.actionIconBg}>
            <Text style={styles.actionIcon}>↗</Text>
          </View>
          <Text style={styles.actionText}>Send</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onReceivePress} activeOpacity={0.8}>
          <View style={styles.actionIconBg}>
            <Text style={styles.actionIcon}>↙</Text>
          </View>
          <Text style={styles.actionText}>Receive</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onPayBillsPress} activeOpacity={0.8}>
          <View style={styles.actionIconBg}>
            <Text style={styles.actionIcon}>⚡</Text>
          </View>
          <Text style={styles.actionText}>Pay Bills</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onTopUpPress} activeOpacity={0.8}>
          <View style={styles.actionIconBg}>
            <Text style={styles.actionIcon}>+</Text>
          </View>
          <Text style={styles.actionText}>Top Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.darkBg,
    borderRadius: borderRadius.xl,
    padding: 22,
    marginHorizontal: 20,
    marginTop: 10,
    ...shadows.medium,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  accountNo: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    marginTop: 2,
  },
  eyeButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  eyeIcon: {
    fontSize: 16,
  },
  balanceText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.display,
    color: colors.textLight,
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionBtn: {
    alignItems: 'center',
  },
  actionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionIcon: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
  },
});
