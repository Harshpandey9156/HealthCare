// src/components/ui/Card.tsx
import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SHADOW } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  padding?: number;
}

export const Card: React.FC<CardProps> = ({ children, style, elevated = false, padding = 16 }) => (
  <View style={[styles.card, elevated && styles.elevated, { padding }, style]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  elevated: {
    ...SHADOW.md,
  },
});
