import api from './api';

const petsService = {
  getAll: () => api.get('/api/pets').then((r) => r.data),
  getById: (id) => api.get(`/api/pets/${id}`).then((r) => r.data),
  create: (data) => api.post('/api/pets', data).then((r) => r.data),
  update: (id, data) => api.put(`/api/pets/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/api/pets/${id}`).then((r) => r.data),
  getHistory: (id) => api.get(`/api/pets/${id}/history`).then((r) => r.data),
};

export default petsService;
