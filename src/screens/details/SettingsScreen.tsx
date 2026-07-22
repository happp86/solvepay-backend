import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors, typography } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const serviceItems = [
  {
    id: '1',
    title: 'Telegram Official Channel',
    subtitle: 'Telegram Official Channel',
    icon: '✈️',
    color: '#2CA5E0',
    url: 'https://t.me/solvepay',
  },
  {
    id: '2',
    title: 'Whatsapp Official Channel',
    subtitle: 'Whatsapp Official Channel',
    icon: '💬',
    color: '#25D366',
    url: 'https://wa.me/919999999999',
  },
  {
    id: '3',
    title: 'Telegram Discussion Group',
    subtitle: 'Teleragm Online Customer Service',
    icon: '✈️',
    color: '#2CA5E0',
    url: 'https://t.me/solvepay_support',
  },
  {
    id: '4',
    title: '24/7 Online Customer Service',
    subtitle: 'Online Customer Service',
    icon: '🎧',
    color: '#18C964',
    url: '',
  },
];

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const handleContact = (item: typeof serviceItems[0]) => {
    if (item.url) {
      Linking.openURL(item.url).catch(() => {
        Alert.alert('Error', 'Could not open link. Please try again.');
      });
    } else {
      Alert.alert(item.title, 'Our support team will contact you shortly.');
    }
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.listCard}>
          {serviceItems.map((item, idx) => (
            <View key={item.id}>
              <View style={styles.serviceRow}>
                {/* Avatar/Icon */}
                <View style={[styles.iconCircle, { backgroundColor: item.color + '20' }]}>
                  <Text style={styles.iconEmoji}>{item.icon}</Text>
                </View>

                {/* Text */}
                <View style={styles.serviceText}>
                  <Text style={styles.serviceTitle}>{item.title}</Text>
                  <Text style={styles.serviceSubtitle}>{item.subtitle}</Text>
                </View>

                {/* Contact Button */}
                <TouchableOpacity
                  style={styles.contactBtn}
                  onPress={() => handleContact(item)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.contactBtnText}>Contact</Text>
                </TouchableOpacity>
              </View>
              {idx < serviceItems.length - 1 && <View style={styles.rowDivider} />}
            </View>
          ))}
        </View>
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
    paddingTop: 52,
    paddingBottom: 12,
    backgroundColor: '#F5F7FA',
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
  container: { padding: 16 },

  listCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconEmoji: { fontSize: 22 },
  serviceText: { flex: 1 },
  serviceTitle: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  serviceSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
  },
  contactBtn: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  contactBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
    color: '#fff',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
});
