// healthcare-api/routes/workout.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const WorkoutLog = require('../models/WorkoutLog');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

const WORKOUT_EMOJIS = {
  strength: '🏋️', cardio: '🏃', yoga: '🧘', hiit: '⚡',
  cycling: '🚴', swimming: '🏊', walking: '🚶', rest: '🛌',
};

// ─── GET /api/workout?date=YYYY-MM-DD ─────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const logs = await WorkoutLog.find({ userId: req.userId, date }).sort({ createdAt: -1 });

    // Weekly minutes (last 7 days)
    const weeklyMinutes = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLogs = await WorkoutLog.find({ userId: req.userId, date: dateStr });
      const mins = dayLogs.reduce((s, l) => s + l.duration, 0);
      weeklyMinutes.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: dateStr,
        minutes: mins,
      });
    }

    // All logs for history
    const allLogs = await WorkoutLog.find({ userId: req.userId }).sort({ date: -1 }).limit(30);

    res.json({ success: true, logs, allLogs, weeklyMinutes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/workout ────────────────────────────────────────────────────────
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Workout name required'),
    body('workoutType').isIn(['strength','cardio','yoga','hiit','cycling','swimming','walking','rest']).withMessage('Invalid workout type'),
    body('duration').isNumeric().withMessage('Duration must be a number'),
    body('caloriesBurned').isNumeric().withMessage('caloriesBurned must be a number'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const { name, workoutType, duration, caloriesBurned, intensity = 'moderate', date, notes = '' } = req.body;

      const log = await WorkoutLog.create({
        userId: req.userId,
        name, workoutType, duration, caloriesBurned, intensity,
        emoji: WORKOUT_EMOJIS[workoutType] || '🏋️',
        date: date || new Date().toISOString().split('T')[0],
        notes,
      });

      // Award 25 points per workout
      await User.findByIdAndUpdate(req.userId, { $inc: { points: 25 } });

      res.status(201).json({ success: true, log });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ─── DELETE /api/workout/:id ──────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const log = await WorkoutLog.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!log) return res.status(404).json({ success: false, message: 'Log not found.' });
    res.json({ success: true, message: 'Workout log deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
