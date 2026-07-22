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
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../types/navigation';
import { colors, typography } from '../../theme';
import { tokenStore } from '../../services/tokenStore';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Team'>,
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

const initialUserTools: UserTool[] = [
  {
    id: 'freecharge_1',
    name: 'Freecharge',
    account: 'harshu.27@freecharge',
    minRange: 10.0,
    maxRange: 100000.0,
    isEnabled: true,
  },
];

const availablePaymentMethods = [
  {
    id: 'freecharge',
    name: 'Freecharge',
    minRange: 10.0,
    maxRange: 100000.0,
    bgColor: '#FF5722',
    iconLetter: 'F',
    defaultAccount: 'harshu.27@freecharge',
  },
  {
    id: 'mobikwik',
    name: 'Mobikwik',
    minRange: 10.0,
    maxRange: 100000.0,
    bgColor: '#1976D2',
    iconLetter: 'M',
    defaultAccount: 'harshu.27@mobikwik',
  },
  {
    id: 'paytm',
    name: 'Paytm',
    minRange: 10.0,
    maxRange: 100000.0,
    bgColor: '#00BAF2',
    iconLetter: 'P',
    defaultAccount: '8959731155@paytm',
  },
  {
    id: 'induspay',
    name: 'IndusPay',
    minRange: 10.0,
    maxRange: 100000.0,
    bgColor: '#8E0000',
    iconLetter: 'I',
    defaultAccount: 'harshu@indus',
  },
  {
    id: 'bharatpebiz',
    name: 'BharatpeBiz',
    minRange: 10.0,
    maxRange: 100000.0,
    bgColor: '#00ACC1',
    iconLetter: 'B',
    defaultAccount: '9876543210@bharatpe',
  },
  {
    id: 'navi',
    name: 'Navi',
    minRange: 10.0,
    maxRange: 100000.0,
    bgColor: '#4A148C',
    iconLetter: 'N',
    defaultAccount: 'harshu@navi',
  },
];

