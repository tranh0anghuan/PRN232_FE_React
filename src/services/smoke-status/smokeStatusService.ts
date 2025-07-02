/* eslint-disable @typescript-eslint/no-explicit-any */
import { SMOKE_STATUS_API_ROUTES } from "@/routes/api/smoke-status/smokeStatus";
import api from "../../config/api/api";

export const smokeStatusService = {
  createStatus: async (statusData: any) => {
    const response = await api.post(SMOKE_STATUS_API_ROUTES.CREATE, statusData);
    return response.data;
  },

  getStatusByUserName: async (username: string) => {
    const response = await api.get(
      `${SMOKE_STATUS_API_ROUTES.GET_BY_USERNAME}/${username}`
    );
    return response.data;
  },

  getStatusById: async (id: number) => {
    const response = await api.get(
      `${SMOKE_STATUS_API_ROUTES.GET_BY_ID}/${id}`
    );
    return response.data;
  },

  updateStatusById: async (id: number, statusData: any) => {
    const response = await api.put(
      `${SMOKE_STATUS_API_ROUTES.GET_BY_ID}/${id}`,
      statusData
    );
    return response.data;
  },

  getCostById: async (id: number) => {
    const response = await api.get(
      SMOKE_STATUS_API_ROUTES.GET_COST_BY_ID.replace("{id}", id.toString())
    );
    return response.data;
  },

  getHealthImpactById: async (id: number) => {
    const response = await api.get(
      SMOKE_STATUS_API_ROUTES.GET_HEALTH_IMPACT_BY_ID.replace(
        "{id}",
        id.toString()
      )
    );
    return response.data;
  },
};
