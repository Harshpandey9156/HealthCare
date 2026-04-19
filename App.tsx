// App.tsx
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import DashboardScreen from './src/screens/DashboardScreen';
import FoodScreen from './src/screens/FoodScreen';
import WorkoutScreen from './src/screens/WorkoutScreen';
import WaterScreen from './src/screens/WaterScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { COLORS } from './src/constants/theme';

const Tab = createBottomTabNavigator();

const TabIcon = ({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) => (
  <View style={styles.tabItem}>
    <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>{emoji}</Text>
    <Text style={[styles.tabLabel, { color: focused ? COLORS.primary : COLORS.textMuted }]}>{label}</Text>
  </View>
);

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarShowLabel: false,
          }}
        >
          <Tab.Screen name="Dashboard" component={DashboardScreen}
            options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} /> }} />
          <Tab.Screen name="Food" component={FoodScreen}
            options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🍽️" label="Food" focused={focused} /> }} />
          <Tab.Screen name="Workout" component={WorkoutScreen}
            options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏋️" label="Workout" focused={focused} /> }} />
          <Tab.Screen name="Water" component={WaterScreen}
            options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="💧" label="Water" focused={focused} /> }} />
          <Tab.Screen name="Profile" component={ProfileScreen}
            options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} /> }} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 72,
    paddingTop: 8,
    paddingBottom: 8,
  },
  tabItem: { alignItems: 'center', gap: 2 },
  tabEmoji: { fontSize: 22, opacity: 0.5 },
  tabEmojiActive: { opacity: 1 },
  tabLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
});
