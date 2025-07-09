import api from "@/config/api/api"
import { USER_NOTIFICATION_API_ROUTES } from "@/routes/api/user/notification"

export interface Notification {
  notificationId: number
  username: string
  userFullName: string
  title: string
  message: string
  notificationType: string
  isRead: boolean
  createdAt: string
  relatedEntityType: string
  relatedEntityId: number
}

export interface NotificationResponse {
  success: boolean
  message: string | null
  data: Notification[]
}

export interface MarkAsReadResponse {
  success: boolean
  message: string | null
  data: any
}

export interface DeleteNotificationResponse {
  success: boolean
  message: string | null
  data: any
}

export interface CreateNotificationRequest {
  username: string
  title: string
  message: string
  notificationType: string
  relatedEntityType: string
  relatedEntityId: number
}

export interface CreateNotificationResponse {
  success: boolean
  message: string | null
  data: any
}

export const userNotificationService = {
  getByUsername: async (username: string): Promise<NotificationResponse> => {
    const response = await api.get(
      `${USER_NOTIFICATION_API_ROUTES.GET_BY_USERNAME}?username=${encodeURIComponent(username)}`,
    )
    return response.data
  },

  markAsRead: async (notificationId: number): Promise<MarkAsReadResponse> => {
    const response = await api.put(`${USER_NOTIFICATION_API_ROUTES.MARK_AS_READ}?notificationId=${notificationId}`)
    return response.data
  },

  markAllAsRead: async (username: string): Promise<MarkAsReadResponse> => {
    const response = await api.put(
      `${USER_NOTIFICATION_API_ROUTES.MARK_ALL_AS_READ}?username=${encodeURIComponent(username)}`,
    )
    return response.data
  },

  deleteNotification: async (notificationId: number): Promise<DeleteNotificationResponse> => {
    const response = await api.delete(`${USER_NOTIFICATION_API_ROUTES.DELETE}?notificationId=${notificationId}`)
    return response.data
  },

  createNotification: async (notification: CreateNotificationRequest): Promise<CreateNotificationResponse> => {
    const response = await api.post(USER_NOTIFICATION_API_ROUTES.CREATE, notification)
    return response.data
  },
}
