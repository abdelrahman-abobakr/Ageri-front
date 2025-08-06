import axios from 'axios';

// قاعدة الـ URL للـ API
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// إنشاء instance من axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 ثانية للملفات الكبيرة
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor لإضافة التوكن إلى كل طلب
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor للتعامل مع انتهاء صلاحية التوكن
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    // إرجاع البيانات مباشرة
    return response.data;
  },
  async (error) => {
    console.error('API Error:', error.response?.status, error.config?.url, error.response?.data);
    
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          console.log('Attempting to refresh token...');
          
          const response = await axios.post(`${BASE_URL}/accounts/token/refresh/`, {
            refresh: refreshToken
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          // إعادة محاولة الطلب الأصلي مع التوكن الجديد
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // فشل في تجديد التوكن، توجيه المستخدم لتسجيل الدخول
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        // تحقق من وجود window قبل التوجيه
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;