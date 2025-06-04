
import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:5252",
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem('eduSyncUser');
    let token = null;
    
    if (userString) {
      try {
        const user = JSON.parse(userString);
        token = user.token;
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      hasToken: !!token
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default api;
