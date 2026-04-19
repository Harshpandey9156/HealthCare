// src/components/ui/Badge.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { RADIUS, FONT } from '../../constants/theme';

interface BadgeProps {
  label: string;
  color: string;
  bgColor?: string;
  style?: ViewStyle;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ label, color, bgColor, style, size = 'md' }) => (
  <View style={[
    styles.badge,
    { backgroundColor: bgColor || `${color}25`, borderColor: `${color}40` },
    size === 'sm' && styles.sm,
    style,
  ]}>
    <Text style={[styles.text, { color }, size === 'sm' && styles.textSm]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 999, borderWidth: 1, alignSelf: 'flex-start',
  },
  sm: { paddingHorizontal: 8, paddingVertical: 2 },
  text: { fontSize: FONT.sm, fontWeight: '700' },
  textSm: { fontSize: FONT.xs },
});
