import axios, { AxiosError, CancelTokenSource } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For Android emulator use: http://10.0.2.2:5000/api
// For iOS simulator use: http://localhost:5000/api
// For physical device use your computer's IP: http://YOUR_IP:5000/api
const API_URL = __DEV__ ? 'http://localhost:5000/api' : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

let cancelTokenSource: CancelTokenSource | null = null;

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['token', 'user']);
      if (error.config && !error.config.url?.includes('/auth/')) {
        console.log('Unauthorized - clearing session');
      }
    }
    return Promise.reject(error);
  }
);

export const cancelPendingRequests = () => {
  if (cancelTokenSource) {
    cancelTokenSource.cancel('Request cancelled due to logout');
    cancelTokenSource = null;
  }
};

export default api;