export const TeamScreen: React.FC<Props> = ({ navigation }) => {
  const user = tokenStore.getUser();
  const inviteCode = user?.referralCode || 'SPY2026';
  const downloadLink = `https://solvepay.app/download?ref=${inviteCode}`;

  const [currentView, setCurrentView] = useState<'list' | 'add'>('list');
  const [userTools, setUserTools] = useState<UserTool[]>(initialUserTools);
  const [activeTab, setActiveTab] = useState<'personal' | 'business'>('personal');
  const [selectedMethodId, setSelectedMethodId] = useState<string>('freecharge');

  const handleCopyLink = () => {
    Clipboard.setString(downloadLink);
    Alert.alert('Link Copied! 📋', `Referral Link copied:\n${downloadLink}\nShare it with friends to download APK and register!`);
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

  const handleAddSure = () => {
    const method = availablePaymentMethods.find((m) => m.id === selectedMethodId);
    if (method) {
      const exists = userTools.some((t) => t.name === method.name);
      if (!exists) {
        const newTool: UserTool = {
          id: `${method.id}_${Date.now()}`,
          name: method.name,
          account: method.defaultAccount,
          minRange: method.minRange,
          maxRange: method.maxRange,
          isEnabled: true,
        };
        setUserTools((prev) => [...prev, newTool]);
      }
    }
    setCurrentView('list');
  };

  // -------------------------------------------------------------
  // VIEW 2: Add Tool Screen
  // -------------------------------------------------------------
  if (currentView === 'add') {
    return (
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setCurrentView('list')} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Tool</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.addContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.chooseTitle}>Choose your payment</Text>

          {/* Personal / Business Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabSegment, activeTab === 'personal' && styles.tabSegmentActive]}
              onPress={() => setActiveTab('personal')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabSegmentText,
                  activeTab === 'personal' && styles.tabSegmentTextActive,
                ]}
              >
                Personal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabSegment, activeTab === 'business' && styles.tabSegmentActive]}
              onPress={() => setActiveTab('business')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabSegmentText,
                  activeTab === 'business' && styles.tabSegmentTextActive,
                ]}
              >
                Business
              </Text>
            </TouchableOpacity>
          </View>

          {/* Payment Methods List */}
          <View style={styles.methodsList}>
            {availablePaymentMethods.map((method) => {
              const isSelected = selectedMethodId === method.id;
              return (
                <TouchableOpacity
                  key={method.id}
                  style={[styles.methodCard, isSelected && styles.methodCardSelected]}
                  onPress={() => setSelectedMethodId(method.id)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.methodIconBg, { backgroundColor: method.bgColor }]}>
                    <Text style={styles.methodIconText}>{method.iconLetter}</Text>
                  </View>

                  <View style={styles.methodInfo}>
                    <Text style={styles.methodName}>{method.name}</Text>
                    <Text style={styles.methodRange}>
                      Payin {method.minRange.toFixed(2)} - {method.maxRange.toFixed(2)}
                    </Text>
                  </View>

                  <Text style={styles.payoutTag}>Payout</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Sure Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.sureBtn} onPress={handleAddSure} activeOpacity={0.85}>
            <Text style={styles.sureBtnText}>Sure</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // -------------------------------------------------------------
  // VIEW 1: Tool List & Team Referral Link Screen
  // -------------------------------------------------------------
  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.headerCentered}>
        <Text style={styles.headerTitle}>Team & Tools</Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {/* Referral / APK Download Link Card */}
        <View style={styles.referralCard}>
          <Text style={styles.refCardTitle}>👥 Team Referral Link</Text>
          <Text style={styles.refCardSub}>Share this link with friends so they can download the app APK & register under your team!</Text>
          
          <View style={styles.linkBox}>
            <Text style={styles.linkText} numberOfLines={1}>{downloadLink}</Text>
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

        {/* Tools Section */}
        {userTools.map((tool) => (
          <View key={tool.id} style={styles.toolCard}>
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />

            <View style={styles.toolCardTop}>
              <View style={styles.toolCardInfo}>
                <Text style={styles.toolCardName}>{tool.name}</Text>
                <Text style={styles.toolCardAccount}>{tool.account}</Text>
              </View>

              <View style={styles.enabledBadge}>
                <Text style={styles.enabledBadgeText}>
                  {tool.isEnabled ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
            </View>

            <View style={styles.rangeBox}>
              <Text style={styles.rangeBoxText}>
                LimitedRange:{tool.minRange.toFixed(2)}~{tool.maxRange.toFixed(2)}
              </Text>
            </View>
          </View>
        ))}

        {/* Add Button */}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setCurrentView('add')}
          activeOpacity={0.85}
        >
          <Text style={styles.addBtnText}>Add Tool</Text>
        </TouchableOpacity>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
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
    fontSize: 22,
    color: colors.primary,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 10,
  },

  // Referral Card
  referralCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
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

  // Tool Card
  toolCard: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  decorCircle1: {
    position: 'absolute',
    top: -30,
    right: 40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5A623',
    opacity: 0.85,
  },
  decorCircle2: {
    position: 'absolute',
    top: -10,
    right: -20,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#4A90D9',
    opacity: 0.75,
  },
  toolCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  toolCardInfo: { flex: 1 },
  toolCardName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 20,
    color: '#fff',
  },
  toolCardAccount: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  enabledBadge: {
    borderWidth: 1.5,
    borderColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  enabledBadgeText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#fff',
  },
  rangeBox: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  rangeBoxText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
    color: '#fff',
  },

  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 6,
  },
  addBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 17,
    color: '#fff',
  },

  // Add Tool Screen
  addContent: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  chooseTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 20,
    color: colors.primary,
    textAlign: 'center',
    marginVertical: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
  },
  tabSegment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 26,
  },
  tabSegmentActive: {
    backgroundColor: colors.primary,
  },
  tabSegmentText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 14,
    color: colors.textSecondary,
  },
  tabSegmentTextActive: {
    color: '#fff',
    fontFamily: typography.fontFamily.bold,
  },

  methodsList: {},
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  methodCardSelected: {
    borderColor: colors.primary,
  },
  methodIconBg: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  methodIconText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 20,
    color: '#fff',
  },
  methodInfo: { flex: 1 },
  methodName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  methodRange: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    color: '#4A90D9',
    marginTop: 2,
  },
  payoutTag: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
    color: colors.primary,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
  },
  sureBtn: {
    backgroundColor: colors.primary,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  sureBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 17,
    color: '#fff',
  },
});
