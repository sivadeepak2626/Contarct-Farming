import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('fc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      // Don't auto-redirect if checking me
      if (!error.config.url.includes('/auth/me')) {
        localStorage.removeItem('fc_token');
        localStorage.removeItem('fc_user');
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth
  auth: {
    login: (credentials: { email: string; password: string }) => apiClient.post('/auth/login', credentials),
    getMe: () => apiClient.get('/auth/me'),
    getDemoAccounts: () => apiClient.get('/auth/demo-accounts'),
    register: (data: any) => apiClient.post('/auth/register', data),
  },

  // Farmers
  farmers: {
    getAll: (params?: any) => apiClient.get('/farmers', { params }),
    getById: (id: string) => apiClient.get(`/farmers/${id}`),
    create: (data: any) => apiClient.post('/farmers', data),
    update: (id: string, data: any) => apiClient.put(`/farmers/${id}`, data),
    delete: (id: string) => apiClient.delete(`/farmers/${id}`),
  },

  // Buyers
  buyers: {
    getAll: (params?: any) => apiClient.get('/buyers', { params }),
    getById: (id: string) => apiClient.get(`/buyers/${id}`),
    create: (data: any) => apiClient.post('/buyers', data),
    update: (id: string, data: any) => apiClient.put(`/buyers/${id}`, data),
    delete: (id: string) => apiClient.delete(`/buyers/${id}`),
  },

  // Field Officers
  officers: {
    getAll: (params?: any) => apiClient.get('/field-officers', { params }),
    getById: (id: string) => apiClient.get(`/field-officers/${id}`),
    create: (data: any) => apiClient.post('/field-officers', data),
    update: (id: string, data: any) => apiClient.put(`/field-officers/${id}`, data),
    assignFarmers: (id: string, farmerIds: string[]) => apiClient.post(`/field-officers/${id}/assign-farmers`, { farmerIds }),
  },

  // Crops
  crops: {
    getAll: (params?: any) => apiClient.get('/crops', { params }),
    getById: (id: string) => apiClient.get(`/crops/${id}`),
    create: (data: any) => apiClient.post('/crops', data),
    update: (id: string, data: any) => apiClient.put(`/crops/${id}`, data),
  },

  // Cultivation
  cultivations: {
    getAll: (params?: any) => apiClient.get('/cultivation', { params }),
    getById: (id: string) => apiClient.get(`/cultivation/${id}`),
    create: (data: any) => apiClient.post('/cultivation', data),
    updateStage: (id: string, data: { stage: string; notes?: string; actualYieldKg?: number }) =>
      apiClient.put(`/cultivation/${id}/stage`, data),
  },

  // Contracts
  contracts: {
    getAll: (params?: any) => apiClient.get('/contracts', { params }),
    getById: (id: string) => apiClient.get(`/contracts/${id}`),
    create: (data: any) => apiClient.post('/contracts', data),
    update: (id: string, data: any) => apiClient.put(`/contracts/${id}`, data),
    updateStatus: (id: string, data: { status: string; notes?: string }) =>
      apiClient.put(`/contracts/${id}/status`, data),
  },

  // Field Visits
  visits: {
    getAll: (params?: any) => apiClient.get('/field-visits', { params }),
    getById: (id: string) => apiClient.get(`/field-visits/${id}`),
    create: (data: any) => apiClient.post('/field-visits', data),
    update: (id: string, data: any) => apiClient.put(`/field-visits/${id}`, data),
  },

  // Input Issues
  issues: {
    getAll: (params?: any) => apiClient.get('/input-issues', { params }),
    create: (data: any) => apiClient.post('/input-issues', data),
    update: (id: string, data: any) => apiClient.put(`/input-issues/${id}`, data),
  },

  // Harvests
  harvests: {
    getAll: (params?: any) => apiClient.get('/harvests', { params }),
    create: (data: any) => apiClient.post('/harvests', data),
  },

  // Deliveries
  deliveries: {
    getAll: (params?: any) => apiClient.get('/deliveries', { params }),
    create: (data: any) => apiClient.post('/deliveries', data),
  },

  // Settlements
  settlements: {
    getAll: (params?: any) => apiClient.get('/settlements', { params }),
    getById: (id: string) => apiClient.get(`/settlements/${id}`),
    prepare: (data: any) => apiClient.post('/settlements/prepare', data),
    updateStatus: (id: string, data: { status: string; approvalNotes?: string }) =>
      apiClient.put(`/settlements/${id}/status`, data),
  },

  // Payments
  payments: {
    getAll: (params?: any) => apiClient.get('/payments', { params }),
    record: (data: any) => apiClient.post('/payments/record', data),
  },

  // Reports
  reports: {
    getData: (params?: any) => apiClient.get('/reports', { params }),
  },

  // Notifications
  notifications: {
    getAll: () => apiClient.get('/notifications'),
    markRead: (id: string) => apiClient.put(`/notifications/${id}/read`),
    markAllRead: () => apiClient.put('/notifications/mark-all-read'),
  },

  // Dashboard
  dashboard: {
    getStats: () => apiClient.get('/dashboard/stats'),
  },

  // Admin
  admin: {
    resetData: () => apiClient.post('/admin/reset-data'),
  },
};
