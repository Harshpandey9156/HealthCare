// src/screens/DashboardScreen.tsx
import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useAppStore } from '../store/useAppStore';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useTheme } from '../context/ThemeContext';
import { FONT, SPACING, RADIUS } from '../constants/theme';

const { width: W } = Dimensions.get('window');
const CHART_W = W - SPACING.lg * 2 - 32;

export default function DashboardScreen() {
  const { colors, isDark, gradients } = useTheme();
  const {
    user, todayCalories, todayProtein, todayCarbs, todayFats,
    foodLogs, workoutLogs, calorieTrend, waterTotal, waterGoal,
    fetchFoodLogs, fetchWorkoutLogs, fetchWaterLogs, isLoadingFood,
  } = useAppStore();

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchFoodLogs(today);
    fetchWorkoutLogs(today);
    fetchWaterLogs(today);
  }, []);

  const calorieGoal = user?.calorieGoal || 2000;
  const calPct = Math.min(Math.round((todayCalories / calorieGoal) * 100), 100);
  const overallStreak = user?.streaks?.overall?.current || 0;
  const todayWorkouts = workoutLogs.filter((w) => w.date === today);
  const totalWorkoutCal = todayWorkouts.reduce((s, w) => s + w.caloriesBurned, 0);

  const macroTotal = todayProtein + todayCarbs + todayFats;
  const pieData = macroTotal > 0 ? [
    { name: 'P', population: todayProtein, color: colors.primary, legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: 'C', population: todayCarbs,   color: colors.orange,  legendFontColor: colors.textSecondary, legendFontSize: 12 },
    { name: 'F', population: todayFats,    color: colors.red,     legendFontColor: colors.textSecondary, legendFontSize: 12 },
  ] : [{ name: 'Log meals', population: 1, color: colors.border, legendFontColor: colors.textMuted, legendFontSize: 12 }];

  const lineData = {
    labels: calorieTrend.length > 0 ? calorieTrend.map((d: any) => d.day) : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    datasets: [{
      data: calorieTrend.length > 0 ? calorieTrend.map((d: any) => d.calories || 0) : [0, 0, 0, 0, 0, 0, 0],
      color: (opacity = 1) => `rgba(99,102,241,${opacity})`,
      strokeWidth: 2.5,
    }],
  };

  const chartConfig = {
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(99,102,241,${opacity})`,
    labelColor: () => colors.textMuted,
    propsForDots: { r: '5', strokeWidth: '2', stroke: colors.primary },
    propsForBackgroundLines: { stroke: colors.border },
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const heroColors = isDark
    ? (['#0F0F1F', '#1A0A2E'] as [string, string])
    : (['#EEF2FF', '#F0F4FF'] as [string, string]);

  const heroCardColors = isDark
    ? (['#1E1B4B', '#13131F'] as [string, string])
    : (['#FFFFFF', '#F8FAFC'] as [string, string]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero Header */}
        <LinearGradient colors={heroColors} style={styles.hero}>
          <View style={styles.heroTop}>
            <View>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>{greeting()} 👋</Text>
              <Text style={[styles.heroName, { color: colors.textPrimary }]}>{user?.name?.split(' ')[0] || 'User'}</Text>
            </View>
            {overallStreak > 0 && (
              <View style={[styles.streakBadge, { backgroundColor: isDark ? '#2D1A00' : '#FFF7ED', borderColor: `${colors.orange}50` }]}>
                <Text style={styles.streakFire}>🔥</Text>
                <Text style={[styles.streakText, { color: colors.orange }]}>{overallStreak} days</Text>
              </View>
            )}
          </View>

          {/* Calorie Card */}
          <View style={[styles.heroCard, { borderColor: `${colors.primary}30` }]}>
            <LinearGradient colors={heroCardColors} style={styles.heroCardInner}>
              <View style={styles.heroRow}>
                <View style={styles.ringContainer}>
                  <RingProgress value={todayCalories} max={calorieGoal} color={colors.primary} size={90} bgColor={colors.border} />
                  <View style={styles.ringCenter}>
                    <Text style={[styles.ringPct, { color: colors.primary }]}>{calPct}%</Text>
                  </View>
                </View>
                <View style={styles.heroStats}>
                  <Text style={[styles.heroCalLabel, { color: colors.textMuted }]}>Calories Today</Text>
                  <Text style={[styles.heroCalValue, { color: colors.textPrimary }]}>{todayCalories.toLocaleString()}</Text>
                  <Text style={[styles.heroCalGoal, { color: colors.textMuted }]}>/ {calorieGoal.toLocaleString()} kcal</Text>
                  <View style={styles.miniMacros}>
                    <MacroDot label="P" value={todayProtein} color={colors.primary} />
                    <MacroDot label="C" value={todayCarbs} color={colors.orange} />
                    <MacroDot label="F" value={todayFats} color={colors.red} />
                  </View>
                </View>
              </View>
              <ProgressBar value={todayCalories} max={calorieGoal} color={colors.primary} height={6} style={{ marginTop: SPACING.md }} />
              <Text style={[styles.remaining, { color: colors.textMuted }]}>
                {Math.max(calorieGoal - todayCalories, 0).toLocaleString()} kcal remaining
              </Text>
            </LinearGradient>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Quick Stats */}
          <View style={styles.quickRow}>
            <QuickStat icon="💧" value={`${waterTotal.toFixed(1)}L`} label="Water" color={colors.blue} colors={colors} />
            <QuickStat icon="🔥" value={`${totalWorkoutCal}`} label="Burned" color={colors.red} colors={colors} />
            <QuickStat icon="🏋️" value={`${todayWorkouts.length}`} label="Workouts" color={colors.purple} colors={colors} />
            <QuickStat icon="⭐" value={`${user?.points || 0}`} label="Points" color={colors.yellow} colors={colors} />
          </View>

          {/* Calorie Trend Chart */}
          <Card style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>7-Day Calorie Trend 📈</Text>
            <Text style={[styles.sectionSub, { color: colors.textMuted }]}>Daily intake vs goal</Text>
            {isLoadingFood ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: 40 }} />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <LineChart
                  data={lineData}
                  width={CHART_W}
                  height={180}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                  withInnerLines={false}
                  yAxisSuffix=" cal"
                />
              </ScrollView>
            )}
          </Card>

          {/* Macro Breakdown */}
          <Card style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Macro Breakdown 🥗</Text>
            <Text style={[styles.sectionSub, { color: colors.textMuted }]}>Today's nutrient distribution</Text>
            <View style={styles.pieRow}>
              <PieChart
                data={pieData}
                width={W / 2 - 16}
                height={160}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="10"
                hasLegend={false}
              />
              <View style={styles.macroLegend}>
                {[
                  { label: 'Protein', value: todayProtein, color: colors.primary },
                  { label: 'Carbs',   value: todayCarbs,   color: colors.orange },
                  { label: 'Fats',    value: todayFats,    color: colors.red },
                ].map((m) => (
                  <View key={m.label} style={styles.macroLegendItem}>
                    <View style={[styles.macroLegendDot, { backgroundColor: m.color }]} />
                    <View>
                      <Text style={[styles.macroLegendLabel, { color: colors.textMuted }]}>{m.label}</Text>
                      <Text style={[styles.macroLegendVal, { color: m.color }]}>{Math.round(m.value)}g</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </Card>

          {/* Today's Meals */}
          <Card style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Today's Meals 🍽️</Text>
            {foodLogs.length > 0 ? foodLogs.slice(0, 4).map((meal) => (
              <MealRow key={meal.id} meal={meal} colors={colors} />
            )) : (
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No meals logged yet. Start tracking!</Text>
            )}
          </Card>

          {/* Today's Workouts */}
          <Card style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Today's Workouts 🏋️</Text>
            {todayWorkouts.length > 0 ? todayWorkouts.map((w) => (
              <WorkoutRow key={w.id} workout={w} colors={colors} />
            )) : (
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No workouts logged today</Text>
            )}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function RingProgress({ value, max, color, size, bgColor }: { value: number; max: number; color: string; size: number; bgColor: string }) {
  const pct = Math.min(value / max, 1);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 7, borderColor: bgColor, position: 'absolute' }} />
      <View style={{
        width: size - 14, height: size - 14, borderRadius: (size - 14) / 2,
        borderWidth: 7, borderColor: 'transparent',
        borderTopColor: color,
        borderRightColor: pct > 0.25 ? color : 'transparent',
        borderBottomColor: pct > 0.5 ? color : 'transparent',
        borderLeftColor: pct > 0.75 ? color : 'transparent',
        transform: [{ rotate: '-45deg' }],
        position: 'absolute',
      }} />
    </View>
  );
}

function MacroDot({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.macroDot}>
      <View style={[styles.macroDotCircle, { backgroundColor: color }]} />
      <Text style={[styles.macroDotLabel, { color: '#94A3B8' }]}>{label} {Math.round(value)}g</Text>
    </View>
  );
}

function QuickStat({ icon, value, label, color, colors }: { icon: string; value: string; label: string; color: string; colors: any }) {
  return (
    <View style={[styles.quickStat, { borderColor: `${color}30`, backgroundColor: colors.card }]}>
      <LinearGradient colors={[`${color}20`, `${color}05`] as [string, string]} style={StyleSheet.absoluteFill} />
      <Text style={styles.quickIcon}>{icon}</Text>
      <Text style={[styles.quickValue, { color }]}>{value}</Text>
      <Text style={[styles.quickLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

function MealRow({ meal, colors }: { meal: any; colors: any }) {
  const mealColors: Record<string, string> = {
    breakfast: colors.orange, lunch: colors.green, snack: colors.primary, dinner: colors.red,
  };
  const color = mealColors[meal.mealType] || colors.primary;
  return (
    <View style={[styles.mealRow, { borderBottomColor: colors.borderSubtle }]}>
      <View style={[styles.mealDot, { backgroundColor: color }]} />
      <View style={styles.mealInfo}>
        <Text style={[styles.mealName, { color: colors.textPrimary }]}>{meal.foodName}</Text>
        <Text style={[styles.mealSub, { color: colors.textMuted }]}>{meal.mealType} · P:{Math.round(meal.protein)}g C:{Math.round(meal.carbs)}g F:{Math.round(meal.fats)}g</Text>
      </View>
      <Text style={[styles.mealCal, { color }]}>{Math.round(meal.calories)}</Text>
    </View>
  );
}

function WorkoutRow({ workout, colors }: { workout: any; colors: any }) {
  return (
    <View style={styles.workoutRow}>
      <Text style={styles.workoutEmoji}>{workout.emoji}</Text>
      <View style={styles.workoutInfo}>
        <Text style={[styles.workoutName, { color: colors.textPrimary }]}>{workout.name}</Text>
        <Text style={[styles.workoutSub, { color: colors.textMuted }]}>{workout.duration} min</Text>
      </View>
      <Text style={[styles.workoutCal, { color: colors.green }]}>-{workout.caloriesBurned} kcal</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 32 },
  hero: { paddingTop: SPACING.xl, paddingHorizontal: SPACING.lg, paddingBottom: 0 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  greeting: { fontSize: FONT.sm, fontWeight: '600' },
  heroName: { fontSize: FONT.xxl, fontWeight: '900' },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  streakFire: { fontSize: 16 },
  streakText: { fontSize: FONT.sm, fontWeight: '800' },
  heroCard: { marginTop: SPACING.lg, borderRadius: RADIUS.xl, overflow: 'hidden', borderWidth: 1 },
  heroCardInner: { padding: SPACING.xl },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xl },
  ringContainer: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  ringPct: { fontSize: FONT.sm, fontWeight: '800' },
  heroStats: { flex: 1 },
  heroCalLabel: { fontSize: FONT.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  heroCalValue: { fontSize: FONT.xxxl, fontWeight: '900' },
  heroCalGoal: { fontSize: FONT.sm, marginBottom: SPACING.sm },
  miniMacros: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  macroDot: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  macroDotCircle: { width: 6, height: 6, borderRadius: 3 },
  macroDotLabel: { fontSize: FONT.xs, fontWeight: '600' },
  remaining: { fontSize: FONT.xs, textAlign: 'center', marginTop: SPACING.sm },
  body: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, gap: SPACING.lg },
  quickRow: { flexDirection: 'row', gap: SPACING.sm },
  quickStat: { flex: 1, borderRadius: RADIUS.md, borderWidth: 1, alignItems: 'center', padding: SPACING.sm, overflow: 'hidden', gap: 2 },
  quickIcon: { fontSize: 18 },
  quickValue: { fontSize: FONT.md, fontWeight: '800' },
  quickLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  section: { gap: SPACING.sm, padding: SPACING.lg, borderRadius: RADIUS.lg },
  sectionTitle: { fontSize: FONT.md, fontWeight: '800' },
  sectionSub: { fontSize: FONT.xs, marginBottom: SPACING.sm },
  chart: { borderRadius: RADIUS.md, marginLeft: -SPACING.sm },
  pieRow: { flexDirection: 'row', alignItems: 'center' },
  macroLegend: { flex: 1, gap: SPACING.md },
  macroLegendItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  macroLegendDot: { width: 10, height: 10, borderRadius: 5 },
  macroLegendLabel: { fontSize: FONT.xs, fontWeight: '600' },
  macroLegendVal: { fontSize: FONT.md, fontWeight: '800' },
  mealRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1 },
  mealDot: { width: 8, height: 8, borderRadius: 4 },
  mealInfo: { flex: 1 },
  mealName: { fontSize: FONT.sm, fontWeight: '700' },
  mealSub: { fontSize: FONT.xs, marginTop: 2 },
  mealCal: { fontSize: FONT.md, fontWeight: '800' },
  workoutRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm },
  workoutEmoji: { fontSize: 24 },
  workoutInfo: { flex: 1 },
  workoutName: { fontSize: FONT.sm, fontWeight: '700' },
  workoutSub: { fontSize: FONT.xs },
  workoutCal: { fontSize: FONT.sm, fontWeight: '700' },
  emptyText: { fontSize: FONT.sm, textAlign: 'center', paddingVertical: SPACING.xl },
});
