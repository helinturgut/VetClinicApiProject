import api from './api';

const toFrontend = (v) => ({
  ...v,
  id: v.visitId,
  reason: v.complaint,
});

const toBackend = (data) => {
  const { reason, ...rest } = data;
  return {
    ...rest,
    petId: data.petId ? Number(data.petId) : undefined,
    complaint: reason,
  };
};

const visitsService = {
  getAll: () => api.get('/api/visits').then((r) => r.data.map(toFrontend)),
  getById: (id) => api.get(`/api/visits/${id}`).then((r) => toFrontend(r.data)),
  create: (data) => api.post('/api/visits', toBackend(data)).then((r) => toFrontend(r.data)),
  update: (id, data) => api.put(`/api/visits/${id}`, toBackend(data)).then((r) => toFrontend(r.data)),
  remove: (id) => api.delete(`/api/visits/${id}`).then((r) => r.data),
  getDiagnoses: (visitId) => api.get(`/api/visits/${visitId}/diagnoses`).then((r) => r.data),
  addDiagnosis: (visitId, data) => api.post(`/api/visits/${visitId}/diagnoses`, data).then((r) => r.data),
  updateDiagnosis: (visitId, diagnosisId, data) => api.put(`/api/visits/${visitId}/diagnoses/${diagnosisId}`, data).then((r) => r.data),
  deleteDiagnosis: (visitId, diagnosisId) => api.delete(`/api/visits/${visitId}/diagnoses/${diagnosisId}`),
  getTreatments: (visitId) => api.get(`/api/visits/${visitId}/treatments`).then((r) => r.data),
  addTreatment: (visitId, data) => api.post(`/api/visits/${visitId}/treatments`, data).then((r) => r.data),
  updateTreatment: (visitId, treatmentId, data) => api.put(`/api/visits/${visitId}/treatments/${treatmentId}`, data).then((r) => r.data),
  deleteTreatment: (visitId, treatmentId) => api.delete(`/api/visits/${visitId}/treatments/${treatmentId}`),
};

export default visitsService;
