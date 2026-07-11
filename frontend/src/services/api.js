import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Zid token automatiquement f kol request
// Ychek fi localStorage w sessionStorage el 2
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Bonus: ken el token expired (401), fasa5 el storage w rj3ou l login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;