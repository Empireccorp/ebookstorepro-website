import axios from 'axios';

import { buildApiUrl } from '../config/api';

// Criar instância do axios com configuração base
const adminApi = axios.create({
  baseURL: `buildApiUrl('admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token';
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('admin_token';
      localStorage.removeItem('admin_user';
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// ===== AUTH =====
export const login = async (email: string, password: string) => {
  const response = await adminApi.post('/auth/login', { email, password });
  return response.data;
};

export const setupAdmin = async (email: string, password: string, name: string) => {
  const response = await adminApi.post('/auth/setup', { email, password, name });
  return response.data;
};

export const getCurrentAdmin = async () => {
  const response = await adminApi.get('/auth/me';
  return response.data;
};

// ===== DASHBOARD =====
export const getDashboardStats = async () => {
  const response = await adminApi.get('/dashboard/stats';
  return response.data;
};

export const getSalesChart = async () => {
  const response = await adminApi.get('/dashboard/sales-chart';
  return response.data;
};

// ===== EBOOKS =====
export const listEbooksAdmin = async () => {
  const response = await adminApi.get('/ebooks';
  return response.data;
};

export const getEbookByIdAdmin = async (id: string) => {
  const response = await adminApi.get(`/ebooks/${id}`);
  return response.data;
};

export const createEbook = async (data: any) => {
  const response = await adminApi.post('/ebooks', data);
  return response.data;
};

export const updateEbook = async (id: string, data: any) => {
  const response = await adminApi.put(`/ebooks/${id}`, data);
  return response.data;
};

export const deleteEbook = async (id: string) => {
  const response = await adminApi.delete(`/ebooks/${id}`);
  return response.data;
};

export const uploadCover = async (id: string, file: File) => {
  const formData = new FormData();
  formData.append('cover', file);
  const response = await adminApi.post(`/ebooks/${id}/upload-cover`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const uploadPdf = async (id: string, file: File) => {
  const formData = new FormData();
  formData.append('pdf', file);
  const response = await adminApi.post(`/ebooks/${id}/upload-pdf`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// ===== CATEGORIES =====
export const listCategoriesAdmin = async () => {
  const response = await axios.get(`buildApiUrl('categories/admin/all`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('admin_token'}`,
    },
  });
  return response.data;
};

export const getCategoryById = async (id: string) => {
  const response = await axios.get(`buildApiUrl('categories/admin/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('admin_token'}`,
    },
  });
  return response.data;
};

export const createCategory = async (data: any) => {
  const response = await axios.post(`buildApiUrl('categories/admin`, data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('admin_token'}`,
    },
  });
  return response.data;
};

export const updateCategory = async (id: string, data: any) => {
  const response = await axios.put(`buildApiUrl('categories/admin/${id}`, data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('admin_token'}`,
    },
  });
  return response.data;
};

export const deleteCategory = async (id: string) => {
  const response = await axios.delete(`buildApiUrl('categories/admin/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('admin_token'}`,
    },
  });
  return response.data;
};

// ===== ORDERS =====
export const listOrdersAdmin = async (status?: string) => {
  const params = status ? { status } : {};
  const response = await adminApi.get('/orders', { params });
  return response.data;
};

export const getOrderByIdAdmin = async (id: string) => {
  const response = await adminApi.get(`/orders/${id}`);
  return response.data;
};

export const resendOrderEmail = async (id: string) => {
  const response = await adminApi.post(`/orders/${id}/resend-email`);
  return response.data;
};

export const getOrderStats = async () => {
  const response = await adminApi.get('/orders/stats';
  return response.data;
};

// ===== CONFIG =====
export const getAllConfigs = async () => {
  const response = await adminApi.get('/config';
  return response.data;
};

export const getConfigByKey = async (key: string) => {
  const response = await adminApi.get(`/config/${key}`);
  return response.data;
};

export const upsertConfig = async (key: string, value: string, description?: string) => {
  const response = await adminApi.post('/config', { key, value, description });
  return response.data;
};

export const updateEnvVar = async (key: string, value: string) => {
  const response = await adminApi.put(`/config/env/${key}`, { value });
  return response.data;
};

export const deleteConfig = async (key: string) => {
  const response = await adminApi.delete(`/config/${key}`);
  return response.data;
};

export default adminApi;
