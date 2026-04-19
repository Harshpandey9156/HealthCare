// src/screens/WaterScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions, Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../store/useAppStore';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { COLORS, FONT, SPACING, RADIUS } from '../constants/theme';

const { width: W } = Dimensions.get('window');

const QUICK_AMOUNTS = [
  { label: 'Sip', amount: 0.1, emoji: '💧', desc: '100ml' },
  { label: 'Glass', amount: 0.25, emoji: '🥛', desc: '250ml' },
  { label: 'Bottle', amount: 0.5, emoji: '🍶', desc: '500ml' },
  { label: 'Large', amount: 1.0, emoji: '🪣', desc: '1L' },
];

const MESSAGES = [
  { min: 0, max: 25, msg: "Time to start hydrating! 💧", color: COLORS.red },
  { min: 25, max: 50, msg: "Good start! Keep going ⚡", color: COLORS.orange },
  { min: 50, max: 75, msg: "Halfway there! 👍", color: COLORS.orange },
  { min: 75, max: 100, msg: "Almost at goal! 💪", color: COLORS.green },
  { min: 100, max: 999, msg: "Goal reached! Amazing! 🎉", color: COLORS.primary },
];

export default function WaterScreen() {
  const { waterTotal, waterGoal, waterLogs, weeklyWater, addWater } = useAppStore();
  const [adding, setAdding] = useState(false);
  const pct = Math.min((waterTotal / waterGoal) * 100, 100);
  const drops = Math.round((waterTotal / waterGoal) * 8);
  const remaining = Math.max(waterGoal - waterTotal, 0);

  const msgConfig = MESSAGES.find(m => pct >= m.min && pct < m.max) || MESSAGES[MESSAGES.length - 1];

  const handleAdd = (amount: number) => {
    setAdding(true);
    addWater(amount);
    Vibration.vibrate(50);
    setTimeout(() => setAdding(false), 300);
  };

  // Weekly avg
  const weeklyAvg = weeklyWater.reduce((s, d) => s + d.amount, 0) / weeklyWater.length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Hydration 💧</Text>
          <Text style={styles.subtitle}>Stay hydrated throughout the day</Text>
        </View>

        {/* Main Card */}
        <Card style={styles.mainCard} elevated>
          <LinearGradient colors={['#0C1A3A', '#0A0A0F'] as [string,string]} style={StyleSheet.absoluteFill} />

          {/* Bottle SVG-like visualization */}
          <View style={styles.bottleContainer}>
            {/* Outer bottle */}
            <View style={styles.bottle}>
              {/* Fill layer */}
              <View style={[styles.bottleFill, { height: `${pct}%` }]}>
                <LinearGradient
                  colors={pct >= 75 ? [COLORS.blue, '#60A5FA'] as [string,string] : pct >= 50 ? [COLORS.blue, '#93C5FD'] as [string,string] : ['#1D4ED8', COLORS.blue] as [string,string]}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }}
                />
                {/* Ripple effect on top */}
                <View style={styles.ripple} />
              </View>
              {/* Percentage center */}
              <View style={styles.bottleCenter}>
                <Text style={styles.bottlePct}>{Math.round(pct)}%</Text>
              </View>
            </View>

            {/* Stats beside bottle */}
            <View style={styles.bottleStats}>
              <View style={styles.bottleStat}>
                <Text style={styles.bottleStatVal}>{waterTotal.toFixed(1)}</Text>
                <Text style={styles.bottleStatUnit}>L today</Text>
              </View>
              <View style={styles.bottleStatDivider} />
              <View style={styles.bottleStat}>
                <Text style={[styles.bottleStatVal, { color: COLORS.blue }]}>{waterGoal}</Text>
                <Text style={styles.bottleStatUnit}>L goal</Text>
              </View>
              <View style={styles.bottleStatDivider} />
              <View style={styles.bottleStat}>
                <Text style={[styles.bottleStatVal, { color: COLORS.orange }]}>{remaining.toFixed(1)}</Text>
                <Text style={styles.bottleStatUnit}>L left</Text>
              </View>
            </View>
          </View>

          {/* Message */}
          <Text style={[styles.message, { color: msgConfig.color }]}>{msgConfig.msg}</Text>

          {/* Drop indicators */}
          <View style={styles.dropsRow}>
            {Array.from({ length: 8 }, (_, i) => (
              <View key={i} style={[styles.drop, i < drops && { backgroundColor: COLORS.blue }]}>
                <Text style={styles.dropEmoji}>{i < drops ? '💧' : '○'}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Quick Add Buttons */}
        <View style={styles.quickSection}>
          <Text style={styles.sectionTitle}>Quick Add</Text>
          <View style={styles.quickGrid}>
            {QUICK_AMOUNTS.map(({ label, amount, emoji, desc }) => (
              <TouchableOpacity
                key={label}
                style={[styles.quickBtn, adding && { opacity: 0.7 }]}
                onPress={() => handleAdd(amount)}
                activeOpacity={0.7}
              >
                <LinearGradient colors={[`${COLORS.blue}20`, `${COLORS.blue}05`] as [string,string]} style={StyleSheet.absoluteFill} />
                <Text style={styles.quickEmoji}>{emoji}</Text>
                <Text style={[styles.quickLabel, { color: COLORS.blue }]}>+{amount}L</Text>
                <Text style={styles.quickDesc}>{label}</Text>
                <Text style={styles.quickMl}>{desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Milestones */}
        <Card style={styles.milestonesCard}>
          <Text style={styles.sectionTitle}>Milestones</Text>
          <View style={styles.milestonesRow}>
            {[
              { label: '25%', pctVal: 25, amount: waterGoal * 0.25 },
              { label: '50%', pctVal: 50, amount: waterGoal * 0.5 },
              { label: '75%', pctVal: 75, amount: waterGoal * 0.75 },
              { label: '100%', pctVal: 100, amount: waterGoal },
            ].map(m => {
              const reached = pct >= m.pctVal;
              return (
                <View key={m.label} style={styles.milestone}>
                  <View style={[styles.milestoneCircle, reached && { backgroundColor: COLORS.blue, borderColor: COLORS.blue }]}>
                    <Text style={styles.milestoneIcon}>{reached ? '✓' : m.label}</Text>
                  </View>
                  <Text style={[styles.milestoneAmt, { color: reached ? COLORS.blue : COLORS.textMuted }]}>
                    {m.amount.toFixed(1)}L
                  </Text>
                </View>
              );
            })}
          </View>
          <ProgressBar value={pct} max={100} color={COLORS.blue} height={10} style={{ marginTop: SPACING.md }} />
        </Card>

        {/* Weekly trend */}
        <Card style={styles.weeklyCard}>
          <View style={styles.weeklyHeader}>
            <Text style={styles.sectionTitle}>Weekly Overview</Text>
            <Text style={styles.weeklyAvg}>Avg: {weeklyAvg.toFixed(1)}L</Text>
          </View>
          <View style={styles.weeklyBars}>
            {weeklyWater.map(d => {
              const barPct = Math.min(d.amount / waterGoal, 1);
              const isToday = d.day === new Date().toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3);
              return (
                <View key={d.day} style={styles.weeklyBarCol}>
                  <Text style={styles.weeklyBarAmt}>{d.amount.toFixed(1)}</Text>
                  <View style={styles.weeklyBarTrack}>
                    <LinearGradient
                      colors={isToday ? [COLORS.primary, COLORS.primaryLight] as [string,string] : [COLORS.blue, '#60A5FA'] as [string,string]}
                      style={[styles.weeklyBarFill, { height: `${barPct * 100}%` }]}
                      start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }}
                    />
                  </View>
                  <Text style={[styles.weeklyBarDay, isToday && { color: COLORS.primary, fontWeight: '800' }]}>{d.day}</Text>
                </View>
              );
            })}
          </View>
          {/* Goal line label */}
          <Text style={styles.goalLineLabel}>Goal: {waterGoal}L</Text>
        </Card>

        {/* Today's Log */}
        <Card style={styles.logCard}>
          <Text style={styles.sectionTitle}>Today's Log</Text>
          {waterLogs.length > 0 ? waterLogs.map(log => (
            <View key={log.id} style={styles.logRow}>
              <Text style={styles.logEmoji}>💧</Text>
              <Text style={[styles.logAmount, { color: COLORS.blue }]}>+{log.amount}L</Text>
              <Text style={styles.logTime}>{log.time}</Text>
            </View>
          )) : (
            <Text style={styles.emptyText}>No water logged today. Stay hydrated!</Text>
          )}
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.lg, paddingBottom: 32, gap: SPACING.lg },
  header: { gap: 4 },
  title: { fontSize: FONT.xl, fontWeight: '900', color: COLORS.textPrimary },
  subtitle: { fontSize: FONT.sm, color: COLORS.textMuted },
  mainCard: { borderColor: `${COLORS.blue}30`, overflow: 'hidden', gap: SPACING.lg, padding: SPACING.xl },
  bottleContainer: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xl, justifyContent: 'center' },
  bottle: {
    width: 110, height: 180, borderRadius: 20,
    borderWidth: 2, borderColor: `${COLORS.blue}40`,
    overflow: 'hidden', justifyContent: 'flex-end',
    backgroundColor: `${COLORS.blue}10`,
    position: 'relative',
  },
  bottleFill: { width: '100%', position: 'absolute', bottom: 0, left: 0, right: 0 },
  ripple: { height: 10, backgroundColor: 'rgba(255,255,255,0.15)', position: 'absolute', top: 0, left: 0, right: 0, borderRadius: 999 },
  bottleCenter: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' },
  bottlePct: { fontSize: FONT.xxl, fontWeight: '900', color: 'white', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  bottleStats: { gap: SPACING.xl },
  bottleStat: { alignItems: 'center', gap: 2 },
  bottleStatVal: { fontSize: FONT.xxl, fontWeight: '900', color: COLORS.textPrimary },
  bottleStatUnit: { fontSize: FONT.xs, color: COLORS.textMuted, fontWeight: '600' },
  bottleStatDivider: { height: 1, width: 40, backgroundColor: COLORS.border },
  message: { textAlign: 'center', fontSize: FONT.md, fontWeight: '800' },
  dropsRow: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.sm },
  drop: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  dropEmoji: { fontSize: 14 },
  quickSection: { gap: SPACING.md },
  sectionTitle: { fontSize: FONT.md, fontWeight: '800', color: COLORS.textPrimary },
  quickGrid: { flexDirection: 'row', gap: SPACING.sm },
  quickBtn: { flex: 1, borderRadius: RADIUS.md, borderWidth: 1, borderColor: `${COLORS.blue}30`, padding: SPACING.md, alignItems: 'center', gap: 4, overflow: 'hidden' },
  quickEmoji: { fontSize: 24 },
  quickLabel: { fontSize: FONT.sm, fontWeight: '900' },
  quickDesc: { fontSize: FONT.xs, color: COLORS.textSecondary, fontWeight: '700' },
  quickMl: { fontSize: FONT.xs, color: COLORS.textMuted },
  milestonesCard: { gap: SPACING.md },
  milestonesRow: { flexDirection: 'row', justifyContent: 'space-around' },
  milestone: { alignItems: 'center', gap: SPACING.sm },
  milestoneCircle: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  milestoneIcon: { fontSize: FONT.sm, fontWeight: '800', color: COLORS.textMuted },
  milestoneAmt: { fontSize: FONT.xs, fontWeight: '700' },
  weeklyCard: { gap: SPACING.md },
  weeklyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weeklyAvg: { fontSize: FONT.sm, color: COLORS.blue, fontWeight: '700' },
  weeklyBars: { flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: SPACING.sm },
  weeklyBarCol: { flex: 1, alignItems: 'center', gap: SPACING.xs, height: '100%', justifyContent: 'flex-end' },
  weeklyBarAmt: { fontSize: FONT.xs, color: COLORS.textMuted, fontWeight: '600' },
  weeklyBarTrack: { flex: 1, width: '100%', backgroundColor: COLORS.surface, borderRadius: RADIUS.sm, overflow: 'hidden', justifyContent: 'flex-end' },
  weeklyBarFill: { width: '100%', borderRadius: RADIUS.sm },
  weeklyBarDay: { fontSize: FONT.xs, color: COLORS.textMuted, fontWeight: '700' },
  goalLineLabel: { fontSize: FONT.xs, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.xs },
  logCard: { gap: SPACING.sm },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.borderSubtle },
  logEmoji: { fontSize: 18 },
  logAmount: { fontSize: FONT.md, fontWeight: '800', flex: 1 },
  logTime: { fontSize: FONT.sm, color: COLORS.textMuted },
  emptyText: { fontSize: FONT.sm, color: COLORS.textMuted, textAlign: 'center', paddingVertical: SPACING.xl },
});
