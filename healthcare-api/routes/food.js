// healthcare-api/routes/food.js
const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const FoodLog = require('../models/FoodLog');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

// All routes require auth
router.use(verifyToken);

// ─── GET /api/food?date=YYYY-MM-DD ───────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const logs = await FoodLog.find({ userId: req.userId, date }).sort({ createdAt: 1 });

    // Compute totals
    const totals = logs.reduce(
      (acc, l) => ({
        calories: acc.calories + l.calories,
        protein:  acc.protein  + l.protein,
        carbs:    acc.carbs    + l.carbs,
        fats:     acc.fats     + l.fats,
        fiber:    acc.fiber    + l.fiber,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }
    );

    // Calorie trend: last 7 days
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLogs = await FoodLog.find({ userId: req.userId, date: dateStr });
      const cal = dayLogs.reduce((s, l) => s + l.calories, 0);
      trend.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: dateStr,
        calories: Math.round(cal),
      });
    }

    res.json({ success: true, logs, totals, trend });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/food ───────────────────────────────────────────────────────────
router.post(
  '/',
  [
    body('mealType').isIn(['breakfast','lunch','dinner','snack']).withMessage('Invalid meal type'),
    body('foodName').notEmpty().withMessage('Food name required'),
    body('calories').isNumeric().withMessage('Calories must be a number'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const { mealType, foodName, calories, protein=0, carbs=0, fats=0, fiber=0, calcium=0, iron=0, magnesium=0, date } = req.body;

      const log = await FoodLog.create({
        userId: req.userId,
        mealType, foodName, calories, protein, carbs, fats, fiber, calcium, iron, magnesium,
        date: date || new Date().toISOString().split('T')[0],
      });

      // Award points for first food log badge
      await User.findByIdAndUpdate(req.userId, {
        $inc: { points: 10 },
        $set: { 'badges.$[el].earned': true },
      }, { arrayFilters: [{ 'el.id': 'first_log' }] });

      res.status(201).json({ success: true, log });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ─── DELETE /api/food/:id ─────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const log = await FoodLog.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!log) return res.status(404).json({ success: false, message: 'Log not found.' });
    res.json({ success: true, message: 'Food log deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
