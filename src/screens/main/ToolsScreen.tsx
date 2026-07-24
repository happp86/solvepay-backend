import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../types/navigation';
import { colors, typography } from '../../theme';
import { tokenStore } from '../../services/tokenStore';
import { authService } from '../../services/authService';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Tools'>,
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

const availablePaymentMethods = [
  {
    id: 'phonepe',
    name: 'PhonePe',
    minRange: 10.0,
    maxRange: 100000.0,
    bgColor: '#5F259E',
    iconLetter: 'P',
    defaultSuffix: '@ybl',
  },
  {
    id: 'mobikwik',
    name: 'Mobikwik',
    minRange: 10.0,
    maxRange: 100000.0,
    bgColor: '#1976D2',
    iconLetter: 'M',
    defaultSuffix: '@ikwik',
  },
  {
    id: 'paytm',
    name: 'Paytm',
    minRange: 10.0,
    maxRange: 100000.0,
    bgColor: '#00BAF2',
    iconLetter: 'P',
    defaultSuffix: '@paytm',
  },
  {
    id: 'airtel',
    name: 'Airtel',
    minRange: 10.0,
    maxRange: 100000.0,
    bgColor: '#E60000',
    iconLetter: 'A',
    defaultSuffix: '@airtel',
  },
];

export const ToolsScreen: React.FC<Props> = ({ navigation }) => {
  const user = tokenStore.getUser();
  const userKey = user?.id || user?.phone || 'guest';
  const storageKey = `user_payment_tools_${userKey}`;

  const [refreshing, setRefreshing] = useState(false);
  const [currentView, setCurrentView] = useState<'tools' | 'add'>('tools');
  const [userTools, setUserTools] = useState<UserTool[]>([]);
  const [activeTab, setActiveTab] = useState<'personal' | 'business'>('personal');
  const [selectedMethodId, setSelectedMethodId] = useState<string>('phonepe');

  // Input Modal State (Blank by default for manual entry)
  const [showBindModal, setShowBindModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [upiInput, setUpiInput] = useState('');

  const loadUserTools = useCallback(async () => {
    try {
      const savedToolsStr = await AsyncStorage.getItem(storageKey);
      if (savedToolsStr) {
        setUserTools(JSON.parse(savedToolsStr));
      } else {
        setUserTools([]);
      }
    } catch {
      setUserTools([]);
    } finally {
      setRefreshing(false);
    }
  }, [storageKey]);

  useEffect(() => {
    loadUserTools();
  }, [loadUserTools]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await authService.refreshUser();
    await loadUserTools();
  }, [loadUserTools]);

  const handleSureClick = () => {
    setPhoneInput('');
    setUpiInput('');
    setShowBindModal(true);
  };

  const validateUpiFormat = (upi: string): boolean => {
    const trimmed = upi.trim();
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiRegex.test(trimmed)) return false;

    const handle = trimmed.split('@')[1]?.toLowerCase();
    const invalidHandles = ['kuch', 'test', 'fake', 'dummy', 'none', 'null', 'abc', 'xyz', 'invalid'];
    if (invalidHandles.includes(handle)) return false;

    return true;
  };

  const handleConfirmBind = async () => {
    if (!phoneInput || phoneInput.trim().length !== 10) {
      Alert.alert('Validation Error ❌', 'Please enter your valid 10-digit mobile number manually.');
      return;
    }

    if (!upiInput || !validateUpiFormat(upiInput)) {
      Alert.alert(
        'Invalid UPI ID ❌',
        'Please enter a valid UPI ID format manually (e.g. 8959731155@ybl, 8252325637@paytm, 9876543210@ikwik). Fake handles like @kuch are not allowed.',
      );
      return;
    }

    const method = availablePaymentMethods.find((m) => m.id === selectedMethodId);
    if (method) {
      const newTool: UserTool = {
        id: `${method.id}_${Date.now()}`,
        name: method.name,
        account: upiInput.trim(),
        minRange: method.minRange,
        maxRange: method.maxRange,
        isEnabled: true,
      };

      const updatedTools = [...userTools.filter((t) => t.name !== method.name), newTool];
      setUserTools(updatedTools);
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedTools));

      setShowBindModal(false);
      setCurrentView('tools');

      Alert.alert(
        'Tool Linked Successfully! 🎉',
        `${method.name} linked with UPI: ${upiInput.trim()}! Status set to Enabled.`,
      );
    }
  };

  const handleToggleToolStatus = async (toolId: string) => {
    const updated = userTools.map((t) =>
      t.id === toolId ? { ...t, isEnabled: !t.isEnabled } : t,
    );
    setUserTools(updated);
    await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
  };

  // -------------------------------------------------------------
  // VIEW 2: Add Tool Screen (Choose Payment Method)
  // -------------------------------------------------------------
  if (currentView === 'add') {
    return (
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setCurrentView('tools')} style={styles.backBtn}>
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
              <Text style={[styles.tabSegmentText, activeTab === 'personal' && styles.tabSegmentTextActive]}>
                Personal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabSegment, activeTab === 'business' && styles.tabSegmentActive]}
              onPress={() => setActiveTab('business')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabSegmentText, activeTab === 'business' && styles.tabSegmentTextActive]}>
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
          <TouchableOpacity style={styles.sureBtn} onPress={handleSureClick} activeOpacity={0.85}>
            <Text style={styles.sureBtnText}>Sure</Text>
          </TouchableOpacity>
        </View>

        {/* Enter UPI Modal */}
        <Modal visible={showBindModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalSheetTitle}>
                Link {availablePaymentMethods.find((m) => m.id === selectedMethodId)?.name}
              </Text>
              <Text style={styles.modalSheetSub}>
                Manually enter your mobile number and verified UPI ID to bind your payment account.
              </Text>

              <Text style={styles.fieldLabel}>Mobile Number:</Text>
              <TextInput
                style={styles.inputField}
                value={phoneInput}
                onChangeText={setPhoneInput}
                keyboardType="phone-pad"
                placeholder="Enter 10-digit phone number"
                placeholderTextColor="#8892a4"
              />

              <Text style={styles.fieldLabel}>Enter Valid UPI ID:</Text>
              <TextInput
                style={styles.inputField}
                value={upiInput}
                onChangeText={setUpiInput}
                autoCapitalize="none"
                placeholder="e.g. 9876543210@ybl, 8252325637@paytm"
                placeholderTextColor="#8892a4"
              />

              <View style={styles.modalActionRow}>
                <TouchableOpacity style={styles.verifyBtn} onPress={handleConfirmBind}>
                  <Text style={styles.verifyBtnText}>Verify & Bind Tool</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowBindModal(false)}>
                  <Text style={styles.closeModalBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // -------------------------------------------------------------
  // VIEW 1: Tools List Only Screen (Money Icon Page)
  // -------------------------------------------------------------
  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.headerCentered}>
        <Text style={styles.headerTitle}>Payment Tools</Text>
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
        {userTools.length === 0 ? (
          <View style={styles.emptyToolsCard}>
            <Text style={styles.emptyToolsIcon}>💳</Text>
            <Text style={styles.emptyToolsTitle}>No Payment Tool Linked</Text>
            <Text style={styles.emptyToolsText}>
              Click 'Add Tool' below to bind your PhonePe, Mobikwik, Paytm, or Airtel UPI account for instant payments!
            </Text>
          </View>
        ) : (
          userTools.map((tool) => (
            <View key={tool.id} style={styles.toolCard}>
              <View style={styles.decorCircle1} />
              <View style={styles.decorCircle2} />

              <View style={styles.toolCardTop}>
                <View style={styles.toolCardInfo}>
                  <Text style={styles.toolCardName}>{tool.name}</Text>
                  <Text style={styles.toolCardAccount}>{tool.account}</Text>
                </View>

                {/* Toggleable Enabled/Disabled Badge */}
                <TouchableOpacity
                  style={[styles.enabledBadge, !tool.isEnabled && styles.disabledBadge]}
                  onPress={() => handleToggleToolStatus(tool.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.enabledBadgeText}>
                    {tool.isEnabled ? 'Enabled ✓' : 'Disabled ✕'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.rangeBox}>
                <Text style={styles.rangeBoxText}>
                  LimitedRange:{tool.minRange.toFixed(2)}~{tool.maxRange.toFixed(2)}
                </Text>
              </View>
            </View>
          ))
        )}

        {/* Add Tool Button */}
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
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
    fontSize: 22,
    color: colors.primary,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 16,
  },

  emptyToolsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  emptyToolsIcon: { fontSize: 44, marginBottom: 10 },
  emptyToolsTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 17,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptyToolsText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },

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
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  disabledBadge: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderColor: 'rgba(255,255,255,0.5)',
  },
  enabledBadgeText: {
    fontFamily: typography.fontFamily.bold,
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

  // Add Tool View
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

  // Modal Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalSheetTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
    color: colors.primary,
    textAlign: 'center',
  },
  modalSheetSub: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  fieldLabel: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 12,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  inputField: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 16,
  },
  modalActionRow: {
    gap: 10,
    marginTop: 10,
  },
  verifyBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  verifyBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    color: '#fff',
  },
  closeModalBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeModalBtnText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
