// healthcare-api/routes/user.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const FoodLog = require('../models/FoodLog');
const WorkoutLog = require('../models/WorkoutLog');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// ─── GET /api/user/profile ────────────────────────────────────────────────────
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Global leaderboard (top 10 by points)
    const leaderboard = await User.find({})
      .select('name points streaks.overall.current')
      .sort({ points: -1 })
      .limit(10);

    const leaderboardFormatted = leaderboard.map((u, i) => ({
      rank: i + 1,
      name: u.name,
      points: u.points,
      streak: u.streaks?.overall?.current || 0,
      avatar: null,
      isCurrentUser: u._id.toString() === req.userId,
    }));

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        targetWeight: user.targetWeight,
        calorieGoal: user.calorieGoal,
        waterGoal: user.waterGoal,
        activityLevel: user.activityLevel,
        isPremium: user.isPremium,
        points: user.points,
        referralCode: user.referralCode,
        theme: user.theme,
        streaks: user.streaks,
        badges: user.badges,
        joinedAt: user.createdAt,
      },
      leaderboard: leaderboardFormatted,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PATCH /api/user/profile ──────────────────────────────────────────────────
router.patch(
  '/profile',
  [
    body('name').optional().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 chars'),
    body('age').optional().isInt({ min: 10, max: 120 }).withMessage('Age must be 10-120'),
    body('height').optional().isFloat({ min: 50, max: 300 }).withMessage('Height must be 50-300 cm'),
    body('weight').optional().isFloat({ min: 20, max: 400 }).withMessage('Weight must be 20-400 kg'),
    body('calorieGoal').optional().isInt({ min: 500, max: 10000 }).withMessage('Calorie goal must be 500-10000'),
    body('waterGoal').optional().isFloat({ min: 0.5, max: 10 }).withMessage('Water goal must be 0.5-10 L'),
    body('theme').optional().isIn(['dark', 'light', 'system']).withMessage('Theme must be dark, light, or system'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const allowedFields = ['name', 'age', 'gender', 'height', 'weight', 'targetWeight', 'calorieGoal', 'waterGoal', 'activityLevel', 'theme', 'avatar'];
      const updates = {};
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
      });

      const user = await User.findByIdAndUpdate(req.userId, updates, { new: true, runValidators: true });
      res.json({ success: true, message: 'Profile updated!', user });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;
