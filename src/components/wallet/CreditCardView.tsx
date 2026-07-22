import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { VirtualCard } from '../../types/data';
import { colors, borderRadius, typography, shadows } from '../../theme';

interface CreditCardViewProps {
  card: VirtualCard;
  onPress?: () => void;
}

export const CreditCardView: React.FC<CreditCardViewProps> = ({ card, onPress }) => {
  const isPlatinum = card.tier === 'Platinum';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.cardContainer,
        { backgroundColor: isPlatinum ? colors.darkCard : '#1A2332' },
      ]}
    >
      <View style={styles.topRow}>
        <Text style={styles.brandTitle}>SolvePay</Text>
        <View style={styles.tierBadge}>
          <Text style={styles.tierText}>{card.tier}</Text>
        </View>
      </View>

      <View style={styles.chipRow}>
        <View style={styles.chip} />
        <Text style={styles.contactless}>)))</Text>
      </View>

      <Text style={styles.cardNumber}>{card.cardNumber}</Text>

      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.cardLabel}>CARD HOLDER</Text>
          <Text style={styles.cardValue}>{card.cardHolder}</Text>
        </View>
        <View>
          <Text style={styles.cardLabel}>EXPIRES</Text>
          <Text style={styles.cardValue}>{card.expiryDate}</Text>
        </View>
        <Text style={styles.typeText}>{card.cardType}</Text>
      </View>

      {card.isFrozen && (
        <View style={styles.frozenOverlay}>
          <Text style={styles.frozenText}>🔒 CARD FROZEN</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 300,
    height: 180,
    borderRadius: borderRadius.xl,
    padding: 20,
    marginRight: 16,
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...shadows.medium,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  tierBadge: {
    backgroundColor: 'rgba(24, 201, 100, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  tierText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs,
    color: colors.primary,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  chip: {
    width: 34,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#E2B93B',
  },
  contactless: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardNumber: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.md,
    color: colors.textLight,
    letterSpacing: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    marginTop: 1,
  },
  typeText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.md,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  frozenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frozenText: {
    fontFamily: typography.fontFamily.bold,
    color: colors.danger,
    fontSize: typography.fontSize.base,
    letterSpacing: 1,
  },
});
