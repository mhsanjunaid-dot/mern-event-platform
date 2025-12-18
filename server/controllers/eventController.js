import { Event, User } from '../models/index.js';
import fs from 'fs';

export const createEvent = async (req, res, next) => {
  try {
    // Extract text fields from req.body (populated by multer)
    const { title, description, dateTime, location, capacity } = req.body;

    // Validation
    if (!title || !description || !dateTime || !location || !capacity) {
      // Delete uploaded image if validation fails
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (deleteError) {
          console.error('Error deleting image:', deleteError);
        }
      }
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, dateTime, location, capacity'
      });
    }

    if (isNaN(capacity) || capacity < 1) {
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (deleteError) {
          console.error('Error deleting image:', deleteError);
        }
      }
      return res.status(400).json({
        success: false,
        message: 'Capacity must be at least 1'
      });
    }

    // Check if dateTime is in future
    const eventDateTime = new Date(dateTime);
    if (isNaN(eventDateTime.getTime()) || eventDateTime < new Date()) {
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (deleteError) {
          console.error('Error deleting image:', deleteError);
        }
      }
      return res.status(400).json({
        success: false,
        message: 'Event date must be valid and in the future'
      });
    }

    // Prepare event data
    const eventData = {
      title: title.trim(),
      description: description.trim(),
      dateTime: eventDateTime,
      location: location.trim(),
      capacity: parseInt(capacity, 10),
      createdBy: req.user.id,
      attendees: [req.user.id] // Creator is automatically an attendee
    };

    // Add image URL if file was uploaded
    if (req.file) {
      eventData.image = `/uploads/${req.file.filename}`;
    }

    const event = await Event.create(eventData);

    // Populate createdBy before sending response
    await event.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    // Delete uploaded image if event creation fails
    if (req.file && req.file.public_id) {
      try {
        await cloudinary.uploader.destroy(req.file.public_id);
      } catch (deleteError) {
        console.error('Error deleting image from Cloudinary:', deleteError);
      }
    }
    next(error);
  }
};

export const getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'name email')
      .populate('attendees', 'name email')
      .sort({ dateTime: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id)
      .populate('createdBy', 'name email')
      .populate('attendees', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, dateTime, location, capacity } = req.body;

    // Find event
    let event = await Event.findById(id);
    if (!event) {
      if (req.file && req.file.public_id) {
        try {
          await cloudinary.uploader.destroy(req.file.public_id);
        } catch (deleteError) {
          console.error('Error deleting image from Cloudinary:', deleteError);
        }
      }
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check authorization
    if (event.createdBy.toString() !== req.user.id) {
      if (req.file && req.file.public_id) {
        try {
          await cloudinary.uploader.destroy(req.file.public_id);
        } catch (deleteError) {
          console.error('Error deleting image from Cloudinary:', deleteError);
        }
      }
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    // Validate capacity doesn't go below current attendee count
    if (capacity && parseInt(capacity, 10) < event.attendees.length) {
      if (req.file && req.file.public_id) {
        try {
          await cloudinary.uploader.destroy(req.file.public_id);
        } catch (deleteError) {
          console.error('Error deleting image from Cloudinary:', deleteError);
        }
      }
      return res.status(400).json({
        success: false,
        message: `Capacity cannot be less than current attendee count (${event.attendees.length})`
      });
    }

    // Validate dateTime is in future
    if (dateTime) {
      const newDateTime = new Date(dateTime);
      if (isNaN(newDateTime.getTime()) || newDateTime < new Date()) {
        if (req.file && req.file.public_id) {
          try {
            await cloudinary.uploader.destroy(req.file.public_id);
          } catch (deleteError) {
            console.error('Error deleting image from Cloudinary:', deleteError);
          }
        }
        return res.status(400).json({
          success: false,
          message: 'Event date must be valid and in the future'
        });
      }
      event.dateTime = newDateTime;
    }

    // Update fields
    if (title) event.title = title.trim();
    if (description) event.description = description.trim();
    if (location) event.location = location.trim();
    if (capacity) event.capacity = parseInt(capacity, 10);

    // Handle image update
    if (req.file) {
      // Delete old image file if it exists
      if (event.image) {
        try {
          const fs = await import('fs');
          const filePath = `server/uploads/${event.image.split('/').pop()}`;
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (deleteError) {
          console.error('Error deleting old image:', deleteError);
        }
      }
      // Set new image URL
      event.image = `/uploads/${req.file.filename}`;
    }

    event = await event.save();
    await event.populate('createdBy', 'name email');
    await event.populate('attendees', 'name email');

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    // Delete uploaded image if update fails
    if (req.file && req.file.public_id) {
      try {
        await cloudinary.uploader.destroy(req.file.public_id);
      } catch (deleteError) {
        console.error('Error deleting image from Cloudinary:', deleteError);
      }
    }
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check authorization
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    // Delete image file if it exists
    if (event.image) {
      try {
        const fs = await import('fs');
        const filePath = `server/uploads/${event.image.split('/').pop()}`;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (deleteError) {
        console.error('Error deleting image:', deleteError);
      }
    }

    await Event.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
