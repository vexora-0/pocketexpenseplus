import api from './api';
import { Budget } from '../types';

export const budgetService = {
  create: async (budget: Omit<Budget, '_id'>) => {
    const { data } = await api.post('/budget', budget);
    return data;
  },

  getAll: async (month: number, year: number) => {
    const { data } = await api.get('/budget', { params: { month, year } });
    return data;
  },

  delete: async (id: string) => {
    await api.delete(`/budget/${id}`);
  },
};

