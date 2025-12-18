import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { rsvpService } from '../services/rsvpService';
import DeleteConfirmModal from './DeleteConfirmModal';
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


  if (!event || !event._id) return null;

  const handleJoinEvent = async () => {
    if (!user) {
      onRsvpError('Please login to RSVP to events');
      return;
    }

    try {
      setRsvpLoading(event._id, true);
      await rsvpService.joinEvent(event._id);
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
      await rsvpService.leaveEvent(event._id);
      onRsvpSuccess(event._id, `Left "${event.title}"`);
    } catch (err) {
      onRsvpError(err.response?.data?.message || 'Failed to leave event');
    } finally {
      setRsvpLoading(event._id, false);
    }
  };

  const handleDeleteEvent = async () => {
    try {
      setDeleteLoading(true);
      await eventService.deleteEvent(event._id);
      setShowDeleteConfirm(false);
      onEventDeleted(event._id);
    } catch (err) {
      setShowDeleteConfirm(false);
      const errorMsg = err.response?.data?.message || 'Failed to delete event';
      onRsvpError(errorMsg);
    } finally {
      setDeleteLoading(false);
    }
  };


  const getImageUrl = () => {
    if (!event.image) return null;
    
    if (event.image.startsWith('http')) {
      return event.image;
    }
    
    if (event.image.startsWith('/')) {
      const baseURL = import.meta.env.VITE_API_URL || 'https://mern-event-platform-qgpq.onrender.com/api';
      const baseServerURL = baseURL.replace(/\/api$/, '');
      return `${baseServerURL}${event.image}`;
    }
    
    return null;
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

        <div className="event-card-content">
          <h3 className="event-card-title">{event.title}</h3>

          <p className="event-card-description">{event.description}</p>

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
              <Link>Edit Event</Link>
              <button
              className="btn btn-danger btn-block"
              onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirm(true);
                }}
              disabled={deleteLoading}
               >
               {deleteLoading ? 'Deleting...' : 'Delete Event'}
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

        <DeleteConfirmModal
          show={showDeleteConfirm}
          title={event.title}
          onConfirm={handleDeleteEvent}
          onCancel={() => setShowDeleteConfirm(false)}
          loading={deleteLoading}
        />
      </div>
  );
};

export default EventCard;