import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const TeamScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Team Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
