/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../../config/api/api"
import { API_ENDPOINTS } from "../../config/api/api-endpoint"

export const sessionService = {
  createSession: async (sessionData: any) => {
    const response = await api.post(API_ENDPOINTS.COACH_SESSIONS.CREATE, sessionData)
    return response.data
  },

  updateSession: async (sessionData: any) => {
    const response = await api.put(API_ENDPOINTS.COACH_SESSIONS.UPDATE, sessionData)
    return response.data
  },

  deleteSession: async (sessionId: any) => {
    const response = await api.delete(`${API_ENDPOINTS.COACH_SESSIONS.DELETE}?id=${sessionId}`)
    return response.data
  },

  joinSession: async (joinData: any) => {
    const response = await api.post(API_ENDPOINTS.COACH_SESSIONS.JOIN, joinData)
    return response.data
  },

  getAllSessions: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString()
    const response = await api.get(`${API_ENDPOINTS.COACH_SESSIONS.GET_ALL}?${queryParams}`)
    return response.data
  },

  getSessionById: async (sessionId: any) => {
    const response = await api.get(`${API_ENDPOINTS.COACH_SESSIONS.GET_BY_ID}?id=${sessionId}`)
    return response.data
  },
}
