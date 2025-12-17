import { Event, User } from '../models/index.js';
import cloudinary from '../config/cloudinary.js';

export const createEvent = async (req, res, next) => {
  try {
    const { title, description, dateTime, location, capacity } = req.body;

    // Validation
    if (!title || !description || !dateTime || !location || !capacity) {
      // Delete uploaded image if validation fails
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.public_id);
      }
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, dateTime, location, capacity'
      });
    }

    if (capacity < 1) {
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.public_id);
      }
      return res.status(400).json({
        success: false,
        message: 'Capacity must be at least 1'
      });
    }

    // Check if dateTime is in future
    if (new Date(dateTime) < new Date()) {
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.public_id);
      }
      return res.status(400).json({
        success: false,
        message: 'Event date must be in the future'
      });
    }

    // Prepare event data
    const eventData = {
      title,
      description,
      dateTime,
      location,
      capacity: parseInt(capacity),
      createdBy: req.user.id,
      attendees: [req.user.id] // Creator is automatically an attendee
    };

    // Add image URL if uploaded to Cloudinary
    if (req.file) {
      eventData.image = req.file.secure_url; // Use secure_url from Cloudinary
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
    if (req.file) {
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
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.public_id);
      }
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check authorization
    if (event.createdBy.toString() !== req.user.id) {
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.public_id);
      }
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    // Validate capacity doesn't go below current attendee count
    if (capacity && parseInt(capacity) < event.attendees.length) {
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.public_id);
      }
      return res.status(400).json({
        success: false,
        message: `Capacity cannot be less than current attendee count (${event.attendees.length})`
      });
    }

    // Validate dateTime is in future
    if (dateTime && new Date(dateTime) < new Date()) {
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.public_id);
      }
      return res.status(400).json({
        success: false,
        message: 'Event date must be in the future'
      });
    }

    // Update fields
    if (title) event.title = title;
    if (description) event.description = description;
    if (dateTime) event.dateTime = dateTime;
    if (location) event.location = location;
    if (capacity) event.capacity = parseInt(capacity);

    // Handle image update
    if (req.file) {
      // Delete old image from Cloudinary if it exists
      if (event.image) {
        try {
          // Extract public_id from Cloudinary URL
          // URL format: https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[public_id]
          const urlParts = event.image.split('/');
          const publicId = urlParts[urlParts.length - 1].split('.')[0];
          const fullPublicId = `event-platform/events/${publicId}`;
          
          await cloudinary.uploader.destroy(fullPublicId);
        } catch (deleteError) {
          console.error('Error deleting old image from Cloudinary:', deleteError);
        }
      }
      // Set new image URL from Cloudinary
      event.image = req.file.secure_url;
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
    if (req.file) {
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

    // Delete image from Cloudinary if it exists
    if (event.image) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = event.image.split('/');
        const publicId = urlParts[urlParts.length - 1].split('.')[0];
        const fullPublicId = `event-platform/events/${publicId}`;
        
        await cloudinary.uploader.destroy(fullPublicId);
      } catch (deleteError) {
        console.error('Error deleting image from Cloudinary:', deleteError);
        // Continue with event deletion even if image deletion fails
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