import React, { createContext, useContext, useState, useEffect } from 'react';
import { Expense, Stats } from '../types';
import { expenseService } from '../services/expenseService';
import { offlineService } from '../services/offlineService';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

interface ExpenseContextType {
  expenses: Expense[];
  stats: Stats | null;
  loading: boolean;
  addExpense: (expense: Omit<Expense, '_id'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  loadExpenses: (startDate?: string, endDate?: string, category?: string) => Promise<void>;
  loadStats: (month: number, year: number) => Promise<void>;
  syncPending: () => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setExpenses([]);
      setStats(null);
      return;
    }

    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && isAuthenticated) {
        syncPending().catch(() => {});
      }
    });
    return () => unsubscribe();
  }, [isAuthenticated]);

  const addExpense = async (expense: Omit<Expense, '_id'>) => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }

    const isConnected = (await NetInfo.fetch()).isConnected;
    if (isConnected) {
      try {
        const newExpense = await expenseService.create(expense);
        setExpenses(prev => [newExpense, ...prev]);
      } catch (error) {
        await offlineService.savePending(expense);
        setExpenses(prev => [{ ...expense, _id: `pending_${Date.now()}` }, ...prev]);
        throw error;
      }
    } else {
      await offlineService.savePending(expense);
      setExpenses(prev => [{ ...expense, _id: `pending_${Date.now()}` }, ...prev]);
    }
  };

  const updateExpense = async (id: string, expense: Partial<Expense>) => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }

    if (id.startsWith('pending_')) {
      const pending = await offlineService.getPending();
      const updated = pending.map(e => e._id === id ? { ...e, ...expense } : e);
      await AsyncStorage.setItem('pending_expenses', JSON.stringify(updated));
      setExpenses(prev => prev.map(e => e._id === id ? { ...e, ...expense } : e));
    } else {
      try {
        const updated = await expenseService.update(id, expense);
        setExpenses(prev => prev.map(e => e._id === id ? updated : e));
      } catch (error) {
        console.error('Failed to update expense:', error);
        throw error;
      }
    }
  };

  const deleteExpense = async (id: string) => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }

    if (id.startsWith('pending_')) {
      const pending = await offlineService.getPending();
      const filtered = pending.filter(e => e._id !== id);
      await AsyncStorage.setItem('pending_expenses', JSON.stringify(filtered));
      setExpenses(prev => prev.filter(e => e._id !== id));
    } else {
      try {
        await expenseService.delete(id);
        setExpenses(prev => prev.filter(e => e._id !== id));
      } catch (error) {
        console.error('Failed to delete expense:', error);
        throw error;
      }
    }
  };

  const loadExpenses = async (startDate?: string, endDate?: string, category?: string) => {
    if (!isAuthenticated) {
      const pending = await offlineService.getPending();
      setExpenses(pending);
      return;
    }

    setLoading(true);
    try {
      const data = await expenseService.getAll(startDate, endDate, category);
      const pending = await offlineService.getPending();
      setExpenses([...data, ...pending]);
    } catch (error: any) {
      if (error.response?.status === 401) {
        const pending = await offlineService.getPending();
        setExpenses(pending);
      } else {
        const pending = await offlineService.getPending();
        setExpenses(pending);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (month: number, year: number) => {
    if (!isAuthenticated) {
      setStats(null);
      return;
    }

    try {
      const data = await expenseService.getStats(month, year);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
      setStats(null);
    }
  };

  const syncPending = async () => {
    if (!isAuthenticated) return;

    try {
      await offlineService.syncPending();
      await loadExpenses();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  return (
    <ExpenseContext.Provider value={{
      expenses,
      stats,
      loading,
      addExpense,
      updateExpense,
      deleteExpense,
      loadExpenses,
      loadStats,
      syncPending
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) throw new Error('useExpenses must be used within ExpenseProvider');
  return context;
};

