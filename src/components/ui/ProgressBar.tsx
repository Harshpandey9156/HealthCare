// src/components/ui/ProgressBar.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS } from '../../constants/theme';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  height?: number;
  style?: ViewStyle;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value, max, color = COLORS.primary, height = 8, style,
}) => {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <View style={[styles.track, { height }, style]}>
      <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color, height }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: RADIUS.full,
  },
});
