import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense } from '../types';
import { expenseService } from './expenseService';
import NetInfo from '@react-native-community/netinfo';

const PENDING_EXPENSES_KEY = 'pending_expenses';

export const offlineService = {
  savePending: async (expense: Omit<Expense, '_id'>) => {
    try {
      const pending = await offlineService.getPending();
      const newExpense = {
        ...expense,
        _id: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      pending.push(newExpense);
      await AsyncStorage.setItem(PENDING_EXPENSES_KEY, JSON.stringify(pending));
      return newExpense;
    } catch (error) {
      console.error('Error saving pending expense:', error);
      throw error;
    }
  },

  getPending: async (): Promise<Expense[]> => {
    try {
      const data = await AsyncStorage.getItem(PENDING_EXPENSES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting pending expenses:', error);
      return [];
    }
  },

  clearPending: async () => {
    try {
      await AsyncStorage.removeItem(PENDING_EXPENSES_KEY);
    } catch (error) {
      console.error('Error clearing pending expenses:', error);
    }
  },

  syncPending: async (): Promise<{ synced: number; failed: number }> => {
    const isConnected = (await NetInfo.fetch()).isConnected;
    if (!isConnected) {
      return { synced: 0, failed: 0 };
    }

    try {
      const pending = await offlineService.getPending();
      if (pending.length === 0) {
        return { synced: 0, failed: 0 };
      }

      const synced: string[] = [];
      const failed: string[] = [];

      for (const expense of pending) {
        try {
          if (expense._id?.startsWith('pending_')) {
            const { _id, ...expenseData } = expense;
            await expenseService.create(expenseData);
            synced.push(_id);
          }
        } catch (error: any) {
          console.error('Sync error for expense:', expense._id, error);
          if (error.response?.status !== 401) {
            failed.push(expense._id!);
          }
        }
      }

      const remaining = pending.filter(e => !synced.includes(e._id!) && !failed.includes(e._id!));
      await AsyncStorage.setItem(PENDING_EXPENSES_KEY, JSON.stringify(remaining));

      return { synced: synced.length, failed: failed.length };
    } catch (error) {
      console.error('Error syncing pending expenses:', error);
      return { synced: 0, failed: 0 };
    }
  },
};

