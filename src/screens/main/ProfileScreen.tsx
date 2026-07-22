import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../types/navigation';
import { colors, typography } from '../../theme';

import { tokenStore } from '../../services/tokenStore';
import { authService } from '../../services/authService';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

const menuSections = [
  {
    items: [
      {
        icon: '📊',
        title: 'Transaction Records',
        subtitle: 'View all your transactions',
      },
      {
        icon: '🏦',
        title: 'Payment Tool',
        subtitle: 'Manage payment methods',
      },
    ],
  },
  {
    items: [
      {
        icon: '📞',
        title: 'Service',
        subtitle: 'Contact support channels',
      },
      {
        icon: '👥',
        title: 'Team',
        subtitle: 'View your team members',
        navigate: 'Team' as const,
      },
    ],
  },
];

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const user = tokenStore.getUser();
  const userName = user?.username || 'User';
  const appId = user?.appId || '100001';
  const phone = user?.phone ? `+91 ${user.phone}` : '+91 00000 00000';
  const inviteCode = user?.referralCode || 'SPY2026';
  const balance = user?.wallet?.balance ? `₹${parseFloat(user.wallet.balance).toFixed(2)}` : '₹0.00';

  const handleCopyAppId = () => {
    Clipboard.setString(appId);
    Alert.alert('Copied! 📋', `App ID (${appId}) copied to clipboard.`);
  };

  const handleCopyInviteCode = () => {
    Clipboard.setString(inviteCode);
    Alert.alert('Copied! 📋', `Invite Code (${inviteCode}) copied to clipboard.`);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await authService.logout();
          navigation.getParent()?.reset({
            index: 0,
            routes: [{ name: 'Splash' }],
          });
        },
      },
    ]);
  };

  const handleItemPress = (item: { navigate?: string; title: string }) => {
    if (item.navigate) {
      navigation.navigate(item.navigate as any);
    } else {
      Alert.alert(item.title, 'This feature is coming soon.');
    }
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>My Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>{userName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userName}</Text>
            <TouchableOpacity onPress={handleCopyAppId} activeOpacity={0.6}>
              <Text style={styles.userId}>App ID: {appId} 📋</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Row */}
        <View style={styles.balanceRow}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceValue}>{balance}</Text>
            <Text style={styles.balanceLabel}>Balance</Text>
          </View>
          <View style={styles.balanceDivider} />
          <TouchableOpacity style={styles.balanceItem} onPress={handleCopyInviteCode} activeOpacity={0.6}>
            <Text style={styles.balanceValue}>{inviteCode} 📋</Text>
            <Text style={styles.balanceLabel}>Invite Code</Text>
          </TouchableOpacity>
          <View style={styles.balanceDivider} />
          <View style={styles.balanceItem}>
            <Text style={styles.balanceValue}>{phone}</Text>
            <Text style={styles.balanceLabel}>Phone</Text>
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sIdx) => (
          <View key={sIdx} style={styles.menuCard}>
            {section.items.map((item, iIdx) => (
              <TouchableOpacity
                key={iIdx}
                style={styles.menuRow}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconBg}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <Text style={styles.menuArrow}>›</Text>
                {iIdx < section.items.length - 1 && <View style={styles.menuDivider} />}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>SolvePay v1.0.0</Text>
      </ScrollView>
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
    fontSize: 22,
    color: colors.primary,
  },
  container: { paddingHorizontal: 16, paddingBottom: 30 },

  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarLetter: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 24,
    color: '#fff',
  },
  userInfo: { flex: 1 },
  userName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  userId: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },

  balanceRow: {
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    paddingVertical: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  balanceLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  balanceDivider: {
    width: 1,
    backgroundColor: '#E8E8E8',
    marginVertical: 4,
  },

  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    position: 'relative',
  },
  menuIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuIcon: { fontSize: 18 },
  menuTextContainer: { flex: 1 },
  menuTitle: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  menuSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  menuArrow: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 22,
    color: colors.textMuted,
  },
  menuDivider: {
    position: 'absolute',
    bottom: 0,
    left: 50,
    right: 0,
    height: 1,
    backgroundColor: '#F0F0F0',
  },

  logoutBtn: {
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  logoutText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    color: '#EF4444',
  },
  versionText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 10,
  },
});
