import express from 'express';
import { joinEvent, leaveEvent, getEventAttendees } from '../controllers/rsvpController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protected routes (user must be authenticated)
router.post('/:id/join', protect, joinEvent);
router.post('/:id/leave', protect, leaveEvent);

// Public route (anyone can view attendees)
router.get('/:id/attendees', getEventAttendees);

export default router;