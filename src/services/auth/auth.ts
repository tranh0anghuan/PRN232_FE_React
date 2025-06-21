import Cookies from "js-cookie"
import api from "../../config/api/api"
import { AUTH_API_ROUTES } from "@/routes/api/auth/auth"

export const login = async (email: string, password: string) => {
  const res = await api.post(AUTH_API_ROUTES.LOGIN, { email, password })
  const { refreshToken, accessToken } = res.data

  Cookies.set("accessToken", accessToken, {
    secure: true,
    sameSite: "Strict",
  })

  Cookies.set("refreshToken", refreshToken, {
    secure: true,
    sameSite: "Strict",
  })
  return res.data
}

export const register = async (userData: {
  username: string
  email: string
  password: string
  fullName: string
  dateOfBirth: string
  gender: string
  phoneNumber: string
  avatarFile?: File
}) => {
  const formData = new FormData()

  // Append all the required fields
  formData.append("Username", userData.username)
  formData.append("Email", userData.email)
  formData.append("Password", userData.password)
  formData.append("FullName", userData.fullName)
  formData.append("DateOfBirth", userData.dateOfBirth)
  formData.append("Gender", userData.gender)
  formData.append("PhoneNumber", userData.phoneNumber)

  // Append avatar file if provided
  if (userData.avatarFile) {
    formData.append("avatarFile", userData.avatarFile)
  }

  const res = await api.post(AUTH_API_ROUTES.REGISTER, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return res.data
}

export const logout = () => {
  Cookies.remove("accessToken")
  Cookies.remove("refreshToken")
  window.location.href = "/login"
}
