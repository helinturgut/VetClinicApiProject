import api from './api';

const adminService = {
  getPendingVets: () => api.get('/api/admin/veterinarians/pending').then((r) => r.data),
  approveVet: (id) => api.put(`/api/admin/veterinarians/${id}/approve`).then((r) => r.data),
};

export default adminService;
