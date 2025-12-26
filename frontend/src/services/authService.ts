import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

export const authService = {
  register: async (email: string, password: string, name: string) => {
    const { data } = await api.post('/auth/register', { email, password, name });
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },

  getStoredUser: async (): Promise<User | null> => {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getStoredToken: async (): Promise<string | null> => {
    return await AsyncStorage.getItem('token');
  },
};

