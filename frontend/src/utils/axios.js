import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user?.token) {
          config.headers['Authorization'] = `Bearer ${user.token}`;
        }
      } catch (e) { /* ignore parse errors */ }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
