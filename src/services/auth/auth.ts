import Cookies from 'js-cookie';
import api from '../../config/api/api';

export const login = async (email: string, password: string) => {
  const res = await api.post('/auth/login', { email, password });
  const { refreshToken } = res.data;

  Cookies.set('refreshToken', refreshToken, {
    secure: true,
    sameSite: 'Strict',
  });
};

export const logout = () => {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
  window.location.href = '/login';
};

