import Cookies from "js-cookie";
import api from "../../config/api/api";
import { AUTH_API_ROUTES } from "@/routes/api/auth/auth";

export const login = async (email: string, password: string) => {
  const res = await api.post(AUTH_API_ROUTES.LOGIN, { email, password });
  const { refreshToken, accessToken } = res.data;

  Cookies.set("accessToken", accessToken, {
    secure: true,
    sameSite: "Strict",
  });

  Cookies.set("refreshToken", refreshToken, {
    secure: true,
    sameSite: "Strict",
  });
  return res.data;
};

export const logout = () => {
  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
  window.location.href = "/login";
};
