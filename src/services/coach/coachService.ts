/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../../config/api/api"
import { API_ENDPOINTS } from "../../config/api/api-endpoint"

export const coachService = {
  createProfile: async (profileData: any) => {
    const response = await api.post(API_ENDPOINTS.COACH_PROFILES.CREATE, profileData)
    return response.data
  },

  updateProfile: async (profileData: any) => {
    const response = await api.put(API_ENDPOINTS.COACH_PROFILES.UPDATE, profileData)
    return response.data
  },

  getProfileByUsername: async (username: string) => {
    const response = await api.get(
      `${API_ENDPOINTS.COACH_PROFILES.GET_BY_USERNAME}?username=${encodeURIComponent(username)}`,
    )
    return response.data
  },

  getAllProfiles: async () => {
    const response = await api.get(API_ENDPOINTS.COACH_PROFILES.GET_ALL)
    return response.data
  },

  verifyCoach: async (verifyData: any) => {
    const response = await api.put(API_ENDPOINTS.COACH_PROFILES.VERIFY, verifyData)
    return response.data
  },

  deleteProfile: async (username: string) => {
    const response = await api.delete(`${API_ENDPOINTS.COACH_PROFILES.DELETE}?username=${encodeURIComponent(username)}`)
    return response.data
  },
}
