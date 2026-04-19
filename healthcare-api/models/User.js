// healthcare-api/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never return password in queries
    },
    avatar: { type: String, default: null },
    age: { type: Number, default: 25, min: 10, max: 120 },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
    height: { type: Number, default: 170 },         // cm
    weight: { type: Number, default: 70 },           // kg
    targetWeight: { type: Number, default: 65 },     // kg
    calorieGoal: { type: Number, default: 2000 },    // kcal/day
    waterGoal: { type: Number, default: 2.5 },       // litres/day
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      default: 'moderate',
    },
    isPremium: { type: Boolean, default: false },
    points: { type: Number, default: 0 },
    referralCode: { type: String, unique: true },
    theme: { type: String, enum: ['dark', 'light', 'system'], default: 'system' },
    // Streaks stored as embedded doc for simplicity
    streaks: {
      overall:  { current: { type: Number, default: 0 }, longest: { type: Number, default: 0 } },
      food:     { current: { type: Number, default: 0 }, longest: { type: Number, default: 0 } },
      workout:  { current: { type: Number, default: 0 }, longest: { type: Number, default: 0 } },
      water:    { current: { type: Number, default: 0 }, longest: { type: Number, default: 0 } },
    },
    badges: [
      {
        id:     { type: String },
        label:  { type: String },
        emoji:  { type: String },
        earned: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

// ─── Hash password before saving ─────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Generate unique referral code ───────────────────────────────────────────
userSchema.pre('save', function (next) {
  if (!this.referralCode) {
    this.referralCode = this.name.split(' ')[0].toUpperCase() + Date.now().toString(36).toUpperCase();
  }
  next();
});

// ─── Default badges on new user ──────────────────────────────────────────────
userSchema.pre('save', function (next) {
  if (this.isNew && this.badges.length === 0) {
    this.badges = [
      { id: 'first_log',        label: 'First Step',     emoji: '🌱', earned: false },
      { id: 'week_streak',      label: 'Week Warrior',   emoji: '🔥', earned: false },
      { id: 'hydration_hero',   label: 'Hydration Hero', emoji: '💧', earned: false },
      { id: 'workout_beast',    label: 'Workout Beast',  emoji: '🏋️', earned: false },
      { id: 'century',          label: 'Century Club',   emoji: '💯', earned: false },
      { id: 'consistent',       label: 'Consistent',     emoji: '⭐', earned: false },
    ];
  }
  next();
});

// ─── Compare password method ─────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
