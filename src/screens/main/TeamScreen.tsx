import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  RefreshControl,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../types/navigation';
import { colors, typography } from '../../theme';
import { tokenStore } from '../../services/tokenStore';
import { authService } from '../../services/authService';
import { apiClient } from '../../services/apiClient';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Team'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const TeamScreen: React.FC<Props> = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  const user = tokenStore.getUser();
  const inviteCode = user?.referralCode || 'SPY2026';
  const downloadLink = `https://solvepay.app/download?ref=${inviteCode}`;

  const loadTeamData = useCallback(async () => {
    try {
      const res = await apiClient.get('/users/team');
      if (Array.isArray(res)) {
        setTeamMembers(res);
      }
    } catch {
      // Ignore
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTeamData();
  }, [loadTeamData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await authService.refreshUser();
    await loadTeamData();
  }, [loadTeamData]);

  const handleCopyLink = () => {
    Clipboard.setString(downloadLink);
    Alert.alert('Link Copied! 📋', `Referral Link copied:\n${downloadLink}\nShare it with friends to register under your team!`);
  };

  const handleShareLink = async () => {
    try {
      await Share.share({
        message: `Join SolvePay now & earn commission daily! 🚀\nDownload App & Register with my referral link:\n${downloadLink}\nInvite Code: ${inviteCode}`,
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.headerCentered}>
        <Text style={styles.headerTitle}>Team & Referral</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
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
        {/* Referral Link Card */}
        <View style={styles.referralCard}>
          <Text style={styles.refCardTitle}>👥 Team Referral Link</Text>
          <Text style={styles.refCardSub}>
            Share this link with friends so they can download the app APK & register under your team!
          </Text>

          <View style={styles.linkBox}>
            <Text style={styles.linkText} numberOfLines={1}>
              {downloadLink}
            </Text>
          </View>

          <View style={styles.refBtnRow}>
            <TouchableOpacity style={styles.copyLinkBtn} onPress={handleCopyLink} activeOpacity={0.8}>
              <Text style={styles.copyLinkBtnText}>📋 Copy Link</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareLinkBtn} onPress={handleShareLink} activeOpacity={0.8}>
              <Text style={styles.shareLinkBtnText}>🚀 Share App</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* My Team Members List Section */}
        <View style={styles.teamSectionCard}>
          <View style={styles.teamHeaderRow}>
            <Text style={styles.teamSectionTitle}>👥 My Team Members</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{teamMembers.length} Members</Text>
            </View>
          </View>

          {teamMembers.length === 0 ? (
            <View style={styles.emptyTeamBox}>
              <Text style={styles.emptyTeamIcon}>👥</Text>
              <Text style={styles.emptyTeamText}>
                No team members referred yet. Share your referral link above to start building your team!
              </Text>
            </View>
          ) : (
            teamMembers.map((member, idx) => (
              <View key={member.id || idx} style={styles.memberRow}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>👤</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberAppId}>App ID: {member.appId}</Text>
                  <Text style={styles.memberRefCode}>Referral Code: {member.referralCode}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FA' },

  headerCentered: {
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  headerTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 22,
    color: colors.primary,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 16,
  },

  // Referral Card
  referralCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  refCardTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  refCardSub: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  linkBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  linkText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    color: colors.primary,
  },
  refBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  copyLinkBtn: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  copyLinkBtnText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 13,
    color: colors.primary,
  },
  shareLinkBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginLeft: 8,
  },
  shareLinkBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
    color: '#fff',
  },

  // Team Members Section
  teamSectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  teamHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamSectionTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  countBadge: {
    backgroundColor: '#E0F2FE',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countBadgeText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 11,
    color: '#0EA5E9',
  },
  emptyTeamBox: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyTeamIcon: { fontSize: 36, marginBottom: 8 },
  emptyTeamText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  memberAvatarText: { fontSize: 16 },
  memberAppId: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  memberRefCode: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
    color: colors.primary,
    marginTop: 2,
  },
});
