// src/screens/auth/RegisterScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../context/ThemeContext';
import { FONT, SPACING, RADIUS } from '../../constants/theme';

interface Props {
  onNavigateToLogin: () => void;
}

export default function RegisterScreen({ onNavigateToLogin }: Props) {
  const { colors, isDark } = useTheme();
  const { register, isAuthLoading } = useAppStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    age: '', gender: 'male', height: '', weight: '', targetWeight: '',
    calorieGoal: '', waterGoal: '', activityLevel: 'moderate',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = (key: string, val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleRegister = async () => {
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        age: parseInt(form.age) || 25,
        gender: form.gender,
        height: parseFloat(form.height) || 170,
        weight: parseFloat(form.weight) || 70,
        targetWeight: parseFloat(form.targetWeight) || 65,
        calorieGoal: parseInt(form.calorieGoal) || 2000,
        waterGoal: parseFloat(form.waterGoal) || 2.5,
        activityLevel: form.activityLevel,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Registration failed. Please try again.';
      Alert.alert('Registration Failed', msg);
    }
  };

  const heroGradient = isDark
    ? (['#0A0A0F', '#1A0A2E'] as [string, string])
    : (['#F8FAFC', '#EEF2FF'] as [string, string]);

  const INPUT = (props: {
    label: string; icon: string; value: string; field: string;
    placeholder?: string; keyboardType?: any; secureTextEntry?: boolean;
  }) => (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{props.label}</Text>
      <View style={[styles.inputWrap, { backgroundColor: colors.inputBg, borderColor: errors[props.field] ? colors.red : colors.inputBorder }]}>
        <Text style={styles.inputIcon}>{props.icon}</Text>
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          placeholder={props.placeholder || ''}
          placeholderTextColor={colors.placeholder}
          value={props.value}
          onChangeText={(t) => setField(props.field, t)}
          keyboardType={props.keyboardType || 'default'}
          secureTextEntry={props.secureTextEntry}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {props.field === 'password' && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={{ fontSize: 16 }}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {errors[props.field] ? <Text style={[styles.errorText, { color: colors.red }]}>{errors[props.field]}</Text> : null}
    </View>
  );

  const CHIP = (props: { label: string; value: string; current: string; field: string; emoji: string }) => (
    <TouchableOpacity
      style={[styles.chip, {
        backgroundColor: form[props.field as keyof typeof form] === props.value ? `${colors.primary}20` : colors.surface,
        borderColor: form[props.field as keyof typeof form] === props.value ? colors.primary : colors.border,
      }]}
      onPress={() => setField(props.field, props.value)}
    >
      <Text style={{ fontSize: 14 }}>{props.emoji}</Text>
      <Text style={[styles.chipLabel, { color: form[props.field as keyof typeof form] === props.value ? colors.primary : colors.textSecondary }]}>
        {props.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <LinearGradient colors={heroGradient} style={styles.hero}>
            <View style={styles.stepRow}>
              <View style={[styles.stepDot, { backgroundColor: colors.primary }]} />
              <View style={[styles.stepLine, { backgroundColor: step === 2 ? colors.primary : colors.border }]} />
              <View style={[styles.stepDot, { backgroundColor: step === 2 ? colors.primary : colors.border }]} />
            </View>
            <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>
              {step === 1 ? 'Create Account 🌟' : 'Health Profile 💪'}
            </Text>
            <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
              {step === 1 ? 'Step 1 of 2 — Basic info' : 'Step 2 of 2 — Personalize your goals'}
            </Text>
          </LinearGradient>

          {/* Form */}
          <View style={[styles.formCard, { backgroundColor: colors.card }]}>

            {step === 1 ? (
              <>
                <INPUT label="Full Name" icon="👤" value={form.name} field="name" placeholder="Alex Johnson" />
                <INPUT label="Email" icon="📧" value={form.email} field="email" placeholder="alex@example.com" keyboardType="email-address" />
                <INPUT label="Password" icon="🔒" value={form.password} field="password" placeholder="Min. 6 characters" secureTextEntry={!showPassword} />
                <INPUT label="Confirm Password" icon="🔒" value={form.confirmPassword} field="confirmPassword" placeholder="Re-enter password" secureTextEntry={!showPassword} />

                <TouchableOpacity onPress={handleNext} style={styles.btn} activeOpacity={0.8}>
                  <LinearGradient colors={['#6366F1', '#818CF8']} style={styles.btnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Text style={styles.btnText}>Continue →</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Gender */}
                <View style={styles.field}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Gender</Text>
                  <View style={styles.chips}>
                    <CHIP label="Male" value="male" current={form.gender} field="gender" emoji="👨" />
                    <CHIP label="Female" value="female" current={form.gender} field="gender" emoji="👩" />
                    <CHIP label="Other" value="other" current={form.gender} field="gender" emoji="🧑" />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <INPUT label="Age" icon="🎂" value={form.age} field="age" placeholder="25" keyboardType="numeric" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <INPUT label="Height (cm)" icon="📏" value={form.height} field="height" placeholder="170" keyboardType="numeric" />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <INPUT label="Weight (kg)" icon="⚖️" value={form.weight} field="weight" placeholder="70" keyboardType="numeric" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <INPUT label="Target (kg)" icon="🎯" value={form.targetWeight} field="targetWeight" placeholder="65" keyboardType="numeric" />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <INPUT label="Cal Goal" icon="🔥" value={form.calorieGoal} field="calorieGoal" placeholder="2000" keyboardType="numeric" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <INPUT label="Water Goal (L)" icon="💧" value={form.waterGoal} field="waterGoal" placeholder="2.5" keyboardType="numeric" />
                  </View>
                </View>

                {/* Activity Level */}
                <View style={styles.field}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Activity Level</Text>
                  <View style={styles.chips}>
                    <CHIP label="Sedentary" value="sedentary" current={form.activityLevel} field="activityLevel" emoji="🛋️" />
                    <CHIP label="Light" value="light" current={form.activityLevel} field="activityLevel" emoji="🚶" />
                    <CHIP label="Moderate" value="moderate" current={form.activityLevel} field="activityLevel" emoji="🏃" />
                    <CHIP label="Active" value="active" current={form.activityLevel} field="activityLevel" emoji="⚡" />
                    <CHIP label="Very Active" value="very_active" current={form.activityLevel} field="activityLevel" emoji="🏋️" />
                  </View>
                </View>

                <View style={styles.btnRow}>
                  <TouchableOpacity onPress={() => setStep(1)} style={[styles.backBtn, { borderColor: colors.border }]}>
                    <Text style={[styles.backBtnText, { color: colors.textSecondary }]}>← Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleRegister} disabled={isAuthLoading} style={{ flex: 1 }} activeOpacity={0.8}>
                    <LinearGradient colors={['#6366F1', '#EC4899']} style={styles.btnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                      {isAuthLoading
                        ? <ActivityIndicator color="white" />
                        : <Text style={styles.btnText}>Create Account 🚀</Text>}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Login link */}
            <TouchableOpacity onPress={onNavigateToLogin} style={styles.loginLink}>
              <Text style={[styles.loginLinkText, { color: colors.textMuted }]}>
                Already have an account? <Text style={{ color: colors.primary, fontWeight: '800' }}>Sign In</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 40 },
  hero: { padding: SPACING.xl, paddingTop: SPACING.xxl, gap: SPACING.sm, paddingBottom: SPACING.xxl },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 0, marginBottom: SPACING.sm },
  stepDot: { width: 12, height: 12, borderRadius: 6 },
  stepLine: { flex: 1, height: 2, marginHorizontal: SPACING.sm },
  heroTitle: { fontSize: FONT.xxl, fontWeight: '900' },
  heroSub: { fontSize: FONT.sm },
  formCard: { margin: SPACING.lg, borderRadius: RADIUS.xxl, padding: SPACING.xxl, gap: SPACING.md, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 10 },
  field: { gap: SPACING.xs },
  label: { fontSize: FONT.sm, fontWeight: '700' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.md, borderWidth: 1.5, paddingHorizontal: SPACING.md, height: 52 },
  inputIcon: { fontSize: 16, marginRight: SPACING.sm },
  input: { flex: 1, fontSize: FONT.md, fontWeight: '500' },
  errorText: { fontSize: FONT.xs, fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, borderWidth: 1.5 },
  chipLabel: { fontSize: FONT.xs, fontWeight: '700' },
  row: { flexDirection: 'row', gap: SPACING.md },
  btn: { borderRadius: RADIUS.md, overflow: 'hidden', marginTop: SPACING.sm },
  btnRow: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm },
  btnGrad: { height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.md },
  btnText: { fontSize: FONT.md, fontWeight: '900', color: 'white' },
  backBtn: { borderRadius: RADIUS.md, borderWidth: 1.5, height: 52, paddingHorizontal: SPACING.xl, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: FONT.sm, fontWeight: '700' },
  loginLink: { alignItems: 'center', marginTop: SPACING.sm },
  loginLinkText: { fontSize: FONT.sm },
});
