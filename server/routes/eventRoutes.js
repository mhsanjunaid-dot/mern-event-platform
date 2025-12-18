import express from 'express';
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent
} from '../controllers/eventController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Protected routes - multer.single('image') parses FormData and populates req.file + req.body
router.post('/', protect, upload.fields([{ name: 'image', maxCount: 1 }]), createEvent);
router.put('/:id', protect, upload.fields([{ name: 'image', maxCount: 1 }]), updateEvent);
router.delete('/:id', protect, deleteEvent);

export default router;