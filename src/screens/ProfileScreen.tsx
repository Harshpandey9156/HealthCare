// src/screens/ProfileScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Clipboard, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../store/useAppStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { COLORS, FONT, SPACING, RADIUS } from '../constants/theme';

const LEVELS = [
  { name: 'Beginner', minPts: 0, emoji: '🌱', color: COLORS.textMuted },
  { name: 'Active', minPts: 100, emoji: '⚡', color: COLORS.green },
  { name: 'Fit', minPts: 300, emoji: '💪', color: COLORS.blue },
  { name: 'Athlete', minPts: 700, emoji: '🏅', color: COLORS.purple },
  { name: 'Champion', minPts: 1500, emoji: '🏆', color: COLORS.yellow },
  { name: 'Legend', minPts: 3000, emoji: '🔥', color: COLORS.red },
];

function getLevel(pts: number) {
  return [...LEVELS].reverse().find(l => pts >= l.minPts) || LEVELS[0];
}
function getNextLevel(pts: number) {
  return LEVELS.find(l => l.minPts > pts);
}

export default function ProfileScreen() {
  const { user, streaks, leaderboard, badges, workoutLogs, foodLogs, waterTotal, waterGoal } = useAppStore();
  const [activeTab, setActiveTab] = useState<'stats' | 'streaks' | 'leaderboard' | 'ai'>('stats');

  const level = getLevel(user.points);
  const nextLevel = getNextLevel(user.points);
  const levelPct = nextLevel
    ? Math.min(((user.points - level.minPts) / (nextLevel.minPts - level.minPts)) * 100, 100)
    : 100;

  const copyReferral = () => {
    Clipboard.setString(`https://vitaltrack.app/join?ref=${user.referralCode}`);
    Alert.alert('Copied!', 'Referral link copied to clipboard');
  };

  const STREAK_INFO: Record<string, { label: string; emoji: string; color: string }> = {
    overall: { label: 'Overall', emoji: '🔥', color: COLORS.red },
    food: { label: 'Food', emoji: '🍎', color: COLORS.orange },
    workout: { label: 'Workout', emoji: '🏋️', color: COLORS.primary },
    water: { label: 'Water', emoji: '💧', color: COLORS.blue },
  };

  const TABS = [
    { key: 'stats', label: '📊 Stats' },
    { key: 'streaks', label: '🔥 Streaks' },
    { key: 'leaderboard', label: '🏆 Board' },
    { key: 'ai', label: '🤖 AI' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Profile Header */}
        <LinearGradient colors={['#0F0F1F', '#1A0A2E'] as [string,string]} style={styles.heroSection}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <LinearGradient colors={[COLORS.primary, COLORS.pink] as [string,string]} style={styles.avatar}>
              <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
            </LinearGradient>
            {user.isPremium && (
              <View style={styles.crownBadge}><Text style={styles.crownText}>👑</Text></View>
            )}
          </View>

          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          {/* Level badge */}
          <View style={styles.levelRow}>
            <Text style={styles.levelEmoji}>{level.emoji}</Text>
            <Text style={[styles.levelName, { color: level.color }]}>{level.name}</Text>
            {user.isPremium && <Badge label="PREMIUM" color={COLORS.yellow} />}
          </View>

          {/* Points + Level progress */}
          <View style={styles.heroCard}>
            <View style={styles.heroCardRow}>
              <View style={styles.heroCardStat}>
                <Text style={[styles.heroCardVal, { color: level.color }]}>{user.points.toLocaleString()}</Text>
                <Text style={styles.heroCardLabel}>Total Points</Text>
              </View>
              <View style={styles.heroCardStat}>
                <Text style={styles.heroCardVal}>{streaks.overall.current}</Text>
                <Text style={styles.heroCardLabel}>Day Streak</Text>
              </View>
              <View style={styles.heroCardStat}>
                <Text style={styles.heroCardVal}>{workoutLogs.length}</Text>
                <Text style={styles.heroCardLabel}>Workouts</Text>
              </View>
            </View>
            {nextLevel && (
              <>
                <View style={styles.levelProgressRow}>
                  <Text style={styles.levelProgressLabel}>{level.name}</Text>
                  <Text style={[styles.levelProgressLabel, { color: nextLevel.color || COLORS.yellow }]}>
                    {nextLevel.minPts - user.points} pts → {nextLevel.name}
                  </Text>
                </View>
                <ProgressBar value={user.points - level.minPts} max={nextLevel.minPts - level.minPts}
                  color={level.color} height={8} />
              </>
            )}
          </View>
        </LinearGradient>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabsContent}>
          {TABS.map(t => (
            <TouchableOpacity key={t.key} style={[styles.tab, activeTab === t.key && styles.tabActive]}
              onPress={() => setActiveTab(t.key as any)}>
              <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <View style={styles.tabContent}>
            {/* Health Stats */}
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Health Profile</Text>
              <View style={styles.statsGrid}>
                {[
                  { label: 'Height', value: `${user.height} cm`, emoji: '📏' },
                  { label: 'Current Weight', value: `${user.weight} kg`, emoji: '⚖️' },
                  { label: 'Target Weight', value: `${user.targetWeight} kg`, emoji: '🎯' },
                  { label: 'Activity Level', value: user.activityLevel, emoji: '⚡' },
                  { label: 'Calorie Goal', value: `${user.calorieGoal} kcal`, emoji: '🔥' },
                  { label: 'Water Goal', value: `${user.waterGoal}L`, emoji: '💧' },
                ].map(s => (
                  <View key={s.label} style={styles.statGrid}>
                    <Text style={styles.statGridEmoji}>{s.emoji}</Text>
                    <Text style={styles.statGridLabel}>{s.label}</Text>
                    <Text style={styles.statGridVal}>{s.value}</Text>
                  </View>
                ))}
              </View>
            </Card>

            {/* Refer & Earn */}
            <View style={[styles.referCard, { borderColor: `${COLORS.primary}40` }]}>
              <LinearGradient colors={[COLORS.primarySubtle, COLORS.card] as [string,string]} style={StyleSheet.absoluteFill} />
              <View style={styles.referHeader}>
                <Text style={styles.sectionTitle}>🎁 Refer & Earn</Text>
                <Badge label="+100 pts" color={COLORS.orange} />
              </View>
              <Text style={styles.referDesc}>Invite friends and earn 100 points for each signup!</Text>
              <View style={styles.referCodeRow}>
                <View style={styles.referCodeBox}>
                  <Text style={styles.referCode}>{user.referralCode}</Text>
                </View>
                <TouchableOpacity style={styles.copyBtn} onPress={copyReferral}>
                  <LinearGradient colors={[COLORS.primary, COLORS.primaryLight] as [string,string]} style={styles.copyBtnGrad}>
                    <Text style={styles.copyBtnText}>Copy Link</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Badges */}
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>🏅 Badges</Text>
              <View style={styles.badgesGrid}>
                {badges.map(b => (
                  <View key={b.id} style={[styles.badgeItem, !b.earned && styles.badgeItemLocked]}>
                    <Text style={[styles.badgeEmoji, !b.earned && styles.badgeEmojiLocked]}>{b.emoji}</Text>
                    <Text style={[styles.badgeLabel, !b.earned && { color: COLORS.textMuted }]}>{b.label}</Text>
                    {b.earned && <Text style={styles.badgeEarned}>✓ Earned</Text>}
                    {!b.earned && <Text style={styles.badgeLocked}>Locked</Text>}
                  </View>
                ))}
              </View>
            </Card>

            {/* Smart Reminders */}
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>🔔 Smart Reminders</Text>
              {[
                { emoji: '💧', label: 'Water Reminder', desc: 'Every 2 hours', active: true },
                { emoji: '🍎', label: 'Meal Log', desc: '8 AM, 1 PM, 7 PM', active: true },
                { emoji: '🏋️', label: 'Workout', desc: '6 PM weekdays', active: false },
              ].map(r => (
                <View key={r.label} style={styles.reminderRow}>
                  <Text style={styles.reminderEmoji}>{r.emoji}</Text>
                  <View style={styles.reminderInfo}>
                    <Text style={styles.reminderLabel}>{r.label}</Text>
                    <Text style={styles.reminderDesc}>{r.desc}</Text>
                  </View>
                  <View style={[styles.toggle, r.active && styles.toggleActive]}>
                    <View style={[styles.toggleKnob, r.active && styles.toggleKnobActive]} />
                  </View>
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* Streaks Tab */}
        {activeTab === 'streaks' && (
          <View style={styles.tabContent}>
            <View style={styles.streakGrid}>
              {Object.entries(streaks).map(([type, data]) => {
                const info = STREAK_INFO[type];
                const weekBars = Math.min(data.current, 7);
                return (
                  <Card key={type} style={[styles.streakCard, { borderColor: data.current > 0 ? `${info.color}40` : COLORS.border }]}>
                    <Text style={styles.streakEmoji}>{info.emoji}</Text>
                    <Text style={styles.streakType}>{info.label}</Text>
                    <Text style={[styles.streakNum, { color: data.current > 0 ? info.color : COLORS.textMuted }]}>{data.current}</Text>
                    <Text style={styles.streakDays}>day streak</Text>
                    <Text style={styles.streakBest}>Best: {data.longest} days</Text>
                    {/* Mini streak bars */}
                    <View style={styles.streakBars}>
                      {Array.from({ length: 7 }, (_, i) => (
                        <View key={i} style={[styles.streakBar, i < weekBars && { backgroundColor: info.color }]} />
                      ))}
                    </View>
                  </Card>
                );
              })}
            </View>

            {/* How to earn points */}
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>⭐ How to Earn Points</Text>
              {[
                { action: 'Log a meal', pts: 10, emoji: '🍎' },
                { action: 'Log workout', pts: 25, emoji: '🏋️' },
                { action: 'Track water', pts: 5, emoji: '💧' },
                { action: 'Daily streak', pts: 20, emoji: '🔥' },
                { action: 'Refer a friend', pts: 100, emoji: '👥' },
              ].map(e => (
                <View key={e.action} style={styles.earnRow}>
                  <Text style={styles.earnEmoji}>{e.emoji}</Text>
                  <Text style={styles.earnAction}>{e.action}</Text>
                  <Text style={[styles.earnPts, { color: COLORS.orange }]}>+{e.pts} pts</Text>
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <View style={styles.tabContent}>
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>🏆 Global Rankings</Text>
              {leaderboard.map((entry, i) => (
                <View key={i} style={[styles.leaderRow, entry.isCurrentUser && { borderColor: `${COLORS.primary}50`, borderWidth: 1 }]}>
                  {entry.isCurrentUser && (
                    <LinearGradient colors={[COLORS.primarySubtle, 'transparent'] as [string,string]} style={StyleSheet.absoluteFill} />
                  )}
                  <Text style={[styles.leaderRank,
                    entry.rank === 1 ? { color: COLORS.yellow } :
                    entry.rank === 2 ? { color: '#94a3b8' } :
                    entry.rank === 3 ? { color: '#cd7f32' } : { color: COLORS.textMuted }
                  ]}>
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                  </Text>
                  <View style={[styles.leaderAvatar, { backgroundColor: entry.isCurrentUser ? COLORS.primary : COLORS.surface }]}>
                    <Text style={styles.leaderAvatarText}>{entry.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.leaderInfo}>
                    <Text style={[styles.leaderName, entry.isCurrentUser && { color: COLORS.primary }]}>
                      {entry.name}{entry.isCurrentUser ? ' (You)' : ''}
                    </Text>
                    <Text style={styles.leaderStreak}>🔥 {entry.streak} day streak</Text>
                  </View>
                  <Text style={[styles.leaderPts, { color: COLORS.orange }]}>{entry.points.toLocaleString()}</Text>
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* AI Tab */}
        {activeTab === 'ai' && (
          <View style={styles.tabContent}>
            {/* Hero */}
            <View style={[styles.aiHero, { borderColor: `${COLORS.primary}30` }]}>
              <LinearGradient colors={['#1E1B4B', '#0A0A1F'] as [string,string]} style={StyleSheet.absoluteFill} />
              <Text style={styles.aiHeroEmoji}>🧠</Text>
              <Text style={styles.aiHeroTitle}>AI Health Coach</Text>
              <Text style={styles.aiHeroDesc}>Coming soon — personalized insights powered by AI</Text>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>✨ In Development</Text>
              </View>
            </View>

            {[
              { emoji: '🤖', title: 'AI Health Coach', desc: 'Get personalized diet & workout recommendations 24/7', color: COLORS.primary, tag: 'Coming Q2 2025' },
              { emoji: '📸', title: 'Food Scanner', desc: 'Take a photo → AI detects food & estimates calories', color: COLORS.green, tag: 'Coming Q3 2025' },
              { emoji: '📊', title: 'Smart Insights', desc: 'Weekly AI-generated health report & suggestions', color: COLORS.orange, tag: 'Coming Q1 2025' },
              { emoji: '✨', title: 'Meal Planner AI', desc: 'Personalized meal plans based on your goals', color: COLORS.pink, tag: 'Coming Q4 2025' },
            ].map(f => (
              <Card key={f.title} style={[styles.aiFeature, { borderColor: `${f.color}25` }]}>
                <LinearGradient colors={[`${f.color}10`, 'transparent'] as [string,string]} style={StyleSheet.absoluteFill} />
                <View style={styles.aiFeatureHeader}>
                  <Text style={styles.aiFeatureEmoji}>{f.emoji}</Text>
                  <View style={styles.aiFeatureInfo}>
                    <Text style={styles.aiFeatureTitle}>{f.title}</Text>
                    <Badge label={f.tag} color={f.color} size="sm" />
                  </View>
                </View>
                <Text style={styles.aiFeatureDesc}>{f.desc}</Text>
                <View style={styles.comingDot}>
                  <View style={[styles.dot, { backgroundColor: f.color }]} />
                  <Text style={styles.comingLabel}>In development</Text>
                </View>
              </Card>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: 32 },
  heroSection: { padding: SPACING.xl, alignItems: 'center', gap: SPACING.md, paddingBottom: SPACING.xxl },
  avatarContainer: { position: 'relative' },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: FONT.xxxl, fontWeight: '900', color: 'white' },
  crownBadge: { position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  crownText: { fontSize: 14 },
  userName: { fontSize: FONT.xl, fontWeight: '900', color: COLORS.textPrimary },
  userEmail: { fontSize: FONT.sm, color: COLORS.textMuted },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  levelEmoji: { fontSize: 20 },
  levelName: { fontSize: FONT.md, fontWeight: '800' },
  heroCard: { width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: RADIUS.lg, padding: SPACING.lg, gap: SPACING.md, borderWidth: 1, borderColor: `${COLORS.primary}20` },
  heroCardRow: { flexDirection: 'row', justifyContent: 'space-around' },
  heroCardStat: { alignItems: 'center' },
  heroCardVal: { fontSize: FONT.xxl, fontWeight: '900', color: COLORS.textPrimary },
  heroCardLabel: { fontSize: FONT.xs, color: COLORS.textMuted, fontWeight: '600' },
  levelProgressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  levelProgressLabel: { fontSize: FONT.xs, color: COLORS.textMuted, fontWeight: '700' },
  tabsScroll: { flexGrow: 0, paddingTop: SPACING.md },
  tabsContent: { paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  tab: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { fontSize: FONT.sm, fontWeight: '700', color: COLORS.textMuted },
  tabTextActive: { color: 'white' },
  tabContent: { padding: SPACING.lg, gap: SPACING.lg },
  section: { gap: SPACING.md },
  sectionTitle: { fontSize: FONT.md, fontWeight: '800', color: COLORS.textPrimary },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  statGrid: { width: '48%', backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, gap: SPACING.xs },
  statGridEmoji: { fontSize: 20 },
  statGridLabel: { fontSize: FONT.xs, color: COLORS.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  statGridVal: { fontSize: FONT.sm, fontWeight: '800', color: COLORS.textPrimary, textTransform: 'capitalize' },
  referCard: { borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden', padding: SPACING.lg, gap: SPACING.md },
  referHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  referDesc: { fontSize: FONT.sm, color: COLORS.textSecondary, lineHeight: 20 },
  referCodeRow: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center' },
  referCodeBox: { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  referCode: { fontSize: FONT.sm, fontWeight: '800', color: COLORS.primary, fontFamily: 'monospace' },
  copyBtn: { borderRadius: RADIUS.md, overflow: 'hidden' },
  copyBtnGrad: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  copyBtnText: { fontSize: FONT.sm, fontWeight: '800', color: 'white' },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  badgeItem: { width: '30%', backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: `${COLORS.primary}30` },
  badgeItemLocked: { opacity: 0.5, borderColor: COLORS.border },
  badgeEmoji: { fontSize: 28 },
  badgeEmojiLocked: { filter: 'grayscale(1)' as any },
  badgeLabel: { fontSize: FONT.xs, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  badgeEarned: { fontSize: FONT.xs, color: COLORS.green, fontWeight: '700' },
  badgeLocked: { fontSize: FONT.xs, color: COLORS.textMuted },
  reminderRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.borderSubtle },
  reminderEmoji: { fontSize: 22 },
  reminderInfo: { flex: 1 },
  reminderLabel: { fontSize: FONT.sm, fontWeight: '700', color: COLORS.textPrimary },
  reminderDesc: { fontSize: FONT.xs, color: COLORS.textMuted },
  toggle: { width: 44, height: 24, borderRadius: 12, backgroundColor: COLORS.border, justifyContent: 'center', padding: 2 },
  toggleActive: { backgroundColor: COLORS.primary },
  toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'white' },
  toggleKnobActive: { alignSelf: 'flex-end' },
  streakGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  streakCard: { width: '47%', alignItems: 'center', gap: SPACING.xs, padding: SPACING.lg },
  streakEmoji: { fontSize: 32 },
  streakType: { fontSize: FONT.xs, color: COLORS.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  streakNum: { fontSize: 40, fontWeight: '900' },
  streakDays: { fontSize: FONT.xs, color: COLORS.textMuted },
  streakBest: { fontSize: FONT.xs, color: COLORS.textMuted },
  streakBars: { flexDirection: 'row', gap: 4, marginTop: SPACING.xs },
  streakBar: { width: 12, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  earnRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.borderSubtle },
  earnEmoji: { fontSize: 20 },
  earnAction: { flex: 1, fontSize: FONT.sm, color: COLORS.textSecondary },
  earnPts: { fontSize: FONT.sm, fontWeight: '800' },
  leaderRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.md, borderRadius: RADIUS.md, paddingHorizontal: SPACING.sm, overflow: 'hidden', borderColor: 'transparent', borderWidth: 1, marginBottom: SPACING.xs },
  leaderRank: { fontSize: FONT.lg, fontWeight: '900', width: 36, textAlign: 'center' },
  leaderAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  leaderAvatarText: { fontSize: FONT.sm, fontWeight: '800', color: 'white' },
  leaderInfo: { flex: 1 },
  leaderName: { fontSize: FONT.sm, fontWeight: '700', color: COLORS.textPrimary },
  leaderStreak: { fontSize: FONT.xs, color: COLORS.textMuted },
  leaderPts: { fontSize: FONT.md, fontWeight: '800' },
  aiHero: { borderRadius: RADIUS.xl, borderWidth: 1, overflow: 'hidden', padding: SPACING.xxl, alignItems: 'center', gap: SPACING.md },
  aiHeroEmoji: { fontSize: 52 },
  aiHeroTitle: { fontSize: FONT.xl, fontWeight: '900', color: COLORS.textPrimary },
  aiHeroDesc: { fontSize: FONT.sm, color: COLORS.textSecondary, textAlign: 'center' },
  comingSoonBadge: { backgroundColor: `${COLORS.primary}30`, borderRadius: RADIUS.full, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderWidth: 1, borderColor: `${COLORS.primary}50` },
  comingSoonText: { fontSize: FONT.sm, fontWeight: '800', color: COLORS.primary },
  aiFeature: { gap: SPACING.md, overflow: 'hidden' },
  aiFeatureHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  aiFeatureEmoji: { fontSize: 32 },
  aiFeatureInfo: { flex: 1, gap: SPACING.xs },
  aiFeatureTitle: { fontSize: FONT.md, fontWeight: '800', color: COLORS.textPrimary },
  aiFeatureDesc: { fontSize: FONT.sm, color: COLORS.textSecondary, lineHeight: 20 },
  comingDot: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
  comingLabel: { fontSize: FONT.xs, color: COLORS.textMuted, fontWeight: '600' },
});
