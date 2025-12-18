import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { useAuth } from '../hooks/useAuth';
import EventCard from '../components/EventCard';
import '../styles/dashboard.css';

const EventsDashboard = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [rsvpLoading, setRsvpLoading] = useState({});

  const { user } = useAuth();

  useEffect(() => {
    fetchAllEvents();
  }, []);

  useEffect(() => {
    filterAndSortEvents();
  }, [events, filterType, sortBy, searchQuery]);

  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await eventService.getAllEvents();
      setEvents(data.events || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortEvents = useCallback(() => {
    let result = [...events];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query)
      );
    }

    if (filterType === 'attending' && user) {
      result = result.filter((event) => event.attendees.includes(user.id));
    } else if (filterType === 'created' && user) {
      result = result.filter((event) => event.createdBy._id === user.id);
    }

    if (sortBy === 'date') {
      result.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredEvents(result);
  }, [events, filterType, sortBy, searchQuery, user]);

  const handleRsvpSuccess = useCallback(
    (eventId, message) => {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchAllEvents();
    },
    []
  );

  const handleRsvpError = useCallback((errorMessage) => {
    setError(errorMessage);
    setTimeout(() => setError(''), 3000);
  }, []);


  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setSortBy('date');
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-spinner">
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="container">

        <div className="dashboard-header">
          <div className="header-content">
            <h1>Events Dashboard</h1>
            <p className="header-subtitle">
              {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {user && (
            <Link to="/create-event" className="btn btn-primary btn-lg">
              + Create Event
            </Link>
          )}
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
            <button
              className="alert-close"
              onClick={() => setError('')}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">
            {successMessage}
            <button
              className="alert-close"
              onClick={() => setSuccessMessage('')}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}

        <div className="search-filter-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <label htmlFor="filterType">Filter:</label>
              <select
                id="filterType"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Events</option>
                {user && <option value="attending">Attending</option>}
                {user && <option value="created">My Events</option>}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="sortBy">Sort:</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="date">Date (Earliest)</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>

            {(searchQuery || filterType !== 'all' || sortBy !== 'date') && (
              <button className="btn btn-secondary btn-sm" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>No events found</h3>
          </div>
        ) : (
          <div className="events-grid">
            {filteredEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                user={user}
                onRsvpSuccess={handleRsvpSuccess}
                onRsvpError={handleRsvpError}
                rsvpLoading={rsvpLoading[event._id] || false}
                setRsvpLoading={(id, isLoading) =>
                  setRsvpLoading((prev) => ({
                    ...prev,
                    [id]: isLoading
                  }))
                }
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default EventsDashboard;
