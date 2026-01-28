import axios from 'axios';

const API_URL = '/api';

// Doctor API
export const doctorAPI = {
  getAll: async (params = {}) => {
    const { data } = await axios.get(`${API_URL}/doctors`, { params });
    return data;
  },

  getById: async (id) => {
    const { data } = await axios.get(`${API_URL}/doctors/${id}`);
    return data;
  },

  create: async (formData) => {
    const { data } = await axios.post(`${API_URL}/doctors`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  update: async (id, formData) => {
    const { data } = await axios.put(`${API_URL}/doctors/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  delete: async (id) => {
    const { data } = await axios.delete(`${API_URL}/doctors/${id}`);
    return data;
  },

  getStats: async (id) => {
    const { data } = await axios.get(`${API_URL}/doctors/${id}/stats`);
    return data;
  },

  getSpecializations: async () => {
    const { data } = await axios.get(`${API_URL}/doctors/specializations/list`);
    return data;
  },
};

// Slot API
export const slotAPI = {
  getAvailable: async (doctorId, date) => {
    const { data } = await axios.get(`${API_URL}/slots/available/${doctorId}`, {
      params: { date },
    });
    return data;
  },

  create: async (slotData) => {
    const { data } = await axios.post(`${API_URL}/slots`, slotData);
    return data;
  },

  bulkCreate: async (bulkData) => {
    const { data } = await axios.post(`${API_URL}/slots/bulk-create`, bulkData);
    return data;
  },

  getDoctorSlots: async (doctorId, params = {}) => {
    const { data } = await axios.get(`${API_URL}/slots/doctor/${doctorId}`, {
      params,
    });
    return data;
  },

  toggleBlock: async (id) => {
    const { data } = await axios.put(`${API_URL}/slots/${id}/block`);
    return data;
  },

  blockDates: async (blockData) => {
    const { data } = await axios.post(`${API_URL}/slots/block-dates`, blockData);
    return data;
  },

  delete: async (id) => {
    const { data } = await axios.delete(`${API_URL}/slots/${id}`);
    return data;
  },

  generateTimes: async () => {
    const { data } = await axios.get(`${API_URL}/slots/generate-times`);
    return data;
  },
};

// Appointment API
export const appointmentAPI = {
  book: async (appointmentData) => {
    const { data } = await axios.post(`${API_URL}/appointments`, appointmentData);
    return data;
  },

  getMyAppointments: async (params = {}) => {
    const { data } = await axios.get(`${API_URL}/appointments/my-appointments`, {
      params,
    });
    return data;
  },

  getAll: async (params = {}) => {
    const { data } = await axios.get(`${API_URL}/appointments`, { params });
    return data;
  },

  getById: async (id) => {
    const { data } = await axios.get(`${API_URL}/appointments/${id}`);
    return data;
  },

  confirm: async (id, notes = '') => {
    const { data } = await axios.put(`${API_URL}/appointments/${id}/confirm`, {
      notes,
    });
    return data;
  },

  cancel: async (id, cancellationReason = '') => {
    const { data } = await axios.put(`${API_URL}/appointments/${id}/cancel`, {
      cancellationReason,
    });
    return data;
  },

  complete: async (id, notes = '') => {
    const { data } = await axios.put(`${API_URL}/appointments/${id}/complete`, {
      notes,
    });
    return data;
  },

  delete: async (id) => {
    const { data } = await axios.delete(`${API_URL}/appointments/${id}`);
    return data;
  },

  getStats: async (params = {}) => {
    console.log('📊 Calling appointmentAPI.getStats, Authorization header:', 
      axios.defaults.headers.common['Authorization'] ? '✅ Set' : '❌ Not set');
    const { data } = await axios.get(`${API_URL}/appointments/stats/overview`, {
      params,
    });
    return data;
  },
};

export default {
  doctorAPI,
  slotAPI,
  appointmentAPI,
};
