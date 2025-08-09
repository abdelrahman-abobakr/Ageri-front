import axios from 'axios';
import { API_CONFIG } from '../constants';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL.endsWith('/') ? API_CONFIG.BASE_URL : API_CONFIG.BASE_URL + '/',
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // تسجيل الطلبات للمساعدة في التشخيص
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => {
    // تسجيل تفاصيل الاستجابة الكاملة
    console.log('API Response Details:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      headers: response.headers,
      data: response.data,
      config: response.config
    });

    // أو إذا كنت تريد تسجيل الكائن كاملاً
    // console.log('Complete API Response:', response);

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // تسجيل الأخطاء للمساعدة في التشخيص
    console.error(`API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          console.log('Attempting token refresh...');

          const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          console.log('Token refreshed successfully');

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);

        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');

        // استخدم react-router أو window.location حسب الإعداد
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Create public axios instance (no authentication required)
export const publicApiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// إضافة interceptor للعميل العام أيضاً
publicApiClient.interceptors.request.use(
  (config) => {
    console.log(`Public API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Public API request error:', error);
    return Promise.reject(error);
  }
);

publicApiClient.interceptors.response.use(
  (response) => {
    // تسجيل تفاصيل الاستجابة الكاملة للعميل العام
    console.log('Public API Response Details:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      headers: response.headers,
      data: response.data,
      config: response.config
    });

    return response;
  },
  (error) => {
    console.error(`Public API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
    return Promise.reject(error);
  }
);

export default apiClient;