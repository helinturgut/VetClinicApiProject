import api from './api';

const adminService = {
  getPendingVets: () => api.get('/api/admin/veterinarians/pending').then((r) => r.data),
  getApprovedVets: () => api.get('/api/admin/veterinarians').then((r) => r.data),
  approveVet: (id) => api.put(`/api/admin/veterinarians/${id}/approve`).then((r) => r.data),
  rejectVet: (id) => api.delete(`/api/admin/veterinarians/${id}/reject`),
  deleteVet: (id) => api.delete(`/api/admin/veterinarians/${id}`),
};

export default adminService;
