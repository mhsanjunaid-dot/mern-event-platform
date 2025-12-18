import axiosInstance from '../api/axiosConfig';

export const rsvpService = {
  joinEvent: async (eventId) => {
    const response = await axiosInstance.post(`/rsvp/${eventId}/join`);
    return response.data;
  },

  leaveEvent: async (eventId) => {
    const response = await axiosInstance.post(`/rsvp/${eventId}/leave`);
    return response.data;
  },

  getEventAttendees: async (eventId) => {
    const response = await axiosInstance.get(`/rsvp/${eventId}/attendees`);
    return response.data;
  }
};