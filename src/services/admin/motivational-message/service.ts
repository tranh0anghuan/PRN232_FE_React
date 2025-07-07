import api from "@/config/api/api";
import { ADMIN_MOTIVATIONAL_MESSAGE_API_ROUTES } from "@/routes/api/admin/motivational-message";

export const motivationalMessageService = {
  getAllMessages: async () => {
    const response = await api.get(
      ADMIN_MOTIVATIONAL_MESSAGE_API_ROUTES.GET_ALL
    );
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(
      `${ADMIN_MOTIVATIONAL_MESSAGE_API_ROUTES.GET_BY_ID}?messageId=${id}`
    );
    return response.data;
  },

  createMessage: async (messageData: {
    content: string;
    category: string;
    author: string;
    quitPhase: string;
  }) => {
    const response = await api.post(
      ADMIN_MOTIVATIONAL_MESSAGE_API_ROUTES.CREATE,
      {
        content: messageData.content,
        category: messageData.category,
        author: messageData.author,
        quitPhase: messageData.quitPhase,
      }
    );
    return response.data;
  },

  updateMessage: async (messageData: {
    messageId: number;
    content: string;
    category: string;
    author: string;
    quitPhase: string;
    isActive: boolean;
  }) => {
    const response = await api.put(
      ADMIN_MOTIVATIONAL_MESSAGE_API_ROUTES.UPDATE,
      {
        messageId: messageData.messageId,
        content: messageData.content,
        category: messageData.category,
        author: messageData.author,
        quitPhase: messageData.quitPhase,
        isActive: messageData.isActive,
      }
    );
    return response.data;
  },

  deleteMessage: async (id: number) => {
    const response = await api.delete(
      `${ADMIN_MOTIVATIONAL_MESSAGE_API_ROUTES.DELETE}?messageId=${id}`
    );
    return response.data;
  },
};
