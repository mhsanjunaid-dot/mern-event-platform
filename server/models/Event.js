import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    dateTime: {
      type: Date,
      required: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    capacity: {
      type: Number,
      required: true,
      min: 1
    },
    image: {
      type: String,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  { timestamps: true }
);

// Index for faster queries
eventSchema.index({ createdBy: 1 });
eventSchema.index({ dateTime: 1 });
eventSchema.index({ attendees: 1 });

// Virtual for attendee count
eventSchema.virtual('attendeeCount').get(function () {
  return this.attendees.length;
});

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function () {
  return this.capacity - this.attendees.length;
});

// Ensure virtuals are included in JSON output
eventSchema.set('toJSON', { virtuals: true });

const Event = mongoose.model('Event', eventSchema);

export default Event;