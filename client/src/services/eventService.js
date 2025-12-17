import axiosInstance from '../api/axiosConfig';

export const eventService = {
  getAllEvents: async () => {
    const response = await axiosInstance.get('/events');
    return response.data;
  },

  getEventById: async (id) => {
    const response = await axiosInstance.get(`/events/${id}`);
    return response.data;
  },

  createEvent: async (formData) => {
    const response = await axiosInstance.post('/events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  updateEvent: async (id, formData) => {
    const response = await axiosInstance.put(`/events/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deleteEvent: async (id) => {
    const response = await axiosInstance.delete(`/events/${id}`);
    return response.data;
  },

  joinEvent: async (id) => {
    const response = await axiosInstance.post(`/rsvp/${id}/join`);
    return response.data;
  },

  leaveEvent: async (id) => {
    const response = await axiosInstance.post(`/rsvp/${id}/leave`);
    return response.data;
  },

  getEventAttendees: async (id) => {
    const response = await axiosInstance.get(`/rsvp/${id}/attendees`);
    return response.data;
  }
};