// src/screens/DashboardScreen.tsx
import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useAppStore } from '../store/useAppStore';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { COLORS, FONT, SPACING, RADIUS, GRADIENTS } from '../constants/theme';

const { width: W } = Dimensions.get('window');
const CHART_W = W - SPACING.lg * 2 - 32;

const chartConfig = {
  backgroundGradientFrom: COLORS.card,
  backgroundGradientTo: COLORS.card,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(99,102,241,${opacity})`,
  labelColor: () => COLORS.textMuted,
  propsForDots: { r: '5', strokeWidth: '2', stroke: COLORS.primary },
  propsForBackgroundLines: { stroke: COLORS.border },
};

export default function DashboardScreen() {
  const {
    user, todayCalories, todayProtein, todayCarbs, todayFats,
    foodLogs, workoutLogs, streaks, calorieTrend, waterTotal, waterGoal,
  } = useAppStore();

  const calorieGoal = user.calorieGoal;
  const calPct = Math.min(Math.round((todayCalories / calorieGoal) * 100), 100);
  const overallStreak = streaks.overall.current;

  const todayWorkouts = workoutLogs.filter(w => w.date === new Date().toISOString().split('T')[0]);
  const totalWorkoutCal = todayWorkouts.reduce((s, w) => s + w.caloriesBurned, 0);

  const macroTotal = todayProtein + todayCarbs + todayFats;
  const pieData = macroTotal > 0 ? [
    { name: 'P', population: todayProtein, color: COLORS.primary, legendFontColor: COLORS.textSecondary, legendFontSize: 12 },
    { name: 'C', population: todayCarbs, color: COLORS.orange, legendFontColor: COLORS.textSecondary, legendFontSize: 12 },
    { name: 'F', population: todayFats, color: COLORS.red, legendFontColor: COLORS.textSecondary, legendFontSize: 12 },
  ] : [{ name: 'Log meals', population: 1, color: COLORS.border, legendFontColor: COLORS.textMuted, legendFontSize: 12 }];

  const lineData = {
    labels: calorieTrend.map(d => d.day),
    datasets: [{
      data: calorieTrend.map(d => d.calories),
      color: (opacity = 1) => `rgba(99,102,241,${opacity})`,
      strokeWidth: 2.5,
    }],
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero Header */}
        <LinearGradient colors={['#0F0F1F', '#1A0A2E'] as [string,string]} style={styles.hero}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.greeting}>{greeting()} 👋</Text>
              <Text style={styles.heroName}>{user.name.split(' ')[0]}</Text>
            </View>
            {overallStreak > 0 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakFire}>🔥</Text>
                <Text style={styles.streakText}>{overallStreak} days</Text>
              </View>
            )}
          </View>

          {/* Calorie Ring + Summary */}
          <View style={styles.heroCard}>
            <LinearGradient colors={['#1E1B4B', '#13131F'] as [string,string]} style={styles.heroCardInner}>
              <View style={styles.heroRow}>
                {/* Ring Progress */}
                <View style={styles.ringContainer}>
                  <RingProgress value={todayCalories} max={calorieGoal} color={COLORS.primary} size={90} />
                  <View style={styles.ringCenter}>
                    <Text style={styles.ringPct}>{calPct}%</Text>
                  </View>
                </View>
                <View style={styles.heroStats}>
                  <Text style={styles.heroCalLabel}>Calories Today</Text>
                  <Text style={styles.heroCalValue}>{todayCalories.toLocaleString()}</Text>
                  <Text style={styles.heroCalGoal}>/ {calorieGoal.toLocaleString()} kcal</Text>
                  <View style={styles.miniMacros}>
                    <MacroDot label="P" value={todayProtein} color={COLORS.primary} />
                    <MacroDot label="C" value={todayCarbs} color={COLORS.orange} />
                    <MacroDot label="F" value={todayFats} color={COLORS.red} />
                  </View>
                </View>
              </View>
              <ProgressBar value={todayCalories} max={calorieGoal} color={COLORS.primary} height={6} style={{ marginTop: SPACING.md }} />
              <Text style={styles.remaining}>{Math.max(calorieGoal - todayCalories, 0).toLocaleString()} kcal remaining</Text>
            </LinearGradient>
          </View>
        </LinearGradient>

        <View style={styles.body}>

          {/* Quick Stats Row */}
          <View style={styles.quickRow}>
            <QuickStat icon="💧" value={`${waterTotal.toFixed(1)}L`} label="Water" color={COLORS.blue} pct={Math.round((waterTotal/waterGoal)*100)} />
            <QuickStat icon="🔥" value={`${totalWorkoutCal}`} label="Burned" color={COLORS.red} />
            <QuickStat icon="🏋️" value={`${todayWorkouts.length}`} label="Workouts" color={COLORS.purple} />
            <QuickStat icon="⭐" value={`${user.points}`} label="Points" color={COLORS.yellow} />
          </View>

          {/* Calorie Trend */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>7-Day Calorie Trend 📈</Text>
            <Text style={styles.sectionSub}>Daily intake vs goal</Text>
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
          </Card>

          {/* Macro Breakdown */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Macro Breakdown 🥗</Text>
            <Text style={styles.sectionSub}>Today's nutrient distribution</Text>
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
                  { label: 'Protein', value: todayProtein, color: COLORS.primary },
                  { label: 'Carbs', value: todayCarbs, color: COLORS.orange },
                  { label: 'Fats', value: todayFats, color: COLORS.red },
                  { label: 'Fiber', value: 0, color: COLORS.green },
                ].map(m => (
                  <View key={m.label} style={styles.macroLegendItem}>
                    <View style={[styles.macroLegendDot, { backgroundColor: m.color }]} />
                    <View>
                      <Text style={styles.macroLegendLabel}>{m.label}</Text>
                      <Text style={[styles.macroLegendVal, { color: m.color }]}>{Math.round(m.value)}g</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </Card>

          {/* Today's Meals */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Meals 🍽️</Text>
            {foodLogs.length > 0 ? foodLogs.slice(0, 4).map(meal => (
              <MealRow key={meal.id} meal={meal} />
            )) : (
              <Text style={styles.emptyText}>No meals logged yet. Start tracking!</Text>
            )}
          </Card>

          {/* Today's Workouts */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Workouts 🏋️</Text>
            {todayWorkouts.length > 0 ? todayWorkouts.map(w => (
              <WorkoutRow key={w.id} workout={w} />
            )) : (
              <Text style={styles.emptyText}>No workouts logged today</Text>
            )}
          </Card>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function RingProgress({ value, max, color, size }: { value: number; max: number; color: string; size: number }) {
  const pct = Math.min(value / max, 1);
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  // Simple SVG ring via border-radius trick
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: size, height: size, borderRadius: size / 2,
        borderWidth: 7, borderColor: COLORS.border,
        position: 'absolute',
      }} />
      <View style={{
        width: size - 14, height: size - 14, borderRadius: (size - 14) / 2,
        borderWidth: 7,
        borderColor: 'transparent',
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
      <Text style={styles.macroDotLabel}>{label} {Math.round(value)}g</Text>
    </View>
  );
}

function QuickStat({ icon, value, label, color, pct }: { icon: string; value: string; label: string; color: string; pct?: number }) {
  return (
    <View style={[styles.quickStat, { borderColor: `${color}30` }]}>
      <LinearGradient colors={[`${color}20`, `${color}05`] as [string,string]} style={StyleSheet.absoluteFill} />
      <Text style={styles.quickIcon}>{icon}</Text>
      <Text style={[styles.quickValue, { color }]}>{value}</Text>
      <Text style={styles.quickLabel}>{label}</Text>
    </View>
  );
}

function MealRow({ meal }: { meal: any }) {
  const colors: Record<string, string> = { breakfast: COLORS.orange, lunch: COLORS.green, snack: COLORS.primary, dinner: COLORS.red };
  const color = colors[meal.mealType] || COLORS.primary;
  return (
    <View style={styles.mealRow}>
      <View style={[styles.mealDot, { backgroundColor: color }]} />
      <View style={styles.mealInfo}>
        <Text style={styles.mealName}>{meal.foodName}</Text>
        <Text style={styles.mealSub}>{meal.mealType} · P:{Math.round(meal.protein)}g C:{Math.round(meal.carbs)}g F:{Math.round(meal.fats)}g</Text>
      </View>
      <Text style={[styles.mealCal, { color }]}>{Math.round(meal.calories)}</Text>
    </View>
  );
}

function WorkoutRow({ workout }: { workout: any }) {
  return (
    <View style={styles.workoutRow}>
      <Text style={styles.workoutEmoji}>{workout.emoji}</Text>
      <View style={styles.workoutInfo}>
        <Text style={styles.workoutName}>{workout.name}</Text>
        <Text style={styles.workoutSub}>{workout.duration} min</Text>
      </View>
      <Text style={[styles.workoutCal, { color: COLORS.green }]}>-{workout.caloriesBurned} kcal</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: 32 },
  hero: { paddingTop: SPACING.xl, paddingHorizontal: SPACING.lg, paddingBottom: 0 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  greeting: { fontSize: FONT.sm, color: COLORS.textSecondary, fontWeight: '600' },
  heroName: { fontSize: FONT.xxl, fontWeight: '900', color: COLORS.textPrimary },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#2D1A00', borderWidth: 1, borderColor: `${COLORS.orange}50`, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  streakFire: { fontSize: 16 },
  streakText: { fontSize: FONT.sm, fontWeight: '800', color: COLORS.orange },
  heroCard: { marginTop: SPACING.lg, borderRadius: RADIUS.xl, overflow: 'hidden', borderWidth: 1, borderColor: `${COLORS.primary}30` },
  heroCardInner: { padding: SPACING.xl },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xl },
  ringContainer: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  ringPct: { fontSize: FONT.sm, fontWeight: '800', color: COLORS.primary },
  heroStats: { flex: 1 },
  heroCalLabel: { fontSize: FONT.xs, color: COLORS.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  heroCalValue: { fontSize: FONT.xxxl, fontWeight: '900', color: COLORS.textPrimary },
  heroCalGoal: { fontSize: FONT.sm, color: COLORS.textMuted, marginBottom: SPACING.sm },
  miniMacros: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  macroDot: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  macroDotCircle: { width: 6, height: 6, borderRadius: 3 },
  macroDotLabel: { fontSize: FONT.xs, color: COLORS.textSecondary, fontWeight: '600' },
  remaining: { fontSize: FONT.xs, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.sm },
  body: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, gap: SPACING.lg },
  quickRow: { flexDirection: 'row', gap: SPACING.sm },
  quickStat: { flex: 1, borderRadius: RADIUS.md, borderWidth: 1, alignItems: 'center', padding: SPACING.sm, overflow: 'hidden', gap: 2 },
  quickIcon: { fontSize: 18 },
  quickValue: { fontSize: FONT.md, fontWeight: '800' },
  quickLabel: { fontSize: 9, color: COLORS.textMuted, fontWeight: '700', textTransform: 'uppercase' },
  section: { gap: SPACING.sm },
  sectionTitle: { fontSize: FONT.md, fontWeight: '800', color: COLORS.textPrimary },
  sectionSub: { fontSize: FONT.xs, color: COLORS.textMuted, marginBottom: SPACING.sm },
  chart: { borderRadius: RADIUS.md, marginLeft: -SPACING.sm },
  pieRow: { flexDirection: 'row', alignItems: 'center' },
  macroLegend: { flex: 1, gap: SPACING.md },
  macroLegendItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  macroLegendDot: { width: 10, height: 10, borderRadius: 5 },
  macroLegendLabel: { fontSize: FONT.xs, color: COLORS.textMuted, fontWeight: '600' },
  macroLegendVal: { fontSize: FONT.md, fontWeight: '800' },
  mealRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle },
  mealDot: { width: 8, height: 8, borderRadius: 4 },
  mealInfo: { flex: 1 },
  mealName: { fontSize: FONT.sm, fontWeight: '700', color: COLORS.textPrimary },
  mealSub: { fontSize: FONT.xs, color: COLORS.textMuted, marginTop: 2 },
  mealCal: { fontSize: FONT.md, fontWeight: '800' },
  workoutRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm },
  workoutEmoji: { fontSize: 24 },
  workoutInfo: { flex: 1 },
  workoutName: { fontSize: FONT.sm, fontWeight: '700', color: COLORS.textPrimary },
  workoutSub: { fontSize: FONT.xs, color: COLORS.textMuted },
  workoutCal: { fontSize: FONT.sm, fontWeight: '700' },
  emptyText: { fontSize: FONT.sm, color: COLORS.textMuted, textAlign: 'center', paddingVertical: SPACING.xl },
});
