import axios from 'axios';
import type { ApiResponse, EventItem, Order, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ticketflow_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<User> => {
      const res = await apiClient.post<ApiResponse<User>>('/auth/login', { email, password });
      if (res.data.data.token) {
        localStorage.setItem('ticketflow_token', res.data.data.token);
        localStorage.setItem('ticketflow_user', JSON.stringify(res.data.data));
      }
      return res.data.data;
    },
    register: async (email: string, password: string, fullName: string): Promise<User> => {
      const res = await apiClient.post<ApiResponse<User>>('/auth/register', { email, password, fullName });
      if (res.data.data.token) {
        localStorage.setItem('ticketflow_token', res.data.data.token);
        localStorage.setItem('ticketflow_user', JSON.stringify(res.data.data));
      }
      return res.data.data;
    },
    logout: () => {
      localStorage.removeItem('ticketflow_token');
      localStorage.removeItem('ticketflow_user');
    },
    getCurrentUser: (): User | null => {
      const stored = localStorage.getItem('ticketflow_user');
      return stored ? JSON.parse(stored) : null;
    },
  },
  events: {
    list: async (): Promise<EventItem[]> => {
      const res = await apiClient.get<ApiResponse<EventItem[]>>('/events');
      return res.data.data;
    },
    get: async (id: number): Promise<EventItem> => {
      const res = await apiClient.get<ApiResponse<EventItem>>(`/events/${id}`);
      return res.data.data;
    },
  },
  orders: {
    create: async (eventId: number, ticketTierId: number, quantity: number): Promise<Order> => {
      const res = await apiClient.post<ApiResponse<Order>>('/orders', {
        eventId,
        ticketTierId,
        quantity,
      });
      return res.data.data;
    },
    pay: async (orderNumber: string): Promise<Order> => {
      const res = await apiClient.post<ApiResponse<Order>>('/orders/pay', {
        orderNumber,
        paymentMethod: 'MOCK_CARD',
      });
      return res.data.data;
    },
    list: async (): Promise<Order[]> => {
      const res = await apiClient.get<ApiResponse<Order[]>>('/orders');
      return res.data.data;
    },
    get: async (orderNumber: string): Promise<Order> => {
      const res = await apiClient.get<ApiResponse<Order>>(`/orders/${orderNumber}`);
      return res.data.data;
    },
  },
};
