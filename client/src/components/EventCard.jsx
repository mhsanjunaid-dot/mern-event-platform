import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { rsvpService } from '../services/rsvpService';  // Use RSVP service for joining/leaving
import '../styles/event-card.css';

const EventCard = ({
  event,
  user,
  onRsvpSuccess,
  onRsvpError,
  onEventDeleted,
  rsvpLoading,
  setRsvpLoading
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isEventCreator = user && event.createdBy._id === user.id;
  const isUserAttending = user && event.attendees.includes(user.id);
  const isFull = event.attendees.length >= event.capacity;
  const spotsTaken = event.attendees.length;
  const spotsRemaining = event.capacity - spotsTaken;

  const eventDate = new Date(event.dateTime);
  const isEventPast = eventDate < new Date();

  const handleJoinEvent = async () => {
  if (!user) {
    onRsvpError('Please login to RSVP to events');
    return;
  }

  try {
    setRsvpLoading(event._id, true);
    await rsvpService.joinEvent(event._id);  // Use rsvpService
    onRsvpSuccess(event._id, `Successfully joined "${event.title}"!`);
  } catch (err) {
    onRsvpError(err.response?.data?.message || 'Failed to join event');
  } finally {
    setRsvpLoading(event._id, false);
  }
};

const handleLeaveEvent = async () => {
  try {
    setRsvpLoading(event._id, true);
    await rsvpService.leaveEvent(event._id);  // Use rsvpService
    onRsvpSuccess(event._id, `Left "${event.title}"`);
  } catch (err) {
    onRsvpError(err.response?.data?.message || 'Failed to leave event');
  } finally {
    setRsvpLoading(event._id, false);
  }
};
  const handleDeleteEvent = async () => {
    // Verify user is the event creator (client-side check)
    if (!isEventCreator) {
      onRsvpError('You are not authorized to delete this event. Only the event creator can delete it.');
      setShowDeleteConfirm(false);
      return;
    }

    try {
      setDeleteLoading(true);
      await eventService.deleteEvent(event._id);
      onEventDeleted();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete event';
      onRsvpError(errorMessage);
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const getImageUrl = () => {
    if (!event.image) return null;
    
    // If it's already a full URL (Cloudinary), use it directly
    if (event.image.startsWith('http')) {
      return event.image;
    }
    
    // If it's a local path, prepend the server URL
    if (event.image.startsWith('/')) {
      return `http://localhost:5001${event.image}`;
    }
    
    return event.image;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className={`event-card ${isEventPast ? 'event-past' : ''}`}>
      {/* Image Section */}
      <div className="event-card-image-container">
        {event.image ? (
          <img 
           src={getImageUrl()}
           alt={event.title}
          />

        ) : (
          <div className="event-card-image-placeholder">
            <span className="placeholder-icon">🎉</span>
          </div>
        )}
        {isFull && <div className="event-badge">FULL</div>}
        {isEventPast && <div className="event-badge event-badge-past">PAST</div>}
        {isEventCreator && (
          <div className="event-badge event-badge-creator">ORGANIZER</div>
        )}
      </div>

      {/* Content Section */}
      <div className="event-card-content">
        <h3 className="event-card-title">{event.title}</h3>

        <p className="event-card-description">{event.description}</p>

        {/* Event Details */}
        <div className="event-card-details">
          <div className="detail-item">
            <span className="detail-icon">📅</span>
            <span className="detail-text">{formatDate(eventDate)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">⏰</span>
            <span className="detail-text">{formatTime(eventDate)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">📍</span>
            <span className="detail-text">{event.location}</span>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="capacity-section">
          <div className="capacity-bar">
            <div
              className="capacity-filled"
              style={{ width: `${(spotsTaken / event.capacity) * 100}%` }}
            ></div>
          </div>
          <div className="capacity-text">
            <span className="capacity-count">
              {spotsTaken} / {event.capacity} attending
            </span>
            <span className="capacity-remaining">
              {spotsRemaining > 0 ? `${spotsRemaining} spot${spotsRemaining !== 1 ? 's' : ''} left` : 'Event Full'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="event-card-actions">
          {user ? (
            <>
              {isUserAttending && !isEventCreator && (
                <button
                  className="btn btn-secondary btn-block"
                  onClick={handleLeaveEvent}
                  disabled={rsvpLoading}
                >
                  {rsvpLoading ? 'Processing...' : 'Leave Event'}
                </button>
              )}
              
              {!isUserAttending && !isEventCreator && (
                <button
                  className="btn btn-success btn-block"
                  onClick={handleJoinEvent}
                  disabled={isFull || rsvpLoading || isEventPast}
                >
                  {rsvpLoading
                    ? 'Processing...'
                    : isFull
                    ? 'Event Full'
                    : isEventPast
                    ? 'Event Ended'
                    : 'RSVP Now'}
                </button>
              )}

              {isEventCreator && (
                <>
                  <Link
                    to={`/edit-event/${event._id}`}
                    className="btn btn-tertiary btn-block"
                  >
                    Edit Event
                  </Link>
                  <button
                    className="btn btn-danger btn-block"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete Event
                  </button>
                </>
              )}
            </>
          ) : (
            <Link to="/login" className="btn btn-success btn-block">
              Login to RSVP
            </Link>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && isEventCreator && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Delete Event?</h3>
            <p>
              Are you sure you want to delete <strong>"{event.title}"</strong>? 
            </p>
            <p className="modal-warning">
              This action cannot be undone. All attendees will lose access to this event.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteEvent}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCard;