import React, { useState, useEffect } from 'react';
import { eventService } from '../services/eventService';
import { useAuth } from '../hooks/useAuth';
import '../styles/pages.css';

const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAllEvents();
      setEvents(data.events || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async (eventId) => {
    if (!user) {
      alert('Please login to RSVP');
      return;
    }

    try {
      await eventService.joinEvent(eventId);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join event');
    }
  };

  const handleLeaveEvent = async (eventId) => {
    try {
      await eventService.leaveEvent(eventId);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to leave event');
    }
  };

  if (loading) return <div className="container"><p>Loading events...</p></div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>Upcoming Events</h1>
        {user && (
          <a href="/create-event" className="btn btn-primary">
            Create Event
          </a>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="events-grid">
        {events.length === 0 ? (
          <p className="no-events">No events available</p>
        ) : (
          events.map((event) => (
            <div key={event._id} className="event-card">
              {event.image && (
                <img src={event.image} alt={event.title} className="event-image" />
              )}
              <div className="event-content">
                <h3>{event.title}</h3>
                <p className="event-description">{event.description}</p>
                <div className="event-details">
                  <span>📍 {event.location}</span>
                  <span>📅 {new Date(event.dateTime).toLocaleDateString()}</span>
                  <span>⏰ {new Date(event.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="capacity-info">
                  <span>{event.attendees.length} / {event.capacity} attending</span>
                </div>
                {user ? (
                  event.attendees.includes(user.id) ? (
                    <>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleLeaveEvent(event._id)}
                      >
                        Leave Event
                      </button>
                      {event.createdBy._id === user.id && (
                        <a href={`/edit-event/${event._id}`} className="btn btn-tertiary">
                          Edit
                        </a>
                      )}
                    </>
                  ) : (
                    <button
                      className="btn btn-success"
                      onClick={() => handleJoinEvent(event._id)}
                      disabled={event.attendees.length >= event.capacity}
                    >
                      {event.attendees.length >= event.capacity ? 'Event Full' : 'RSVP Now'}
                    </button>
                  )
                ) : (
                  <a href="/login" className="btn btn-success">Login to RSVP</a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HomePage;