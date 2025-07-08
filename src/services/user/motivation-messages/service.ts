import api from "@/config/api/api";
import { USER_MOTIVATIONAL_API_ROUTES } from "@/routes/api/user/motivation-messages";

export interface MotivationalMessage {
  messageId: number;
  content: string;
  category: string;
  author: string;
  quitPhase: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MotivationalMessageResponse {
  success: boolean;
  message: string | null;
  data: MotivationalMessage[];
}

export const userMotivationalService = {
  getAllMessages: async (): Promise<MotivationalMessageResponse> => {
    const response = await api.get(USER_MOTIVATIONAL_API_ROUTES.GET_ALL);
    return response.data;
  },
};
