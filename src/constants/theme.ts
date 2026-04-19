// src/constants/theme.ts
export const COLORS = {
  // Brand
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  primarySubtle: '#1E1B4B',

  // Accents
  green: '#10B981',
  greenSubtle: '#022C22',
  orange: '#F59E0B',
  orangeSubtle: '#2D1A00',
  red: '#EF4444',
  redSubtle: '#2D0F0F',
  blue: '#3B82F6',
  blueSubtle: '#0C1A3A',
  purple: '#8B5CF6',
  pink: '#EC4899',
  cyan: '#06B6D4',
  yellow: '#FBBF24',

  // Backgrounds (dark)
  bg: '#0A0A0F',
  bgSecondary: '#0F0F1A',
  card: '#13131F',
  cardHover: '#1A1A2E',
  surface: '#1E1E32',

  // Text
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#475569',

  // Border
  border: '#1E1E32',
  borderSubtle: '#16162A',

  // Meal types
  breakfast: '#F59E0B',
  lunch: '#10B981',
  snack: '#6366F1',
  dinner: '#EF4444',

  // Workout types
  strength: '#6366F1',
  cardio: '#EF4444',
  yoga: '#10B981',
  hiit: '#F59E0B',
  cycling: '#3B82F6',
  swimming: '#06B6D4',
  walking: '#8B5CF6',
  rest: '#475569',
};

export const GRADIENTS = {
  primary: ['#6366F1', '#818CF8'],
  hero: ['#0F0F1F', '#1A0A2E', '#0A1628'],
  card: ['#13131F', '#1A1A2E'],
  green: ['#10B981', '#34D399'],
  orange: ['#F59E0B', '#FBBF24'],
  red: ['#EF4444', '#F87171'],
  blue: ['#3B82F6', '#60A5FA'],
  purple: ['#8B5CF6', '#A78BFA'],
  brand: ['#6366F1', '#EC4899', '#F59E0B'],
};

export const SPACING = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32,
};

export const RADIUS = {
  sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, full: 999,
};

export const FONT = {
  xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 24, xxxl: 30, display: 36,
};

export const SHADOW = {
  sm: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 3,
  },
  md: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  lg: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 16, elevation: 10,
  },
};

export const MEAL_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  breakfast: { label: 'Breakfast', emoji: '☀️', color: COLORS.breakfast },
  lunch: { label: 'Lunch', emoji: '🌤️', color: COLORS.lunch },
  snack: { label: 'Snack', emoji: '🍎', color: COLORS.snack },
  dinner: { label: 'Dinner', emoji: '🌙', color: COLORS.dinner },
};

export const WORKOUT_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  strength: { label: 'Strength', emoji: '🏋️', color: COLORS.strength },
  cardio: { label: 'Cardio', emoji: '🏃', color: COLORS.cardio },
  yoga: { label: 'Yoga', emoji: '🧘', color: COLORS.yoga },
  hiit: { label: 'HIIT', emoji: '⚡', color: COLORS.hiit },
  cycling: { label: 'Cycling', emoji: '🚴', color: COLORS.cycling },
  swimming: { label: 'Swimming', emoji: '🏊', color: COLORS.swimming },
  walking: { label: 'Walking', emoji: '🚶', color: COLORS.walking },
  rest: { label: 'Rest', emoji: '🛌', color: COLORS.rest },
};
