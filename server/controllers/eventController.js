import { Event, User } from '../models/index.js';
import { uploadImage, deleteImage } from '../middleware/imageStorage.js';

export const createEvent = async (req, res, next) => {
  try {
    // Extract text fields from req.body (populated by multer)
    const { title, description, dateTime, location, capacity } = req.body;

    // Validation
    if (!title || !description || !dateTime || !location || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, dateTime, location, capacity'
      });
    }

    if (isNaN(capacity) || capacity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Capacity must be at least 1'
      });
    }

    // Check if dateTime is in future
    const eventDateTime = new Date(dateTime);
    if (isNaN(eventDateTime.getTime()) || eventDateTime < new Date()) {
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

    // Upload image if file was provided
    if (req.file) {
      try {
        const imageData = await uploadImage(req.file);
        eventData.image = imageData.url;
        eventData.imagePublicId = imageData.publicId;
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image',
          error: uploadError.message
        });
      }
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
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check authorization
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    // Validate capacity doesn't go below current attendee count
    if (capacity && parseInt(capacity, 10) < event.attendees.length) {
      return res.status(400).json({
        success: false,
        message: `Capacity cannot be less than current attendee count (${event.attendees.length})`
      });
    }

    // Validate dateTime is in future
    if (dateTime) {
      const newDateTime = new Date(dateTime);
      if (isNaN(newDateTime.getTime()) || newDateTime < new Date()) {
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
      try {
        // Delete old image if it exists
        if (event.imagePublicId) {
          await deleteImage(event.imagePublicId);
        }

        // Upload new image
        const imageData = await uploadImage(req.file);
        event.image = imageData.url;
        event.imagePublicId = imageData.publicId;
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image',
          error: uploadError.message
        });
      }
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

    // Delete image if it exists
    if (event.imagePublicId) {
      await deleteImage(event.imagePublicId);
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
