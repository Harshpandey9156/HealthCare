// healthcare-api/routes/weight.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const WeightLog = require('../models/WeightLog');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// ─── GET /api/weight ──────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const logs = await WeightLog.find({ userId: req.userId }).sort({ date: -1 }).limit(30);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/weight ─────────────────────────────────────────────────────────
router.post(
  '/',
  [
    body('weight').isFloat({ min: 20, max: 400 }).withMessage('Weight must be between 20 and 400 kg'),
    body('bmi').isFloat({ min: 10, max: 80 }).withMessage('BMI must be between 10 and 80'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const { weight, bmi, date, note } = req.body;
      const log = await WeightLog.create({
        userId: req.userId,
        weight: parseFloat(weight),
        bmi: parseFloat(bmi),
        date: date || new Date().toISOString().split('T')[0],
        note: note || '',
      });

      res.status(201).json({ success: true, log });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;
