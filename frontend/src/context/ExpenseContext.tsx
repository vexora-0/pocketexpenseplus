import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import NetInfo from "@react-native-community/netinfo";
import { expenseAPI } from "../services/api";
import { offlineService } from "../services/offlineService";
import { Expense } from "../types";
import { useAuth } from "./AuthContext";

interface ExpenseContextData {
  expenses: Expense[];
  loading: boolean;
  loadExpenses: () => Promise<void>;
  addExpense: (
    expense: Omit<Expense, "_id" | "userId" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  syncPending: () => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextData>(
  {} as ExpenseContextData
);

export const ExpenseProvider = ({ children }: { children: ReactNode }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadExpenses();
      const unsubscribe = NetInfo.addEventListener((state) => {
        if (Boolean(state.isConnected)) {
          syncPending();
        }
      });
      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const isOnline = await offlineService.isOnline();

      if (isOnline) {
        const response = await expenseAPI.getAll();
        setExpenses(response.data);
      }
    } catch (error) {
      console.error("Failed to load expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (
    expense: Omit<Expense, "_id" | "userId" | "createdAt" | "updatedAt">
  ) => {
    try {
      const isOnline = await offlineService.isOnline();

      if (isOnline) {
        const response = await expenseAPI.create(expense);
        setExpenses((prev) => [response.data, ...prev]);
      } else {
        await offlineService.savePendingExpense(expense);
        const localExpense = {
          ...expense,
          _id: Date.now().toString(),
          userId: "local",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          pendingSync: true,
        } as Expense;
        setExpenses((prev) => [localExpense, ...prev]);
      }
    } catch (error) {
      throw error;
    }
  };

  const updateExpense = async (id: string, expense: Partial<Expense>) => {
    try {
      const isOnline = await offlineService.isOnline();

      if (isOnline) {
        const response = await expenseAPI.update(id, expense);
        setExpenses((prev) =>
          prev.map((e) => (e._id === id ? response.data : e))
        );
      } else {
        await offlineService.savePendingExpense({ _id: id, ...expense });
        setExpenses((prev) =>
          prev.map((e) =>
            e._id === id ? { ...e, ...expense, pendingSync: true } : e
          )
        );
      }
    } catch (error) {
      throw error;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const isOnline = await offlineService.isOnline();

      if (isOnline) {
        await expenseAPI.delete(id);
        setExpenses((prev) => prev.filter((e) => e._id !== id));
      } else {
        setExpenses((prev) => prev.filter((e) => e._id !== id));
      }
    } catch (error) {
      throw error;
    }
  };

  const syncPending = async () => {
    try {
      await offlineService.syncPendingExpenses();
      await loadExpenses();
    } catch (error) {
      console.error("Failed to sync:", error);
    }
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        loading,
        loadExpenses,
        addExpense,
        updateExpense,
        deleteExpense,
        syncPending,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => useContext(ExpenseContext);
