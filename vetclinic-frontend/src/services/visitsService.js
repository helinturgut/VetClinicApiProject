import api from './api';

const visitsService = {
  getAll: () => api.get('/api/visits').then((r) => r.data),
  getById: (id) => api.get(`/api/visits/${id}`).then((r) => r.data),
  create: (data) => api.post('/api/visits', data).then((r) => r.data),
  update: (id, data) => api.put(`/api/visits/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/api/visits/${id}`).then((r) => r.data),
  getDiagnoses: (visitId) => api.get(`/api/visits/${visitId}/diagnoses`).then((r) => r.data),
  addDiagnosis: (visitId, data) => api.post(`/api/visits/${visitId}/diagnoses`, data).then((r) => r.data),
  getTreatments: (visitId) => api.get(`/api/visits/${visitId}/treatments`).then((r) => r.data),
  addTreatment: (visitId, data) => api.post(`/api/visits/${visitId}/treatments`, data).then((r) => r.data),
};

export default visitsService;
