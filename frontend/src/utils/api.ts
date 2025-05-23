import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3002/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 如果响应包含data字段，返回data，否则返回整个响应
    return response.data ? response.data : response;
  },
  (error) => {
    if (error.response) {
        // 请求已发出，服务器响应了状态码，但状态码超出了2xx的范围
        if (error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
      // 处理后端返回的错误
      const message = error.response.data?.message || '请求失败';
      console.error('API Error:', message);
    } else if (error.request) {
      // 请求发出但没有收到响应
      console.error('No response received:', error.request);
    } else {
      // 请求配置出错
      console.error('Request config error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;