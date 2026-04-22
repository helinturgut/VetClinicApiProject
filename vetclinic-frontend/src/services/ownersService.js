import api from './api';

const ownersService = {
  getAll: () => api.get('/api/owners').then((r) => r.data),
  getById: (id) => api.get(`/api/owners/${id}`).then((r) => r.data),
  create: (data) => api.post('/api/owners', data).then((r) => r.data),
  update: (id, data) => api.put(`/api/owners/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/api/owners/${id}`).then((r) => r.data),
};

export default ownersService;
