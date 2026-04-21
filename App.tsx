// App.tsx
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import DashboardScreen from './src/screens/DashboardScreen';
import FoodScreen from './src/screens/FoodScreen';
import WorkoutScreen from './src/screens/WorkoutScreen';
import WaterScreen from './src/screens/WaterScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { useAppStore } from './src/store/useAppStore';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ─── Tab Icon ─────────────────────────────────────────────────────────────────
function TabIcon({ emoji, label, focused, colors }: {
  emoji: string; label: string; focused: boolean; colors: any;
}) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabEmoji, { opacity: focused ? 1 : 0.45 }]}>{emoji}</Text>
      <Text style={[styles.tabLabel, { color: focused ? colors.primary : colors.textMuted }]}>{label}</Text>
    </View>
  );
}

// ─── Main Tab Navigator ───────────────────────────────────────────────────────
function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 72,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} colors={colors} /> }} />
      <Tab.Screen name="Food" component={FoodScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🍽️" label="Food" focused={focused} colors={colors} /> }} />
      <Tab.Screen name="Workout" component={WorkoutScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏋️" label="Workout" focused={focused} colors={colors} /> }} />
      <Tab.Screen name="Water" component={WaterScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="💧" label="Water" focused={focused} colors={colors} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} colors={colors} /> }} />
    </Tab.Navigator>
  );
}

// ─── Auth Stack ───────────────────────────────────────────────────────────────
function AuthStack() {
  const [screen, setScreen] = useState<'login' | 'register'>('login');

  if (screen === 'login') {
    return <LoginScreen onNavigateToRegister={() => setScreen('register')} />;
  }
  return <RegisterScreen onNavigateToLogin={() => setScreen('login')} />;
}

// ─── Root Navigator (auth guard) ──────────────────────────────────────────────
function RootNavigator() {
  const { colors, isDark } = useTheme();
  const { isAuthenticated, isAuthLoading, loadUser } = useAppStore();

  useEffect(() => {
    loadUser();
  }, []);

  if (isAuthLoading) {
    return (
      <View style={[styles.loader, { backgroundColor: colors.bg }]}>
        <Text style={{ fontSize: 48 }}>💚</Text>
        <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 16 }} />
        <Text style={{ color: colors.textMuted, marginTop: 12, fontSize: 14, fontWeight: '600' }}>
          Loading VitalTrack...
        </Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
      />
      <NavigationContainer>
        {isAuthenticated ? <MainTabs /> : <AuthStack />}
      </NavigationContainer>
    </>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabItem: { alignItems: 'center', gap: 2 },
  tabEmoji: { fontSize: 22 },
  tabLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
