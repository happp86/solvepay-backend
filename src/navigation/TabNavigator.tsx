import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation';
import { colors, typography } from '../theme';

import { HomeScreen } from '../screens/main/HomeScreen';
import { StatisticsScreen } from '../screens/main/StatisticsScreen';
import { WalletScreen } from '../screens/main/WalletScreen';
import { TeamScreen } from '../screens/main/TeamScreen';
import { ToolsScreen } from '../screens/main/ToolsScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Custom tab bar to match ComePay layout
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const tabs = [
    { name: 'Home', label: 'Home', icon: '🏠' },
    { name: 'Wallet', label: 'Payment', icon: '💳' },
    { name: 'Tools', label: '', icon: '💰', isCenter: true },
    { name: 'Statistics', label: 'Statistics', icon: '📊' },
    { name: 'Profile', label: 'My', icon: '👤' },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab, index) => {
        const route = state.routes.find((r) => r.name === tab.name);
        if (!route) return null;
        const routeIndex = state.routes.indexOf(route);
        const isFocused = state.index === routeIndex;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(tab.name as keyof MainTabParamList);
          }
        };

        if (tab.isCenter) {
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.centerTabWrapper}
              onPress={onPress}
              activeOpacity={0.85}
            >
              <View style={[styles.centerTabBtn, isFocused && styles.centerTabBtnFocused]}>
                <Text style={styles.centerTabIcon}>{tab.icon}</Text>
              </View>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabItem}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabIcon, isFocused && styles.tabIconActive]}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            {isFocused && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Tools" component={ToolsScreen} />
      <Tab.Screen name="Team" component={TeamScreen} />
      <Tab.Screen name="Statistics" component={StatisticsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EBEBEB',
    height: 68,
    alignItems: 'center',
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 8,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
    height: '100%',
    position: 'relative',
  },
  tabIcon: {
    fontSize: 22,
    opacity: 0.45,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
    color: '#AAAAAA',
    marginTop: 3,
  },
  tabLabelActive: {
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  // Center wallet tab
  centerTabWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  centerTabBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#F5A623',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F5A623',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#fff',
  },
  centerTabBtnFocused: {
    backgroundColor: '#E09400',
  },
  centerTabIcon: {
    fontSize: 26,
  },
});
