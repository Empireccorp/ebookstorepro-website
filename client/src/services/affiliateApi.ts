import axios from 'axios';

import { buildApiUrl } from '../config/api';

// Criar instância do axios com configuração base
const affiliateApi = axios.create({
  baseURL: `buildApiUrl('admin/affiliates`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
affiliateApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token';
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===== AFFILIATES =====
export const listAffiliates = async () => {
  const response = await affiliateApi.get('/';
  return response.data;
};

export const getAffiliateById = async (id: string) => {
  const response = await affiliateApi.get(`/${id}`);
  return response.data;
};

export const createAffiliate = async (data: any) => {
  const response = await affiliateApi.post('/', data);
  return response.data;
};

export const updateAffiliate = async (id: string, data: any) => {
  const response = await affiliateApi.put(`/${id}`, data);
  return response.data;
};

export const deleteAffiliate = async (id: string) => {
  const response = await affiliateApi.delete(`/${id}`);
  return response.data;
};

// ===== PAYOUTS =====
export const payAffiliateCommissions = async (id: string, notes?: string) => {
  const response = await affiliateApi.post(`/${id}/pay-commissions`, { notes });
  return response.data;
};

export const listPayouts = async (affiliateId?: string) => {
  const params = affiliateId ? { affiliateId } : {};
  const response = await affiliateApi.get('/payouts/list', { params });
  return response.data;
};

export const getPayoutById = async (id: string) => {
  const response = await affiliateApi.get(`/payouts/${id}`);
  return response.data;
};

// ===== STATS =====
export const getAffiliateStats = async () => {
  const response = await affiliateApi.get('/stats/general';
  return response.data;
};

export default affiliateApi;
