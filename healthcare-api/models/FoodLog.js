// healthcare-api/models/FoodLog.js
const mongoose = require('mongoose');

const foodLogSchema = new mongoose.Schema(
  {
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], required: true },
    foodName: { type: String, required: true, trim: true },
    calories: { type: Number, required: true, min: 0 },
    protein:  { type: Number, default: 0, min: 0 },
    carbs:    { type: Number, default: 0, min: 0 },
    fats:     { type: Number, default: 0, min: 0 },
    fiber:    { type: Number, default: 0, min: 0 },
    calcium:  { type: Number, default: 0 },
    iron:     { type: Number, default: 0 },
    magnesium:{ type: Number, default: 0 },
    date:     { type: String, required: true }, // YYYY-MM-DD
    time:     { type: String, default: () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) },
  },
  { timestamps: true }
);

// Compound index for fast daily queries
foodLogSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('FoodLog', foodLogSchema);
