import axios from 'axios';
import { storage } from '../utils/storage';

const API_URL = 'http://192.168.0.232:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.clear();
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

export const expenseAPI = {
  getAll: () => api.get('/expenses'),
  getById: (id: string) => api.get(`/expenses/${id}`),
  create: (data: any) => api.post('/expenses', data),
  update: (id: string, data: any) => api.put(`/expenses/${id}`, data),
  delete: (id: string) => api.delete(`/expenses/${id}`),
};

export const analyticsAPI = {
  getMonthly: (month: number, year: number) =>
    api.get(`/analytics/monthly?month=${month}&year=${year}`),
  getInsights: () => api.get('/analytics/insights'),
};

export const budgetAPI = {
  getAll: (month?: number, year?: number) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    const query = params.toString();
    return api.get(`/budgets${query ? `?${query}` : ''}`);
  },
  create: (data: { category: string; limit: number; month: number; year: number }) =>
    api.post('/budgets', data),
  update: (id: string, data: { limit: number }) =>
    api.put(`/budgets/${id}`, data),
  delete: (id: string) => api.delete(`/budgets/${id}`),
};

export default api;

