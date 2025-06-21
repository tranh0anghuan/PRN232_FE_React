import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: 'https://localhost:7038/api',
  withCredentials: true, // Needed to send cookies
});

// Request: attach accessToken to header
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response: refresh token if 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = Cookies.get('refreshToken');
        const { data } = await axios.post(
          'https://localhost:7038/api/Authen/refresh-token',
          refreshToken,
          { withCredentials: true }
        );

        Cookies.set('accessToken', data.accessToken);
        Cookies.set('refreshToken', data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (err) {
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
