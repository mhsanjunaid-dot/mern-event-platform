import axiosInstance from '../api/axiosConfig';

export const eventService = {
  /**
   * Fetch all events
   * @returns {Promise} Array of events
   */
  getAllEvents: async () => {
    const response = await axiosInstance.get('/events');
    return response.data;
  },

  /**
   * Fetch a single event by ID
   * @param {string} id - Event ID
   * @returns {Promise} Event details
   */
  getEventById: async (id) => {
    const response = await axiosInstance.get(`/events/${id}`);
    return response.data;
  },

  /**
   * Create a new event
   * @param {FormData} formData - Form data with event details and image
   * @returns {Promise} Created event data
   */
  createEvent: async (formData) => {
    const response = await axiosInstance.post('/events', formData);
    return response.data;
  },

  /**
   * Update an existing event
   * @param {string} id - Event ID
   * @param {FormData} formData - Updated event data and image
   * @returns {Promise} Updated event data
   */
  updateEvent: async (id, formData) => {
    const response = await axiosInstance.put(`/events/${id}`, formData);
    return response.data;
  },

  /**
   * Delete an event
   * @param {string} id - Event ID
   * @returns {Promise} Deletion confirmation
   */
  deleteEvent: async (id) => {
    const response = await axiosInstance.delete(`/events/${id}`);
    return response.data;
  }
};