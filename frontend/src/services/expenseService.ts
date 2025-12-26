import api from './api';
import { Expense, Stats } from '../types';

export const expenseService = {
  create: async (expense: Omit<Expense, '_id'>) => {
    const { data } = await api.post('/expenses', expense);
    return data;
  },

  getAll: async (startDate?: string, endDate?: string, category?: string) => {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (category) params.category = category;
    const { data } = await api.get('/expenses', { params });
    return data;
  },

  getStats: async (month: number, year: number) => {
    const { data } = await api.get('/expenses/stats', { params: { month, year } });
    return data as Stats;
  },

  update: async (id: string, expense: Partial<Expense>) => {
    const { data } = await api.put(`/expenses/${id}`, expense);
    return data;
  },

  delete: async (id: string) => {
    await api.delete(`/expenses/${id}`);
  },
};
