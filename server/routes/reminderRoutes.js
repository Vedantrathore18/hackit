import express from 'express';
import {
  generateReminderMessage,
  getPendingReminders,
} from '../controllers/reminderController.js';

const router = express.Router();

// POST /api/reminders/generate
router.post('/generate', generateReminderMessage);

// GET /api/reminders
router.get('/', getPendingReminders);

export default router;
