import { Event } from '../models/index.js';

export const joinEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.attendees.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You have already RSVPed to this event'
      });
    }

    if (event.attendees.length >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: 'This event is at full capacity'
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        $addToSet: { attendees: userId }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedEvent.attendees.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Could not join event. Capacity may be full.'
      });
    }

    const populatedEvent = await Event.findById(id)
      .populate('createdBy', 'name email')
      .populate('attendees', 'name email');

    res.status(200).json({
      success: true,
      message: 'Successfully joined the event',
      event: populatedEvent
    });
  } catch (error) {
    next(error);
  }
};

export const leaveEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (!event.attendees.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You have not RSVPed to this event'
      });
    }

    if (event.createdBy.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Event creator cannot leave their own event'
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        $pull: { attendees: userId }
      },
      {
        new: true,
        runValidators: true
      }
    );

    const populatedEvent = await Event.findById(id)
      .populate('createdBy', 'name email')
      .populate('attendees', 'name email');

    res.status(200).json({
      success: true,
      message: 'Successfully left the event',
      event: populatedEvent
    });
  } catch (error) {
    next(error);
  }
};

export const getEventAttendees = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id).populate('attendees', 'name email');
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      attendeeCount: event.attendees.length,
      capacity: event.capacity,
      availableSpots: event.capacity - event.attendees.length,
      attendees: event.attendees
    });
  } catch (error) {
    next(error);
  }
};