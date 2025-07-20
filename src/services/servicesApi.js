// src/services/servicesApi.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor لإضافة التوكن تلقائياً
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token') || localStorage.getItem('access-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['Content-Type'] = 'application/json';
  return config;
});

// Interceptor لمعالجة الأخطاء
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('access-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// تحويل البيانات للملفات إذا وجدت
const preparePayload = (data) => {
  const payload = { ...data };
  
  // تحويل القيم المنطقية
  if (payload.is_free !== undefined) {
    payload.is_free = Boolean(payload.is_free);
  }
  
  // تحويل القيم الرقمية
  if (payload.base_price) {
    payload.base_price = Number(payload.base_price);
  }
  
  // إزالة حقول الملفات إذا كانت null
  if (payload.featured_image === null) {
    delete payload.featured_image;
  }
  
  if (payload.service_brochure === null) {
    delete payload.service_brochure;
  }
  
  return payload;
};

export const getServices = async () => {
  try {
    const response = await api.get('/services/test-services/');
    return response.data;
  } catch (error) {
    console.error('Error fetching services:', error.response?.data);
    throw error;
  }
};

export const createService = async (data) => {
  try {
    const payload = preparePayload(data);
    console.log('Creating service with payload:', payload);
    const response = await api.post('/services/test-services/', payload);
    return response.data;
  } catch (error) {
    console.error('Error creating service:', error.response?.data);
    throw error;
  }
};

export const updateService = async (id, data) => {
  try {
    const payload = preparePayload(data);
    console.log('Updating service with payload:', payload);
    const response = await api.patch(`/services/test-services/${id}/`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating service:', error.response?.data);
    throw error;
  }
};

export const deleteService = async (id) => {
  try {
    const response = await api.delete(`/services/test-services/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error deleting service:', error.response?.data);
    throw error;
  }
};

export const getCategories = async () => {
  return ['تحاليل طبية', 'استشارات', 'فحوصات'];
};

export const getStatuses = async () => {
  return ['نشط', 'غير نشط', 'قيد المراجعة'];
};