// src/screens/WorkoutScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { BarChart } from 'react-native-chart-kit';
import { useAppStore } from '../store/useAppStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { COLORS, FONT, SPACING, RADIUS, WORKOUT_CONFIG } from '../constants/theme';

const { width: W } = Dimensions.get('window');
const WORKOUT_TYPES = ['strength', 'cardio', 'yoga', 'hiit', 'cycling', 'swimming', 'walking'];
const INTENSITIES = ['low', 'medium', 'high'];

const chartConfig = {
  backgroundGradientFrom: COLORS.card,
  backgroundGradientTo:   COLORS.card,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(99,102,241,${opacity})`,
  labelColor: () => COLORS.textMuted,
};

export default function WorkoutScreen() {
  const { workoutLogs, weeklyPlan, weeklyMinutes, addWorkoutLog, removeWorkoutLog } = useAppStore();
  const [activeTab, setActiveTab] = useState<'log' | 'plan'>('log');
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState('strength');
  const [selectedIntensity, setSelectedIntensity] = useState('medium');
  const [form, setForm] = useState({ name: '', duration: '', caloriesBurned: '' });

  const totalMin = workoutLogs.reduce((s, w) => s + w.duration, 0);
  const totalCal = workoutLogs.reduce((s, w) => s + w.caloriesBurned, 0);
  const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const autoCalc = () => {
    const dur = parseFloat(form.duration) || 30;
    const met: Record<string, number> = { running: 9.8, cycling: 7.5, swimming: 8, strength: 5, yoga: 3, hiit: 10, walking: 3.8, cardio: 7 };
    const cal = Math.round(((met[selectedType] || 5) * 70 * dur) / 60);
    setForm((p) => ({ ...p, caloriesBurned: String(cal) }));
  };

  const handleAdd = () => {
    if (!form.name || !form.duration) { Alert.alert('Missing info', 'Name and duration required'); return; }
    const cfg = WORKOUT_CONFIG[selectedType];
    addWorkoutLog({
      date:           new Date().toISOString().split('T')[0],
      name:           form.name,
      workoutType:    selectedType,
      duration:       parseFloat(form.duration) || 0,
      caloriesBurned: parseFloat(form.caloriesBurned) || 0,
      intensity:      selectedIntensity,
      emoji:          cfg.emoji,
    });
    setForm({ name: '', duration: '', caloriesBurned: '' });
    setShowModal(false);
  };

  const barData = {
    labels:   (weeklyMinutes || []).map((d) => d.day),
    datasets: [{ data: (weeklyMinutes || []).map((d) => d.minutes) }],
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Workouts 🏋️</Text>
            <Text style={styles.subtitle}>Track your training sessions</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.addBtnGrad}>
              <Text style={styles.addBtnText}>+ Log</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: 'Total Min', value: totalMin,               unit: 'min',  color: COLORS.primary, emoji: '⏱️' },
            { label: 'Calories',  value: Math.round(totalCal),   unit: 'kcal', color: COLORS.red,     emoji: '🔥' },
            { label: 'Sessions',  value: workoutLogs.length,     unit: '',     color: COLORS.green,   emoji: '⚡' },
          ].map((s) => (
            <View key={s.label} style={[styles.statBox, { borderColor: `${s.color}30` }]}>
              <LinearGradient colors={[`${s.color}15`, `${s.color}05`]} style={StyleSheet.absoluteFill} />
              <Text style={styles.statEmoji}>{s.emoji}</Text>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statUnit}>{s.unit}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, activeTab === 'log'  && styles.tabActive]} onPress={() => setActiveTab('log')}>
            <Text style={[styles.tabText, activeTab === 'log'  && styles.tabTextActive]}>📋 Activity Log</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'plan' && styles.tabActive]} onPress={() => setActiveTab('plan')}>
            <Text style={[styles.tabText, activeTab === 'plan' && styles.tabTextActive]}>📅 Weekly Plan</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'log' ? (
          <>
            <Card style={styles.chartCard}>
              <Text style={styles.sectionTitle}>Weekly Activity</Text>
              {weeklyMinutes && weeklyMinutes.length > 0 && (
                <BarChart
                  data={barData}
                  width={W - SPACING.lg * 2 - 32}
                  height={160}
                  chartConfig={chartConfig}
                  style={styles.chart}
                  showValuesOnTopOfBars
                  fromZero
                  yAxisLabel=""
                  yAxisSuffix="m"
                />
              )}
            </Card>
            <Card style={styles.logsCard}>
              <Text style={styles.sectionTitle}>Recent Workouts</Text>
              {workoutLogs.length > 0 ? workoutLogs.map((log) => {
                const cfg = WORKOUT_CONFIG[log.workoutType] || WORKOUT_CONFIG.strength;
                const intensityColors: Record<string, string> = { low: COLORS.green, medium: COLORS.orange, high: COLORS.red };
                return (
                  <View key={log.id} style={styles.logRow}>
                    <View style={[styles.logEmoji, { backgroundColor: `${cfg.color}20` }]}>
                      <Text style={styles.logEmojiText}>{log.emoji}</Text>
                    </View>
                    <View style={styles.logInfo}>
                      <Text style={styles.logName}>{log.name}</Text>
                      <Text style={styles.logSub}>{log.date} · {cfg.label}</Text>
                    </View>
                    <View style={styles.logRight}>
                      <View style={styles.logStats}>
                        <Text style={styles.logDuration}>⏱ {log.duration}m</Text>
                        <Text style={[styles.logCal, { color: COLORS.green }]}>🔥 {log.caloriesBurned}</Text>
                      </View>
                      <Badge label={log.intensity.toUpperCase()} color={intensityColors[log.intensity] || COLORS.green} size="sm" />
                    </View>
                    <TouchableOpacity onPress={() => removeWorkoutLog(log.id)} style={styles.deleteBtn}>
                      <Text style={styles.deleteBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                );
              }) : (
                <Text style={styles.emptyText}>No workouts logged yet. Let's get moving! 💪</Text>
              )}
            </Card>
          </>
        ) : (
          <Card style={styles.planCard}>
            <Text style={styles.sectionTitle}>Weekly Training Plan</Text>
            {(weeklyPlan || []).map((day) => {
              const isToday = todayDay === day.day;
              const cfg = WORKOUT_CONFIG[day.type] || WORKOUT_CONFIG.rest;
              return (
                <View key={day.day} style={[styles.planRow, isToday && { borderColor: COLORS.primary, borderWidth: 1 }]}>
                  <LinearGradient
                    colors={isToday ? [COLORS.primarySubtle, 'transparent'] : ['transparent', 'transparent']}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={[styles.planDay, isToday && { color: COLORS.primary }]}>
                    {day.day.slice(0, 3)}{isToday ? ' (Today)' : ''}
                  </Text>
                  <Text style={styles.planEmoji}>{day.emoji}</Text>
                  <View style={styles.planInfo}>
                    <Text style={styles.planWorkout}>{day.workout}</Text>
                    {day.duration > 0 && <Text style={styles.planDuration}>{day.duration} min · {cfg.label}</Text>}
                  </View>
                  {day.planned ? (
                    <Badge label="Planned" color={COLORS.green} size="sm" />
                  ) : (
                    <Badge label="Rest" color={COLORS.textMuted} size="sm" />
                  )}
                </View>
              );
            })}
          </Card>
        )}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Log Workout</Text>
            <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalScroll}>
            <Text style={styles.formLabel}>Workout Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
              {WORKOUT_TYPES.map((type) => {
                const cfg = WORKOUT_CONFIG[type];
                const active = selectedType === type;
                return (
                  <TouchableOpacity key={type} onPress={() => setSelectedType(type)}
                    style={[styles.typeChip, active && { backgroundColor: `${cfg.color}20`, borderColor: cfg.color }]}>
                    <Text style={styles.typeEmoji}>{cfg.emoji}</Text>
                    <Text style={[styles.typeLabel, active && { color: cfg.color }]}>{cfg.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.formLabel}>Workout Name *</Text>
            <TextInput style={styles.formInput} placeholder="e.g. Morning Run" placeholderTextColor={COLORS.textMuted} value={form.name} onChangeText={(v) => setForm((p) => ({ ...p, name: v }))} />

            <Text style={styles.formLabel}>Duration (minutes) *</Text>
            <TextInput style={styles.formInput} placeholder="30" keyboardType="numeric" placeholderTextColor={COLORS.textMuted} value={form.duration} onChangeText={(v) => setForm((p) => ({ ...p, duration: v }))} onBlur={autoCalc} />

            <View style={styles.calRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.formLabel}>Calories Burned</Text>
                <TextInput style={styles.formInput} placeholder="0" keyboardType="numeric" placeholderTextColor={COLORS.textMuted} value={form.caloriesBurned} onChangeText={(v) => setForm((p) => ({ ...p, caloriesBurned: v }))} />
              </View>
              <TouchableOpacity onPress={autoCalc} style={styles.autoBtn}>
                <Text style={styles.autoBtnText}>⚡ Auto</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.formLabel}>Intensity</Text>
            <View style={styles.intensityRow}>
              {INTENSITIES.map((i) => {
                const c = { low: COLORS.green, medium: COLORS.orange, high: COLORS.red }[i];
                return (
                  <TouchableOpacity key={i} onPress={() => setSelectedIntensity(i)}
                    style={[styles.intensityBtn, selectedIntensity === i && { backgroundColor: `${c}20`, borderColor: c! }]}>
                    <Text style={[styles.intensityText, selectedIntensity === i && { color: c }]}>
                      {i.charAt(0).toUpperCase() + i.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.saveBtnGrad}>
                <Text style={styles.saveBtnText}>Log Workout 💪</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.lg, paddingBottom: 32, gap: SPACING.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: FONT.xl, fontWeight: '900', color: COLORS.textPrimary },
  subtitle: { fontSize: FONT.sm, color: COLORS.textMuted, marginTop: 2 },
  addBtn: { borderRadius: RADIUS.md, overflow: 'hidden' },
  addBtnGrad: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  addBtnText: { fontSize: FONT.sm, fontWeight: '800', color: 'white' },
  statsRow: { flexDirection: 'row', gap: SPACING.sm },
  statBox: { flex: 1, borderRadius: RADIUS.md, borderWidth: 1, overflow: 'hidden', padding: SPACING.md, alignItems: 'center', gap: 2 },
  statEmoji: { fontSize: 20 },
  statValue: { fontSize: FONT.xl, fontWeight: '900' },
  statUnit: { fontSize: FONT.xs, color: COLORS.textMuted },
  statLabel: { fontSize: FONT.xs, color: COLORS.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  tabs: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 4, gap: 4 },
  tab: { flex: 1, paddingVertical: SPACING.sm, borderRadius: RADIUS.sm, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: FONT.sm, fontWeight: '700', color: COLORS.textMuted },
  tabTextActive: { color: 'white' },
  chartCard: { gap: SPACING.sm },
  sectionTitle: { fontSize: FONT.md, fontWeight: '800', color: COLORS.textPrimary },
  chart: { borderRadius: RADIUS.md, marginLeft: -SPACING.sm },
  logsCard: { gap: SPACING.sm },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.borderSubtle },
  logEmoji: { width: 44, height: 44, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  logEmojiText: { fontSize: 22 },
  logInfo: { flex: 1 },
  logName: { fontSize: FONT.sm, fontWeight: '700', color: COLORS.textPrimary },
  logSub: { fontSize: FONT.xs, color: COLORS.textMuted, marginTop: 2 },
  logRight: { gap: SPACING.xs, alignItems: 'flex-end' },
  logStats: { flexDirection: 'row', gap: SPACING.sm },
  logDuration: { fontSize: FONT.xs, color: COLORS.textSecondary, fontWeight: '600' },
  logCal: { fontSize: FONT.xs, fontWeight: '700' },
  deleteBtn: { padding: SPACING.xs },
  deleteBtnText: { fontSize: FONT.sm, color: COLORS.textMuted },
  emptyText: { fontSize: FONT.sm, color: COLORS.textMuted, textAlign: 'center', paddingVertical: SPACING.xl },
  planCard: { gap: SPACING.sm },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.md, borderRadius: RADIUS.md, paddingHorizontal: SPACING.sm, overflow: 'hidden', borderColor: 'transparent', borderWidth: 1 },
  planDay: { fontSize: FONT.sm, fontWeight: '700', color: COLORS.textSecondary, width: 80 },
  planEmoji: { fontSize: 22 },
  planInfo: { flex: 1 },
  planWorkout: { fontSize: FONT.sm, fontWeight: '700', color: COLORS.textPrimary },
  planDuration: { fontSize: FONT.xs, color: COLORS.textMuted, marginTop: 2 },
  modal: { flex: 1, backgroundColor: COLORS.bg, paddingTop: SPACING.xxl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  modalTitle: { fontSize: FONT.xl, fontWeight: '900', color: COLORS.textPrimary },
  modalClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  modalCloseText: { color: COLORS.textSecondary, fontSize: FONT.sm },
  modalScroll: { padding: SPACING.lg, gap: SPACING.md },
  formLabel: { fontSize: FONT.xs, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: SPACING.xs },
  formInput: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, color: COLORS.textPrimary, fontSize: FONT.md, borderWidth: 1, borderColor: COLORS.border },
  typeScroll: { marginBottom: SPACING.md, flexGrow: 0 },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.border, marginRight: SPACING.sm },
  typeEmoji: { fontSize: 16 },
  typeLabel: { fontSize: FONT.sm, fontWeight: '700', color: COLORS.textSecondary },
  calRow: { flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.sm },
  autoBtn: { borderRadius: RADIUS.md, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.primary, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, marginBottom: 1 },
  autoBtnText: { fontSize: FONT.sm, fontWeight: '700', color: COLORS.primary },
  intensityRow: { flexDirection: 'row', gap: SPACING.sm },
  intensityBtn: { flex: 1, paddingVertical: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  intensityText: { fontSize: FONT.sm, fontWeight: '700', color: COLORS.textSecondary },
  saveBtn: { borderRadius: RADIUS.md, overflow: 'hidden', marginTop: SPACING.md },
  saveBtnGrad: { paddingVertical: SPACING.lg, alignItems: 'center' },
  saveBtnText: { fontSize: FONT.lg, fontWeight: '800', color: 'white' },
});
