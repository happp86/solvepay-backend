import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, typography } from '../../theme';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
  dark?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBackPress,
  rightAction,
  style,
  dark = false,
}) => {
  const textColor = dark ? colors.textLight : colors.textPrimary;
  const subtextColor = dark ? colors.textMuted : colors.textSecondary;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftContainer}>
        {onBackPress && (
          <TouchableOpacity
            onPress={onBackPress}
            style={[styles.backButton, dark && styles.backButtonDark]}
            activeOpacity={0.7}
          >
            <Text style={[styles.backIcon, { color: textColor }]}>←</Text>
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          {title && <Text style={[styles.title, { color: textColor }]}>{title}</Text>}
          {subtitle && <Text style={[styles.subtitle, { color: subtextColor }]}>{subtitle}</Text>}
        </View>
      </View>
      {rightAction && <View style={styles.rightContainer}>{rightAction}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'transparent',
  },
  backIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
