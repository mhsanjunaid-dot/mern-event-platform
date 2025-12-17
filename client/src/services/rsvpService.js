import axiosInstance from '../api/axiosConfig';

export const rsvpService = {
  /**
   * Join an event (RSVP)
   * @param {string} eventId - Event ID
   * @returns {Promise} Updated event with attendees
   */
  joinEvent: async (eventId) => {
    const response = await axiosInstance.post(`/rsvp/${eventId}/join`);
    return response.data;
  },

  /**
   * Leave an event (cancel RSVP)
   * @param {string} eventId - Event ID
   * @returns {Promise} Updated event with attendees
   */
  leaveEvent: async (eventId) => {
    const response = await axiosInstance.post(`/rsvp/${eventId}/leave`);
    return response.data;
  },

  /**
   * Fetch event attendees list
   * @param {string} eventId - Event ID
   * @returns {Promise} Attendees data and capacity info
   */
  getEventAttendees: async (eventId) => {
    const response = await axiosInstance.get(`/rsvp/${eventId}/attendees`);
    return response.data;
  }
};