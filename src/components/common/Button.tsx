import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { colors, borderRadius, typography, shadows } from '../../theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  disabled,
  ...props
}) => {
  const getContainerStyle = (): ViewStyle => {
    let base: ViewStyle = { ...styles.baseContainer };

    // Size variations
    if (size === 'small') {
      base.paddingVertical = 10;
      base.paddingHorizontal = 16;
      base.borderRadius = borderRadius.md;
    } else if (size === 'large') {
      base.paddingVertical = 18;
      base.paddingHorizontal = 24;
      base.borderRadius = borderRadius.lg;
    } else {
      base.paddingVertical = 14;
      base.paddingHorizontal = 20;
      base.borderRadius = borderRadius.lg;
    }

    // Variant variations
    switch (variant) {
      case 'primary':
        base.backgroundColor = colors.primary;
        if (!disabled) Object.assign(base, shadows.primaryGlow);
        break;
      case 'secondary':
        base.backgroundColor = colors.primaryLight;
        break;
      case 'outline':
        base.backgroundColor = 'transparent';
        base.borderWidth = 1.5;
        base.borderColor = colors.primary;
        break;
      case 'ghost':
        base.backgroundColor = 'transparent';
        break;
      case 'danger':
        base.backgroundColor = colors.danger;
        break;
    }

    if (disabled) {
      base.backgroundColor = colors.border;
      base.borderColor = colors.border;
      base.shadowOpacity = 0;
      base.elevation = 0;
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    let base: TextStyle = { ...styles.baseText };

    if (size === 'small') {
      base.fontSize = typography.fontSize.sm;
    } else if (size === 'large') {
      base.fontSize = typography.fontSize.md;
      base.fontFamily = typography.fontFamily.bold;
    }

    switch (variant) {
      case 'primary':
      case 'danger':
        base.color = colors.textLight;
        break;
      case 'secondary':
        base.color = colors.primaryDark;
        break;
      case 'outline':
      case 'ghost':
        base.color = colors.primary;
        break;
    }

    if (disabled) {
      base.color = colors.textMuted;
    }

    return base;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? colors.textLight : colors.primary}
          size="small"
        />
      ) : (
        <>
          {leftIcon && leftIcon}
          <Text style={[getTextStyle(), textStyle, leftIcon ? { marginLeft: 8 } : null, rightIcon ? { marginRight: 8 } : null]}>
            {title}
          </Text>
          {rightIcon && rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
    textAlign: 'center',
  },
});
