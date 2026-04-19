// healthcare-api/models/WorkoutLog.js
const mongoose = require('mongoose');

const workoutLogSchema = new mongoose.Schema(
  {
    userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name:           { type: String, required: true, trim: true },
    workoutType:    { type: String, enum: ['strength','cardio','yoga','hiit','cycling','swimming','walking','rest'], required: true },
    duration:       { type: Number, required: true, min: 1 },   // minutes
    caloriesBurned: { type: Number, required: true, min: 0 },
    intensity:      { type: String, enum: ['low','moderate','high'], default: 'moderate' },
    emoji:          { type: String, default: '🏋️' },
    date:           { type: String, required: true },            // YYYY-MM-DD
    notes:          { type: String, default: '' },
  },
  { timestamps: true }
);

workoutLogSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('WorkoutLog', workoutLogSchema);
