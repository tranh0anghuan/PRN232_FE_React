/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../../config/api/api"
import { API_ENDPOINTS } from "../../config/api/api-endpoint"

export const ratingService = {
  createRating: async (ratingData: any) => {
    const response = await api.post(API_ENDPOINTS.RATINGS.CREATE, ratingData)
    return response.data
  },

  getRatingById: async (ratingId: any) => {
    const response = await api.get(`${API_ENDPOINTS.RATINGS.GET_BY_ID}?id=${ratingId}`)
    return response.data
  },
}
