import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, borderRadius } from '../../theme';

interface NumericKeypadProps {
  onKeyPress: (key: string) => void;
  onDeletePress: () => void;
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({
  onKeyPress,
  onDeletePress,
}) => {
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', '⌫'],
  ];

  return (
    <View style={styles.container}>
      {keys.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((key) => {
            const isDelete = key === '⌫';
            return (
              <TouchableOpacity
                key={`key-${key}`}
                activeOpacity={0.6}
                style={styles.keyButton}
                onPress={() => {
                  if (isDelete) {
                    onDeletePress();
                  } else {
                    onKeyPress(key);
                  }
                }}
              >
                <Text style={[styles.keyText, isDelete && styles.deleteText]}>
                  {key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  keyButton: {
    width: 72,
    height: 64,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  keyText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xl,
    color: colors.textPrimary,
  },
  deleteText: {
    color: colors.danger,
    fontSize: typography.fontSize.lg,
  },
});
