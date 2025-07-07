import { QUIT_PLAN_API_ROUTES } from "@/routes/api/quit-plan"
import api from "../../config/api/api"

export interface PhaseActionResponse {
  message: string
}

export const quitPLanService = {
  autoGeneratePlan: async (data: any) => {
    const response = await api.post(QUIT_PLAN_API_ROUTES.AUTO_GENERATE, data)
    return response.data
  },
  getByUsername: async (username: string) => {
    const response = await api.get(`${QUIT_PLAN_API_ROUTES.GET_BY_USERNAME}/${username}`)
    return response.data
  },
  phases: {
    getByPlanId: async (id: number) => {
      const response = await api.get(`${QUIT_PLAN_API_ROUTES.PHASES.GET_BY_PLAN_ID}`.replace(":id", id.toString()))
      return response.data
    },
    startPhase: async (planId: number, phaseId: number): Promise<PhaseActionResponse> => {
      const response = await api.post(
        QUIT_PLAN_API_ROUTES.PHASES.START_PHASE.replace(":planId", planId.toString()).replace(
          ":phaseId",
          phaseId.toString(),
        ),
      )
      return response.data
    },
    completePhase: async (planId: number, phaseId: number): Promise<PhaseActionResponse> => {
      const response = await api.post(
        QUIT_PLAN_API_ROUTES.PHASES.COMPLETE_PHASE.replace(":planId", planId.toString()).replace(
          ":phaseId",
          phaseId.toString(),
        ),
      )
      return response.data
    },
  },
}
