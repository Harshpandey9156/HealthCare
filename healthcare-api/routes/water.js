// healthcare-api/routes/water.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const WaterLog = require('../models/WaterLog');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// ─── GET /api/water?date=YYYY-MM-DD ───────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const logs = await WaterLog.find({ userId: req.userId, date }).sort({ createdAt: 1 });
    const total = logs.reduce((s, l) => s + l.amount, 0);
    const goal = req.user.waterGoal || 2.5;

    // Weekly trend
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLogs = await WaterLog.find({ userId: req.userId, date: dateStr });
      const dayTotal = dayLogs.reduce((s, l) => s + l.amount, 0);
      weeklyTrend.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: dateStr,
        amount: parseFloat(dayTotal.toFixed(2)),
        goal,
      });
    }

    res.json({ success: true, logs, total: parseFloat(total.toFixed(2)), goal, weeklyTrend });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/water ──────────────────────────────────────────────────────────
router.post(
  '/',
  [body('amount').isFloat({ min: 0.05 }).withMessage('Amount must be at least 0.05L')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const { amount, date } = req.body;
      const log = await WaterLog.create({
        userId: req.userId,
        amount: parseFloat(amount),
        date: date || new Date().toISOString().split('T')[0],
      });

      // Award 5 points
      await User.findByIdAndUpdate(req.userId, { $inc: { points: 5 } });

      res.status(201).json({ success: true, log });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;
