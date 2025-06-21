import Cookies from 'js-cookie';
import {jwtDecode} from 'jwt-decode';

type DecodedToken = {
  FullName: string;
  NameIdentifier: string;
  Email: string;
  RoleId: string | number;
  [key: string]: any;
};

export const getUserFromToken = () => {
  const token = Cookies.get('accessToken');
  if (!token) return null;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return {
      username: decoded.NameIdentifier,
      fullName: decoded.FullName,
      email: decoded.Email,
      roleId: Number(decoded.RoleId),
    };
  } catch {
    return null;
  }
};

export const isLoggedIn = () => {
  const user = getUserFromToken();
  return !!user;
};

export const isAdmin = () => {
  const user = getUserFromToken();
  return user?.roleId === 3;
};
