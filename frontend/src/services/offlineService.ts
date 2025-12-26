import NetInfo from '@react-native-community/netinfo';
import { storage } from '../utils/storage';
import { expenseAPI } from './api';

export const offlineService = {
  async isOnline(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return Boolean(state.isConnected);
  },

  async savePendingExpense(expense: any): Promise<void> {
    const pending = await storage.getPendingExpenses();
    pending.push({ ...expense, localId: Date.now().toString(), pendingSync: true });
    await storage.savePendingExpenses(pending);
  },

  async syncPendingExpenses(): Promise<void> {
    const isOnline = await this.isOnline();
    if (!isOnline) return;

    const pending = await storage.getPendingExpenses();
    if (pending.length === 0) return;

    const synced: string[] = [];
    
    for (const expense of pending) {
      try {
        if (expense._id) {
          await expenseAPI.update(expense._id, expense);
        } else {
          await expenseAPI.create(expense);
        }
        synced.push(expense.localId);
      } catch (error) {
        console.error('Failed to sync expense:', error);
      }
    }

    const remaining = pending.filter((e) => !synced.includes(e.localId));
    await storage.savePendingExpenses(remaining);
  },
};

