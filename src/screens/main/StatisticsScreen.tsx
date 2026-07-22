import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../types/navigation';
import { colors, typography } from '../../theme';
import { tokenStore } from '../../services/tokenStore';

type Props = BottomTabScreenProps<MainTabParamList, 'Statistics'>;

export const StatisticsScreen: React.FC<Props> = () => {
  const user = tokenStore.getUser();
  const balance = user?.wallet?.balance ? parseFloat(user.wallet.balance).toFixed(2) : '9.60';
  const [isSellingOpen, setIsSellingOpen] = useState(false);

  const today = new Date();
  const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

  const toggleSelling = () => {
    setIsSellingOpen(!isSellingOpen);
    Alert.alert(
      isSellingOpen ? 'Selling Closed 🔒' : 'Selling Opened 🔓',
      isSellingOpen ? 'You are no longer accepting auto-orders.' : 'Your account is now active to receive auto-orders!',
    );
  };

  const handleSupportClick = () => {
    Alert.alert('Customer Support 🎧', 'Live support representative is available 24/7. Connect via Telegram or WhatsApp!');
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Statistics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Main Card Container matching Image 1 */}
        <View style={styles.mainCard}>
          {/* Section 1: Statistics */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.greenBar} />
            <Text style={styles.sectionHeaderTitle}>
              Statistics <Text style={styles.dateText}>({dateStr})</Text>
            </Text>
          </View>

          {/* 2x2 Grid for Statistics */}
          <View style={styles.grid2x2}>
            {/* Balance Card */}
            <View style={styles.gridCard}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.iconBg, { backgroundColor: '#4F86F7' }]}>
                  <Text style={styles.cardIcon}>💳</Text>
                </View>
                <Text style={styles.cardLabel}>Balance</Text>
              </View>
              <Text style={styles.cardValue}>₹ {balance}</Text>
            </View>

            {/* Sell Card */}
            <View style={styles.gridCard}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.iconBg, { backgroundColor: '#F5A623' }]}>
                  <Text style={styles.cardIcon}>💱</Text>
                </View>
                <Text style={styles.cardLabel}>Sell</Text>
              </View>
              <Text style={styles.cardValue}>₹ 0.00</Text>
            </View>

            {/* Deposit Card */}
            <View style={styles.gridCard}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.iconBg, { backgroundColor: '#10B981' }]}>
                  <Text style={styles.cardIcon}>💲</Text>
                </View>
                <Text style={styles.cardLabel}>Deposit</Text>
              </View>
              <Text style={styles.cardValue}>₹ 0.00</Text>
            </View>

            {/* Commission Card */}
            <View style={styles.gridCard}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.iconBg, { backgroundColor: '#EF4444' }]}>
                  <Text style={styles.cardIcon}>🔄</Text>
                </View>
                <Text style={styles.cardLabel}>Commission</Text>
              </View>
              <Text style={styles.cardValue}>₹ 0.00</Text>
            </View>
          </View>

          {/* Section 2: Payment */}
          <View style={[styles.sectionHeaderRow, { marginTop: 20 }]}>
            <View style={styles.greenBar} />
            <Text style={styles.sectionHeaderTitle}>Payment</Text>
          </View>

          {/* Exchange Rate Banner */}
          <View style={styles.exchangeRateBox}>
            <Text style={styles.exchangeRateLabel}>Real Time Exchange Rates(INR/USDT)</Text>
            <Text style={styles.exchangeRateValue}>110</Text>
          </View>

          {/* 2x2 Grid for Payment Details */}
          <View style={styles.grid2x2}>
            {/* In Process Amount */}
            <View style={styles.gridCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.flameIcon}>🔥</Text>
                <Text style={styles.cardLabel}>In Process Amount</Text>
              </View>
              <Text style={styles.cardValue}>₹ 0.00</Text>
            </View>

            {/* In Process Orders */}
            <View style={styles.gridCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.flameIcon}>🔥</Text>
                <Text style={styles.cardLabel}>In Process Orders</Text>
              </View>
              <Text style={styles.cardValue}>0</Text>
            </View>

            {/* Commission Rate */}
            <View style={styles.gridCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.flameIcon}>🔥</Text>
                <Text style={styles.cardLabel}>Commission Rate</Text>
              </View>
              <Text style={styles.cardValue}>3.00 %</Text>
            </View>

            {/* Estimated Income */}
            <View style={styles.gridCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.flameIcon}>🔥</Text>
                <Text style={styles.cardLabel}>Estimated Income</Text>
              </View>
              <Text style={styles.cardValue}>₹ 0.00</Text>
            </View>
          </View>
        </View>

        {/* Closed Selling / Open Selling Button */}
        <TouchableOpacity
          style={[styles.sellingBtn, isSellingOpen && styles.sellingBtnActive]}
          onPress={toggleSelling}
          activeOpacity={0.85}
        >
          <Text style={styles.sellingBtnText}>
            {isSellingOpen ? 'Open Selling' : 'Closed Selling'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Floating Customer Support Bot Icon */}
      <TouchableOpacity style={styles.supportBotBtn} onPress={handleSupportClick} activeOpacity={0.85}>
        <Text style={styles.botIconText}>🤖</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  pageHeader: {
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 14,
  },
  pageTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 24,
    color: colors.primary,
  },
  container: { paddingHorizontal: 16, paddingBottom: 40 },

  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  greenBar: {
    width: 4,
    height: 18,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginRight: 8,
  },
  sectionHeaderTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  dateText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.textMuted,
  },

  grid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '48.5%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconBg: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  cardIcon: {
    fontSize: 12,
    color: '#fff',
  },
  flameIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  cardLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
  },
  cardValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
    marginVertical: 4,
  },

  exchangeRateBox: {
    backgroundColor: '#DCFCE7',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  exchangeRateLabel: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#15803D',
  },
  exchangeRateValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    color: '#15803D',
  },

  sellingBtn: {
    backgroundColor: '#F5A623',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  sellingBtnActive: {
    backgroundColor: colors.primary,
  },
  sellingBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
    color: '#fff',
  },

  supportBotBtn: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  botIconText: {
    fontSize: 28,
  },
});
