// src/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Clipboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../store/useAppStore';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { userService } from '../services/userService';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { FONT, SPACING, RADIUS } from '../constants/theme';

const LEVELS = [
  { name: 'Beginner', minPts: 0,    emoji: '🌱', color: '#475569' },
  { name: 'Active',   minPts: 100,  emoji: '⚡', color: '#10B981' },
  { name: 'Fit',      minPts: 300,  emoji: '💪', color: '#3B82F6' },
  { name: 'Athlete',  minPts: 700,  emoji: '🏅', color: '#8B5CF6' },
  { name: 'Champion', minPts: 1500, emoji: '🏆', color: '#FBBF24' },
  { name: 'Legend',   minPts: 3000, emoji: '🔥', color: '#EF4444' },
];

function getLevel(pts: number) { return [...LEVELS].reverse().find(l => pts >= l.minPts) || LEVELS[0]; }
function getNextLevel(pts: number) { return LEVELS.find(l => l.minPts > pts); }

export default function ProfileScreen() {
  const { colors, isDark, themeMode, setTheme } = useTheme();
  const { user, leaderboard, workoutLogs, waterTotal, waterGoal, logout, fetchProfile } = useAppStore();
  const [activeTab, setActiveTab] = useState<'stats' | 'streaks' | 'leaderboard' | 'ai' | 'settings'>('stats');

  useEffect(() => { fetchProfile(); }, []);

  const pts = user?.points || 0;
  const level = getLevel(pts);
  const nextLevel = getNextLevel(pts);

  const badges = user?.badges || [];
  const streaks = user?.streaks || { overall: { current: 0, longest: 0 }, food: { current: 0, longest: 0 }, workout: { current: 0, longest: 0 }, water: { current: 0, longest: 0 } };

  const copyReferral = () => {
    Clipboard.setString(`https://vitaltrack.app/join?ref=${user?.referralCode}`);
    Alert.alert('Copied!', 'Referral link copied to clipboard');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const handleThemeChange = async (mode: ThemeMode) => {
    setTheme(mode);
    try { await userService.updateProfile({ theme: mode }); } catch {}
  };

  const STREAK_INFO: Record<string, { label: string; emoji: string; color: string }> = {
    overall: { label: 'Overall', emoji: '🔥', color: colors.red },
    food:    { label: 'Food',    emoji: '🍎', color: colors.orange },
    workout: { label: 'Workout', emoji: '🏋️', color: colors.primary },
    water:   { label: 'Water',   emoji: '💧', color: colors.blue },
  };

  const TABS = [
    { key: 'stats',      label: '📊 Stats' },
    { key: 'streaks',    label: '🔥 Streaks' },
    { key: 'leaderboard',label: '🏆 Board' },
    { key: 'settings',   label: '⚙️ Settings' },
  ];

  const heroGrad = isDark ? (['#0F0F1F','#1A0A2E'] as [string,string]) : (['#EEF2FF','#F5F3FF'] as [string,string]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero */}
        <LinearGradient colors={heroGrad} style={styles.hero}>
          <View style={styles.avatarContainer}>
            <LinearGradient colors={['#6366F1','#EC4899']} style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
            </LinearGradient>
            {user?.isPremium && <View style={[styles.crownBadge,{backgroundColor:colors.bg}]}><Text style={styles.crownText}>👑</Text></View>}
          </View>
          <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.name || 'User'}</Text>
          <Text style={[styles.userEmail, { color: colors.textMuted }]}>{user?.email || ''}</Text>
          <View style={styles.levelRow}>
            <Text style={styles.levelEmoji}>{level.emoji}</Text>
            <Text style={[styles.levelName, { color: level.color }]}>{level.name}</Text>
            {user?.isPremium && <Badge label="PREMIUM" color={colors.yellow} />}
          </View>
          <View style={[styles.heroCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', borderColor: `${colors.primary}20` }]}>
            <View style={styles.heroCardRow}>
              {[
                { val: pts.toLocaleString(), label: 'Points', color: level.color },
                { val: String(streaks.overall.current), label: 'Streak', color: colors.textPrimary },
                { val: String(workoutLogs.length), label: 'Workouts', color: colors.textPrimary },
              ].map(s => (
                <View key={s.label} style={styles.heroCardStat}>
                  <Text style={[styles.heroCardVal, { color: s.color }]}>{s.val}</Text>
                  <Text style={[styles.heroCardLabel, { color: colors.textMuted }]}>{s.label}</Text>
                </View>
              ))}
            </View>
            {nextLevel && (
              <>
                <View style={styles.levelProgressRow}>
                  <Text style={[styles.levelProgressLabel,{color:colors.textMuted}]}>{level.name}</Text>
                  <Text style={[styles.levelProgressLabel,{color:nextLevel.color||colors.yellow}]}>{nextLevel.minPts - pts} pts → {nextLevel.name}</Text>
                </View>
                <ProgressBar value={pts - level.minPts} max={nextLevel.minPts - level.minPts} color={level.color} height={8} />
              </>
            )}
          </View>
        </LinearGradient>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabsContent}>
          {TABS.map(t => (
            <TouchableOpacity key={t.key} style={[styles.tab, { borderColor: activeTab===t.key ? colors.primary : colors.border }, activeTab===t.key && { backgroundColor: colors.primary }]}
              onPress={() => setActiveTab(t.key as any)}>
              <Text style={[styles.tabText, { color: activeTab===t.key ? 'white' : colors.textMuted }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <View style={styles.tabContent}>
            <Card style={[styles.section, { backgroundColor: colors.card }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Health Profile</Text>
              <View style={styles.statsGrid}>
                {[
                  { label: 'Height',        value: `${user?.height || '--'} cm`,  emoji: '📏' },
                  { label: 'Weight',        value: `${user?.weight || '--'} kg`,  emoji: '⚖️' },
                  { label: 'Target Weight', value: `${user?.targetWeight || '--'} kg`, emoji: '🎯' },
                  { label: 'Activity',      value: user?.activityLevel || '--',   emoji: '⚡' },
                  { label: 'Cal Goal',      value: `${user?.calorieGoal || '--'} kcal`, emoji: '🔥' },
                  { label: 'Water Goal',    value: `${user?.waterGoal || '--'}L`, emoji: '💧' },
                ].map(s => (
                  <View key={s.label} style={[styles.statGrid, { backgroundColor: colors.surface }]}>
                    <Text style={styles.statGridEmoji}>{s.emoji}</Text>
                    <Text style={[styles.statGridLabel, { color: colors.textMuted }]}>{s.label}</Text>
                    <Text style={[styles.statGridVal, { color: colors.textPrimary }]}>{s.value}</Text>
                  </View>
                ))}
              </View>
            </Card>

            {/* Refer & Earn */}
            <View style={[styles.referCard, { borderColor: `${colors.primary}40` }]}>
              <LinearGradient colors={[isDark?'#1E1B4B':'#EEF2FF', colors.card] as [string,string]} style={StyleSheet.absoluteFill} />
              <View style={styles.referHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>🎁 Refer &amp; Earn</Text>
                <Badge label="+100 pts" color={colors.orange} />
              </View>
              <Text style={[styles.referDesc, { color: colors.textSecondary }]}>Invite friends and earn 100 points for each signup!</Text>
              <View style={styles.referCodeRow}>
                <View style={[styles.referCodeBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.referCode, { color: colors.primary }]}>{user?.referralCode || 'LOADING'}</Text>
                </View>
                <TouchableOpacity style={styles.copyBtn} onPress={copyReferral}>
                  <LinearGradient colors={['#6366F1','#818CF8']} style={styles.copyBtnGrad}>
                    <Text style={styles.copyBtnText}>Copy Link</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Badges */}
            <Card style={[styles.section, { backgroundColor: colors.card }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>🏅 Badges</Text>
              <View style={styles.badgesGrid}>
                {badges.map(b => (
                  <View key={b.id} style={[styles.badgeItem, { backgroundColor: colors.surface, borderColor: b.earned ? `${colors.primary}30` : colors.border, opacity: b.earned ? 1 : 0.5 }]}>
                    <Text style={styles.badgeEmoji}>{b.emoji}</Text>
                    <Text style={[styles.badgeLabel, { color: colors.textPrimary }]}>{b.label}</Text>
                    <Text style={{ fontSize: FONT.xs, color: b.earned ? colors.green : colors.textMuted, fontWeight: '700' }}>{b.earned ? '✓ Earned' : 'Locked'}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </View>
        )}

        {/* Streaks Tab */}
        {activeTab === 'streaks' && (
          <View style={styles.tabContent}>
            <View style={styles.streakGrid}>
              {Object.entries(streaks).map(([type, data]) => {
                const info = STREAK_INFO[type];
                const weekBars = Math.min((data as any).current, 7);
                return (
                  <Card key={type} style={[styles.streakCard, { backgroundColor: colors.card, borderColor: (data as any).current > 0 ? `${info.color}40` : colors.border }]}>
                    <Text style={styles.streakEmoji}>{info.emoji}</Text>
                    <Text style={[styles.streakType, { color: colors.textMuted }]}>{info.label}</Text>
                    <Text style={[styles.streakNum, { color: (data as any).current > 0 ? info.color : colors.textMuted }]}>{(data as any).current}</Text>
                    <Text style={[styles.streakDays, { color: colors.textMuted }]}>day streak</Text>
                    <Text style={[styles.streakBest, { color: colors.textMuted }]}>Best: {(data as any).longest} days</Text>
                    <View style={styles.streakBars}>
                      {Array.from({ length: 7 }, (_, i) => (
                        <View key={i} style={[styles.streakBar, { backgroundColor: i < weekBars ? info.color : colors.border }]} />
                      ))}
                    </View>
                  </Card>
                );
              })}
            </View>
          </View>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <View style={styles.tabContent}>
            <Card style={[styles.section, { backgroundColor: colors.card }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>🏆 Global Rankings</Text>
              {leaderboard.map((entry, i) => (
                <View key={i} style={[styles.leaderRow, entry.isCurrentUser && { borderColor: `${colors.primary}50`, borderWidth: 1 }, { overflow: 'hidden', borderRadius: RADIUS.md }]}>
                  {entry.isCurrentUser && <LinearGradient colors={[isDark?'#1E1B4B':'#EEF2FF','transparent'] as [string,string]} style={StyleSheet.absoluteFill} />}
                  <Text style={[styles.leaderRank, { color: entry.rank===1?colors.yellow:entry.rank===2?'#94a3b8':entry.rank===3?'#cd7f32':colors.textMuted }]}>
                    {entry.rank===1?'🥇':entry.rank===2?'🥈':entry.rank===3?'🥉':`#${entry.rank}`}
                  </Text>
                  <View style={[styles.leaderAvatar, { backgroundColor: entry.isCurrentUser ? colors.primary : colors.surface }]}>
                    <Text style={[styles.leaderAvatarText, { color: 'white' }]}>{entry.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.leaderInfo}>
                    <Text style={[styles.leaderName, { color: entry.isCurrentUser ? colors.primary : colors.textPrimary }]}>{entry.name}{entry.isCurrentUser?' (You)':''}</Text>
                    <Text style={[styles.leaderStreak, { color: colors.textMuted }]}>🔥 {entry.streak} day streak</Text>
                  </View>
                  <Text style={[styles.leaderPts, { color: colors.orange }]}>{entry.points.toLocaleString()}</Text>
                </View>
              ))}
              {leaderboard.length === 0 && <Text style={[styles.emptyText, { color: colors.textMuted }]}>No leaderboard data yet</Text>}
            </Card>
          </View>
        )}

        {/* Settings Tab (with Theme Switcher) */}
        {activeTab === 'settings' && (
          <View style={styles.tabContent}>

            {/* ── Theme Switcher ─────────────────────────────────────── */}
            <Card style={[styles.section, { backgroundColor: colors.card }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>🎨 Appearance</Text>
              <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Choose how VitalTrack looks on your device</Text>
              <View style={styles.themeRow}>
                {([
                  { mode: 'light',  label: 'Light',  emoji: '☀️' },
                  { mode: 'dark',   label: 'Dark',   emoji: '🌙' },
                  { mode: 'system', label: 'System', emoji: '📱' },
                ] as { mode: ThemeMode; label: string; emoji: string }[]).map(opt => {
                  const active = themeMode === opt.mode;
                  return (
                    <TouchableOpacity
                      key={opt.mode}
                      style={[styles.themeOption, {
                        borderColor: active ? colors.primary : colors.border,
                        backgroundColor: active ? `${colors.primary}15` : colors.surface,
                      }]}
                      onPress={() => handleThemeChange(opt.mode)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.themeEmoji}>{opt.emoji}</Text>
                      <Text style={[styles.themeLabel, { color: active ? colors.primary : colors.textSecondary }]}>{opt.label}</Text>
                      {active && (
                        <View style={[styles.themeCheck, { backgroundColor: colors.primary }]}>
                          <Text style={styles.themeCheckText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>

            {/* Account */}
            <Card style={[styles.section, { backgroundColor: colors.card }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>👤 Account</Text>
              {[
                { emoji: '📝', label: 'Edit Profile',       desc: 'Update your health goals' },
                { emoji: '🔔', label: 'Notifications',       desc: 'Manage reminders' },
                { emoji: '🔒', label: 'Privacy & Security',  desc: 'Control your data' },
                { emoji: '❓', label: 'Help & Support',      desc: 'Get assistance' },
              ].map(item => (
                <TouchableOpacity key={item.label} style={[styles.settingRow, { borderTopColor: colors.borderSubtle }]}>
                  <Text style={styles.settingEmoji}>{item.emoji}</Text>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{item.label}</Text>
                    <Text style={[styles.settingDesc2, { color: colors.textMuted }]}>{item.desc}</Text>
                  </View>
                  <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
                </TouchableOpacity>
              ))}
            </Card>

            {/* Logout */}
            <TouchableOpacity style={[styles.logoutBtn, { borderColor: colors.red }]} onPress={handleLogout} activeOpacity={0.8}>
              <Text style={[styles.logoutText, { color: colors.red }]}>🚪 Logout</Text>
            </TouchableOpacity>

            <Text style={[styles.version, { color: colors.textMuted }]}>VitalTrack v1.0.0</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 32 },
  hero: { padding: SPACING.xl, alignItems: 'center', gap: SPACING.md, paddingBottom: SPACING.xxl },
  avatarContainer: { position: 'relative' },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 32, fontWeight: '900', color: 'white' },
  crownBadge: { position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  crownText: { fontSize: 14 },
  userName: { fontSize: FONT.xl, fontWeight: '900' },
  userEmail: { fontSize: FONT.sm },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  levelEmoji: { fontSize: 20 },
  levelName: { fontSize: FONT.md, fontWeight: '800' },
  heroCard: { width: '100%', borderRadius: RADIUS.lg, padding: SPACING.lg, gap: SPACING.md, borderWidth: 1 },
  heroCardRow: { flexDirection: 'row', justifyContent: 'space-around' },
  heroCardStat: { alignItems: 'center' },
  heroCardVal: { fontSize: FONT.xxl, fontWeight: '900' },
  heroCardLabel: { fontSize: FONT.xs, fontWeight: '600' },
  levelProgressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  levelProgressLabel: { fontSize: FONT.xs, fontWeight: '700' },
  tabsScroll: { flexGrow: 0, paddingTop: SPACING.md },
  tabsContent: { paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  tab: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, borderWidth: 1 },
  tabText: { fontSize: FONT.sm, fontWeight: '700' },
  tabContent: { padding: SPACING.lg, gap: SPACING.lg },
  section: { gap: SPACING.md, padding: SPACING.lg, borderRadius: RADIUS.lg },
  sectionTitle: { fontSize: FONT.md, fontWeight: '800' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  statGrid: { width: '48%', borderRadius: RADIUS.md, padding: SPACING.md, gap: SPACING.xs },
  statGridEmoji: { fontSize: 20 },
  statGridLabel: { fontSize: FONT.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  statGridVal: { fontSize: FONT.sm, fontWeight: '800', textTransform: 'capitalize' },
  referCard: { borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden', padding: SPACING.lg, gap: SPACING.md },
  referHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  referDesc: { fontSize: FONT.sm, lineHeight: 20 },
  referCodeRow: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center' },
  referCodeBox: { flex: 1, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1 },
  referCode: { fontSize: FONT.sm, fontWeight: '800', fontFamily: 'monospace' },
  copyBtn: { borderRadius: RADIUS.md, overflow: 'hidden' },
  copyBtnGrad: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  copyBtnText: { fontSize: FONT.sm, fontWeight: '800', color: 'white' },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  badgeItem: { width: '30%', borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', gap: 4, borderWidth: 1 },
  badgeEmoji: { fontSize: 28 },
  badgeLabel: { fontSize: FONT.xs, fontWeight: '700', textAlign: 'center' },
  streakGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  streakCard: { width: '47%', alignItems: 'center', gap: SPACING.xs, padding: SPACING.lg, borderRadius: RADIUS.lg, borderWidth: 1 },
  streakEmoji: { fontSize: 32 },
  streakType: { fontSize: FONT.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  streakNum: { fontSize: 40, fontWeight: '900' },
  streakDays: { fontSize: FONT.xs },
  streakBest: { fontSize: FONT.xs },
  streakBars: { flexDirection: 'row', gap: 4, marginTop: SPACING.xs },
  streakBar: { width: 12, height: 8, borderRadius: 4 },
  leaderRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.md, paddingHorizontal: SPACING.sm, marginBottom: SPACING.xs, borderWidth: 1, borderColor: 'transparent' },
  leaderRank: { fontSize: FONT.lg, fontWeight: '900', width: 36, textAlign: 'center' },
  leaderAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  leaderAvatarText: { fontSize: FONT.sm, fontWeight: '800' },
  leaderInfo: { flex: 1 },
  leaderName: { fontSize: FONT.sm, fontWeight: '700' },
  leaderStreak: { fontSize: FONT.xs },
  leaderPts: { fontSize: FONT.md, fontWeight: '800' },
  emptyText: { textAlign: 'center', fontSize: FONT.sm, paddingVertical: SPACING.xl },
  // Theme switcher
  settingDesc: { fontSize: FONT.sm, lineHeight: 20 },
  themeRow: { flexDirection: 'row', gap: SPACING.sm },
  themeOption: { flex: 1, alignItems: 'center', paddingVertical: SPACING.lg, borderRadius: RADIUS.lg, borderWidth: 2, gap: SPACING.sm, position: 'relative' },
  themeEmoji: { fontSize: 28 },
  themeLabel: { fontSize: FONT.xs, fontWeight: '800' },
  themeCheck: { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  themeCheckText: { fontSize: 10, color: 'white', fontWeight: '900' },
  // Settings rows
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.md, borderTopWidth: 1 },
  settingEmoji: { fontSize: 22 },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: FONT.sm, fontWeight: '700' },
  settingDesc2: { fontSize: FONT.xs },
  chevron: { fontSize: 22, fontWeight: '300' },
  // Logout
  logoutBtn: { borderRadius: RADIUS.lg, borderWidth: 1.5, paddingVertical: SPACING.lg, alignItems: 'center' },
  logoutText: { fontSize: FONT.md, fontWeight: '800' },
  version: { textAlign: 'center', fontSize: FONT.xs },
});
