// src/components/ui/StatCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, FONT, SPACING } from '../../constants/theme';
import { ProgressBar } from './ProgressBar';

interface StatCardProps {
  icon: string;
  label: string;
  value: number | string;
  unit: string;
  max?: number;
  color: string;
  gradient?: string[];
}

export const StatCard: React.FC<StatCardProps> = ({ icon, label, value, unit, max, color, gradient }) => {
  const numVal = typeof value === 'string' ? parseFloat(value) : value;
  const pct = max ? Math.round((numVal / max) * 100) : null;

  return (
    <View style={[styles.card, { borderColor: `${color}30` }]}>
      <LinearGradient colors={gradient || [`${color}15`, `${color}05`] as [string, string]}
        style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      <View style={styles.content}>
        <View style={[styles.iconBox, { backgroundColor: `${color}20` }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.valueRow}>
            <Text style={[styles.value, { color }]}>{typeof value === 'number' ? Math.round(numVal) : value}</Text>
            <Text style={styles.unit}> {unit}</Text>
          </View>
          {max && pct !== null && (
            <>
              <ProgressBar value={numVal} max={max} color={color} height={5} style={{ marginTop: SPACING.sm }} />
              <Text style={[styles.pct, { color }]}>{pct}% of goal</Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
  },
  content: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.lg,
  },
  iconBox: {
    width: 44, height: 44, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  icon: { fontSize: 22 },
  info: { flex: 1 },
  label: { fontSize: FONT.sm, color: COLORS.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  valueRow: { flexDirection: 'row', alignItems: 'baseline' },
  value: { fontSize: FONT.xxl, fontWeight: '800' },
  unit: { fontSize: FONT.sm, color: COLORS.textMuted },
  pct: { fontSize: FONT.xs, fontWeight: '600', marginTop: 4 },
});
