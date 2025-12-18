import express from 'express';
import { joinEvent, leaveEvent, getEventAttendees } from '../controllers/rsvpController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/:id/join', protect, joinEvent);
router.post('/:id/leave', protect, leaveEvent);

router.get('/:id/attendees', getEventAttendees);

export default router;