// healthcare-api/models/WeightLog.js
const mongoose = require('mongoose');

const weightLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    weight: { type: Number, required: true, min: 20, max: 400 },  // kg
    bmi:    { type: Number, required: true, min: 10, max: 80 },
    date:   { type: String, required: true },  // YYYY-MM-DD
    note:   { type: String, default: '' },
  },
  { timestamps: true }
);

weightLogSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('WeightLog', weightLogSchema);
