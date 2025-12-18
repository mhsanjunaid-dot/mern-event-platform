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
    imagePublicId: {
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

eventSchema.index({ createdBy: 1 });
eventSchema.index({ dateTime: 1 });
eventSchema.index({ attendees: 1 });

eventSchema.virtual('attendeeCount').get(function () {
  return this.attendees.length;
});

eventSchema.virtual('availableSpots').get(function () {
  return this.capacity - this.attendees.length;
});

eventSchema.set('toJSON', { virtuals: true });

const Event = mongoose.model('Event', eventSchema);

export default Event;