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
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
},


  updateEvent: async (id, formData) => {
    const response = await axiosInstance.put(`/events/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      }
    });
    return response.data;
  }

};
