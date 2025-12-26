import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TOKEN: '@token',
  USER: '@user',
  PENDING_EXPENSES: '@pending_expenses',
};

export const storage = {
  async saveToken(token: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.TOKEN, token);
  },

  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(KEYS.TOKEN);
  },

  async removeToken(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.TOKEN);
  },

  async saveUser(user: any): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  async getUser(): Promise<any> {
    const user = await AsyncStorage.getItem(KEYS.USER);
    return user ? JSON.parse(user) : null;
  },

  async removeUser(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.USER);
  },

  async savePendingExpenses(expenses: any[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.PENDING_EXPENSES, JSON.stringify(expenses));
  },

  async getPendingExpenses(): Promise<any[]> {
    const expenses = await AsyncStorage.getItem(KEYS.PENDING_EXPENSES);
    return expenses ? JSON.parse(expenses) : [];
  },

  async clearPendingExpenses(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.PENDING_EXPENSES);
  },

  async clear(): Promise<void> {
    await AsyncStorage.multiRemove([KEYS.TOKEN, KEYS.USER, KEYS.PENDING_EXPENSES]);
  },
};

