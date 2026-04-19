// healthcare-api/models/WaterLog.js
const mongoose = require('mongoose');

const waterLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0.05 },  // litres
    date:   { type: String, required: true },              // YYYY-MM-DD
    time:   { type: String, default: () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) },
  },
  { timestamps: true }
);

waterLogSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('WaterLog', waterLogSchema);
