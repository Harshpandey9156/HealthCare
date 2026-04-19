# VitalTrack Mobile — React Native App

A production-grade **Health & Fitness Tracking** app built with **Expo + React Native** for Android and iOS.
Uses **dummy JSON data** — no backend required. Just run and see the full UI.

---

## 📁 Folder Structure

```
healthcare-rn/
├── App.tsx                     # Root app with bottom tab navigation
├── src/
│   ├── screens/
│   │   ├── DashboardScreen.tsx # Home with charts & stats
│   │   ├── FoodScreen.tsx      # Food logging + micronutrients
│   │   ├── WorkoutScreen.tsx   # Workout logger + weekly plan
│   │   ├── WaterScreen.tsx     # Hydration tracker with bottle UI
│   │   └── ProfileScreen.tsx   # Profile, streaks, leaderboard, AI
│   ├── components/ui/
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── ProgressBar.tsx
│   │   └── StatCard.tsx
│   ├── store/
│   │   └── useAppStore.ts      # Zustand global state (loads from JSON)
│   ├── constants/
│   │   └── theme.ts            # Colors, spacing, gradients, config
│   └── data/                   # Dummy JSON files (replace with API later)
│       ├── user.json
│       ├── food.json
│       ├── workout.json
│       ├── water.json
│       └── weight.json
```

---

## 🚀 Quick Start

```bash
cd healthcare-rn
npm install

# Run on Android emulator / physical device
npm run android

# Run on iOS simulator (macOS only)
npm run ios

# Run on web browser (for UI review)
npx expo start --web
```

### Scan QR Code (Physical Device)
```bash
npx expo start
# Scan QR code with Expo Go app (Android/iOS)
```

---

## 📱 Screens

| Screen | Features |
|--------|---------|
| 🏠 **Dashboard** | Calorie ring, 7-day line chart, macro pie, meal list, workout list |
| 🍽️ **Food** | Meal groups, food database search, manual entry, micronutrients (Premium) |
| 🏋️ **Workout** | Workout logs, weekly bar chart, activity planner, intensity tracking |
| 💧 **Water** | Animated bottle, quick-add, milestones, weekly trend bars |
| 👤 **Profile** | Health stats, streaks, leaderboard, badges, referral, AI scaffolding |

---

## 🗄️ Dummy Data (→ Replace with Real API)

All data is in `src/data/*.json`. When you build the backend:

1. Replace `useAppStore.ts` imports with actual API calls
2. Keep the same TypeScript interfaces
3. The store already has `add*` and `remove*` actions ready

---

## 🔮 Connect Your Backend

In `src/store/useAppStore.ts`, replace the JSON imports with:

```ts
// Instead of:
import foodData from '../data/food.json';

// Use your API:
const foodData = await fetch('https://your-api.com/api/food?date=today')
  .then(r => r.json());
```

---

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `expo` | Cross-platform React Native framework |
| `@react-navigation/bottom-tabs` | Tab navigation |
| `react-native-chart-kit` | Line, Bar, Pie charts |
| `expo-linear-gradient` | Beautiful gradient effects |
| `zustand` | Global state management |
| `react-native-safe-area-context` | Safe area handling |
