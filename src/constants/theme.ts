// src/constants/theme.ts

// ─── Dark Palette ─────────────────────────────────────────────────────────────
export const DARK_COLORS = {
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  primarySubtle: '#1E1B4B',

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

  bg: '#0A0A0F',
  bgSecondary: '#0F0F1A',
  card: '#13131F',
  cardHover: '#1A1A2E',
  surface: '#1E1E32',

  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#475569',

  border: '#1E1E32',
  borderSubtle: '#16162A',

  breakfast: '#F59E0B',
  lunch: '#10B981',
  snack: '#6366F1',
  dinner: '#EF4444',

  strength: '#6366F1',
  cardio: '#EF4444',
  yoga: '#10B981',
  hiit: '#F59E0B',
  cycling: '#3B82F6',
  swimming: '#06B6D4',
  walking: '#8B5CF6',
  rest: '#475569',

  inputBg: '#13131F',
  inputBorder: '#2E2E4A',
  placeholder: '#475569',

  statusBar: 'light' as 'light' | 'dark',
};

// ─── Light Palette ────────────────────────────────────────────────────────────
export const LIGHT_COLORS = {
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  primarySubtle: '#EEF2FF',

  green: '#059669',
  greenSubtle: '#ECFDF5',
  orange: '#D97706',
  orangeSubtle: '#FFFBEB',
  red: '#DC2626',
  redSubtle: '#FEF2F2',
  blue: '#2563EB',
  blueSubtle: '#EFF6FF',
  purple: '#7C3AED',
  pink: '#DB2777',
  cyan: '#0891B2',
  yellow: '#D97706',

  bg: '#F8FAFC',
  bgSecondary: '#F1F5F9',
  card: '#FFFFFF',
  cardHover: '#F8FAFC',
  surface: '#F1F5F9',

  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',

  border: '#E2E8F0',
  borderSubtle: '#F1F5F9',

  breakfast: '#D97706',
  lunch: '#059669',
  snack: '#6366F1',
  dinner: '#DC2626',

  strength: '#6366F1',
  cardio: '#DC2626',
  yoga: '#059669',
  hiit: '#D97706',
  cycling: '#2563EB',
  swimming: '#0891B2',
  walking: '#7C3AED',
  rest: '#94A3B8',

  inputBg: '#FFFFFF',
  inputBorder: '#E2E8F0',
  placeholder: '#94A3B8',

  statusBar: 'dark' as 'light' | 'dark',
};

// Default export (legacy — screens that don't use useTheme() fall back to dark)
export const COLORS = DARK_COLORS;

// Returns colors for the given mode
export function getThemeColors(mode: 'dark' | 'light') {
  return mode === 'dark' ? DARK_COLORS : LIGHT_COLORS;
}

// ─── Gradient definitions (string[] so dark/light are interchangeable) ────────
export interface GradientPalette {
  primary: string[];
  hero:    string[];
  card:    string[];
  green:   string[];
  orange:  string[];
  red:     string[];
  blue:    string[];
  purple:  string[];
  brand:   string[];
}

export const DARK_GRADIENTS: GradientPalette = {
  primary: ['#6366F1', '#818CF8'],
  hero:    ['#0F0F1F', '#1A0A2E', '#0A1628'],
  card:    ['#13131F', '#1A1A2E'],
  green:   ['#10B981', '#34D399'],
  orange:  ['#F59E0B', '#FBBF24'],
  red:     ['#EF4444', '#F87171'],
  blue:    ['#3B82F6', '#60A5FA'],
  purple:  ['#8B5CF6', '#A78BFA'],
  brand:   ['#6366F1', '#EC4899', '#F59E0B'],
};

export const LIGHT_GRADIENTS: GradientPalette = {
  primary: ['#6366F1', '#818CF8'],
  hero:    ['#EEF2FF', '#F5F3FF', '#EFF6FF'],
  card:    ['#FFFFFF', '#F8FAFC'],
  green:   ['#059669', '#34D399'],
  orange:  ['#D97706', '#FBBF24'],
  red:     ['#DC2626', '#F87171'],
  blue:    ['#2563EB', '#60A5FA'],
  purple:  ['#7C3AED', '#A78BFA'],
  brand:   ['#6366F1', '#EC4899', '#F59E0B'],
};

export const GRADIENTS = DARK_GRADIENTS;

// ─── Spacing & Typography (theme-neutral) ─────────────────────────────────────
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
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4,  elevation: 3  },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8,  elevation: 6  },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.16, shadowRadius: 16, elevation: 10 },
};

export const MEAL_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  breakfast: { label: 'Breakfast', emoji: '☀️',  color: DARK_COLORS.breakfast },
  lunch:     { label: 'Lunch',     emoji: '🌤️', color: DARK_COLORS.lunch },
  snack:     { label: 'Snack',     emoji: '🍎',  color: DARK_COLORS.snack },
  dinner:    { label: 'Dinner',    emoji: '🌙',  color: DARK_COLORS.dinner },
};

export const WORKOUT_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  strength: { label: 'Strength', emoji: '🏋️', color: DARK_COLORS.strength },
  cardio:   { label: 'Cardio',   emoji: '🏃',  color: DARK_COLORS.cardio },
  yoga:     { label: 'Yoga',     emoji: '🧘',  color: DARK_COLORS.yoga },
  hiit:     { label: 'HIIT',     emoji: '⚡',  color: DARK_COLORS.hiit },
  cycling:  { label: 'Cycling',  emoji: '🚴',  color: DARK_COLORS.cycling },
  swimming: { label: 'Swimming', emoji: '🏊',  color: DARK_COLORS.swimming },
  walking:  { label: 'Walking',  emoji: '🚶',  color: DARK_COLORS.walking },
  rest:     { label: 'Rest',     emoji: '🛌',  color: DARK_COLORS.rest },
};
