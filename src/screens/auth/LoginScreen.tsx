// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../context/ThemeContext';
import { FONT, SPACING, RADIUS } from '../../constants/theme';

interface Props {
  onNavigateToRegister: () => void;
}

export default function LoginScreen({ onNavigateToRegister }: Props) {
  const { colors, isDark } = useTheme();
  const { login, isAuthLoading } = useAppStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      await login({ email: email.trim().toLowerCase(), password });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Login failed. Check your credentials.';
      Alert.alert('Login Failed', msg);
    }
  };

  const heroGradient = isDark
    ? (['#0F0F1F', '#1A0A2E', '#0A0A0F'] as [string, string, string])
    : (['#EEF2FF', '#F5F3FF', '#F8FAFC'] as [string, string, string]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Hero Section */}
          <LinearGradient colors={heroGradient} style={styles.hero}>
            <View style={styles.logoContainer}>
              <LinearGradient colors={['#6366F1', '#EC4899']} style={styles.logoGrad}>
                <Text style={styles.logoEmoji}>💚</Text>
              </LinearGradient>
            </View>
            <Text style={[styles.appName, { color: colors.textPrimary }]}>VitalTrack</Text>
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>Your personal health companion</Text>

            {/* Stat pills */}
            <View style={styles.statPills}>
              {[
                { emoji: '🍎', label: 'Food Tracking' },
                { emoji: '💧', label: 'Hydration' },
                { emoji: '🏋️', label: 'Workouts' },
              ].map((s) => (
                <View key={s.label} style={[styles.pill, { backgroundColor: `${colors.primary}20`, borderColor: `${colors.primary}30` }]}>
                  <Text style={styles.pillEmoji}>{s.emoji}</Text>
                  <Text style={[styles.pillLabel, { color: colors.textSecondary }]}>{s.label}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>

          {/* Form Card */}
          <View style={[styles.formCard, { backgroundColor: colors.card, shadowColor: isDark ? '#000' : '#94A3B8' }]}>
            <Text style={[styles.formTitle, { color: colors.textPrimary }]}>Welcome back 👋</Text>
            <Text style={[styles.formSub, { color: colors.textSecondary }]}>Sign in to continue your health journey</Text>

            {/* Email */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.inputBg, borderColor: errors.email ? colors.red : colors.inputBorder }]}>
                <Text style={styles.inputIcon}>📧</Text>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="alex@example.com"
                  placeholderTextColor={colors.placeholder}
                  value={email}
                  onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: undefined })); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email && <Text style={[styles.errorText, { color: colors.red }]}>{errors.email}</Text>}
            </View>

            {/* Password */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.inputBg, borderColor: errors.password ? colors.red : colors.inputBorder }]}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Min. 6 characters"
                  placeholderTextColor={colors.placeholder}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: undefined })); }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Text style={{ fontSize: 16 }}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={[styles.errorText, { color: colors.red }]}>{errors.password}</Text>}
            </View>

            {/* Login Button */}
            <TouchableOpacity onPress={handleLogin} disabled={isAuthLoading} style={styles.loginBtn} activeOpacity={0.8}>
              <LinearGradient colors={['#6366F1', '#818CF8']} style={styles.loginBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {isAuthLoading
                  ? <ActivityIndicator color="white" />
                  : <Text style={styles.loginBtnText}>Sign In →</Text>}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.divLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.divText, { color: colors.textMuted }]}>Don't have an account?</Text>
              <View style={[styles.divLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Register Link */}
            <TouchableOpacity onPress={onNavigateToRegister} style={[styles.registerBtn, { borderColor: colors.border }]}>
              <Text style={[styles.registerBtnText, { color: colors.primary }]}>Create Account ✨</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.footer, { color: colors.textMuted }]}>
            By signing in, you agree to our Terms of Service
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 32 },
  hero: { padding: SPACING.xl, paddingTop: SPACING.xxxl, alignItems: 'center', gap: SPACING.md, paddingBottom: SPACING.xxl },
  logoContainer: { marginBottom: SPACING.sm },
  logoGrad: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  logoEmoji: { fontSize: 40 },
  appName: { fontSize: FONT.display, fontWeight: '900', letterSpacing: -1 },
  tagline: { fontSize: FONT.md, fontWeight: '500' },
  statPills: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap', justifyContent: 'center', marginTop: SPACING.sm },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, borderWidth: 1 },
  pillEmoji: { fontSize: 14 },
  pillLabel: { fontSize: FONT.xs, fontWeight: '700' },
  formCard: { margin: SPACING.lg, borderRadius: RADIUS.xxl, padding: SPACING.xxl, gap: SPACING.lg, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 12 },
  formTitle: { fontSize: FONT.xxl, fontWeight: '900' },
  formSub: { fontSize: FONT.sm, marginTop: -SPACING.sm },
  field: { gap: SPACING.xs },
  label: { fontSize: FONT.sm, fontWeight: '700' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.md, borderWidth: 1.5, paddingHorizontal: SPACING.md, height: 52 },
  inputIcon: { fontSize: 16, marginRight: SPACING.sm },
  input: { flex: 1, fontSize: FONT.md, fontWeight: '500' },
  eyeBtn: { padding: SPACING.sm },
  errorText: { fontSize: FONT.xs, fontWeight: '600', marginTop: 2 },
  loginBtn: { borderRadius: RADIUS.md, overflow: 'hidden', marginTop: SPACING.sm },
  loginBtnGrad: { height: 52, alignItems: 'center', justifyContent: 'center' },
  loginBtnText: { fontSize: FONT.md, fontWeight: '900', color: 'white', letterSpacing: 0.3 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  divLine: { flex: 1, height: 1 },
  divText: { fontSize: FONT.xs, fontWeight: '600' },
  registerBtn: { borderRadius: RADIUS.md, borderWidth: 1.5, height: 52, alignItems: 'center', justifyContent: 'center' },
  registerBtnText: { fontSize: FONT.md, fontWeight: '800' },
  footer: { textAlign: 'center', fontSize: FONT.xs, marginTop: SPACING.md, paddingHorizontal: SPACING.xl },
});
