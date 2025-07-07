import api from "@/config/api/api";
import { PROGRESS_TRACKING_API_ROUTES } from "@/routes/api/progress-tracking";
import type {
  HealthImprovement,
  ProgressSummary,
  ProgressTrackingEntry,
} from "./type";

export interface PhaseActionResponse {
  message: string;
}

export interface QuitPlan {
  id: number;
  username: string;
  planName: string;
  createdDate: string;
  isActive: boolean;
  phases: QuitPlanPhase[];
}

export interface QuitPlanPhase {
  id: number;
  planId: number;
  phaseName: string;
  description: string;
  startDate?: string;
  endDate?: string;
  isCompleted: boolean;
  isActive: boolean;
  order: number;
}

export const progressTrackingService = {
  entry: {
    create: async (data: Omit<ProgressTrackingEntry, "id">) => {
      const response = await api.post(
        PROGRESS_TRACKING_API_ROUTES.ENTRY.CREATE,
        data
      );
      return response.data;
    },
    getById: async (id: number) => {
      const response = await api.get(
        PROGRESS_TRACKING_API_ROUTES.ENTRY.GET_BY_ID.replace(
          ":id",
          id.toString()
        )
      );
      return response.data;
    },
    update: async (id: number, data: Partial<ProgressTrackingEntry>) => {
      const response = await api.put(
        PROGRESS_TRACKING_API_ROUTES.ENTRY.UPDATE.replace(":id", id.toString()),
        data
      );
      return response.data;
    },
    delete: async (id: number) => {
      await api.delete(
        PROGRESS_TRACKING_API_ROUTES.ENTRY.DELETE.replace(":id", id.toString())
      );
    },
  },
  user: {
    getEntries: async (
      username: string,
      startDate?: string,
      endDate?: string
    ): Promise<ProgressTrackingEntry[]> => {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      const query = params.toString() ? `?${params.toString()}` : "";
      const response = await api.get(
        `${PROGRESS_TRACKING_API_ROUTES.USER.GET_ENTRIES.replace(
          ":username",
          username
        )}${query}`
      );
      return response.data;
    },
    getSummary: async (
      username: string,
      startDate?: string,
      endDate?: string
    ): Promise<ProgressSummary> => {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      const query = params.toString() ? `?${params.toString()}` : "";
      const response = await api.get(
        `${PROGRESS_TRACKING_API_ROUTES.USER.GET_SUMMARY.replace(
          ":username",
          username
        )}${query}`
      );
      return response.data;
    },
    checkDateEntry: async (
      username: string,
      date: string
    ): Promise<ProgressTrackingEntry | null> => {
      try {
        const response = await api.get(
          `${PROGRESS_TRACKING_API_ROUTES.USER.CHECK_DATE_ENTRY.replace(
            ":username",
            username
          )}?date=${date}`
        );
        return response.data;
      } catch (error) {
        return null;
      }
    },
  },
  improvements: {
    getAll: async (username: string): Promise<HealthImprovement[]> => {
      const response = await api.get(
        PROGRESS_TRACKING_API_ROUTES.IMPROVEMENTS.GET_ALL.replace(
          ":username",
          username
        )
      );
      return response.data;
    },
    getUnacknowledged: async (
      username: string
    ): Promise<HealthImprovement[]> => {
      const response = await api.get(
        PROGRESS_TRACKING_API_ROUTES.IMPROVEMENTS.GET_UNACKNOWLEDGED.replace(
          ":username",
          username
        )
      );
      return response.data;
    },
    acknowledge: async (username: string, improvementId: number) => {
      await api.patch(
        PROGRESS_TRACKING_API_ROUTES.IMPROVEMENTS.ACKNOWLEDGE.replace(
          ":username",
          username
        ).replace(":improvementId", improvementId.toString())
      );
    },
  },
};
