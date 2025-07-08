import api from "@/config/api/api";
import { USER_NOTIFICATION_SETTINGS_API_ROUTES } from "@/routes/api/user/notification/settings";

export interface NotificationSettings {
  username: string;
  userFullName: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  dailyReminders: boolean;
  weeklyReports: boolean;
  achievementNotifications: boolean;
  communityNotifications: boolean;
  preferredTime: string;
  updatedAt: string;
}

export interface NotificationSettingsResponse {
  success: boolean;
  message: string | null;
  data: NotificationSettings;
}

export interface UpdateNotificationSettingsRequest {
  username: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  dailyReminders: boolean;
  weeklyReports: boolean;
  achievementNotifications: boolean;
  communityNotifications: boolean;
  preferredTime: string;
}

export interface UpdateNotificationSettingsResponse {
  success: boolean;
  message: string | null;
  data: any;
}

export interface CreateNotificationSettingsRequest {
  username: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  dailyReminders: boolean;
  weeklyReports: boolean;
  achievementNotifications: boolean;
  communityNotifications: boolean;
  preferredTime: string;
}

export interface CreateNotificationSettingsResponse {
  success: boolean;
  message: string | null;
  data: any;
}

export const userNotificationSettingsService = {
  getByUsername: async (
    username: string
  ): Promise<NotificationSettingsResponse> => {
    const response = await api.get(
      `${
        USER_NOTIFICATION_SETTINGS_API_ROUTES.GET_BY_USERNAME
      }?username=${encodeURIComponent(username)}`
    );
    return response.data;
  },

  createSettings: async (
    settings: CreateNotificationSettingsRequest
  ): Promise<CreateNotificationSettingsResponse> => {
    const response = await api.post(
      USER_NOTIFICATION_SETTINGS_API_ROUTES.CREATE,
      settings
    );
    return response.data;
  },

  updateSettings: async (
    settings: UpdateNotificationSettingsRequest
  ): Promise<UpdateNotificationSettingsResponse> => {
    const response = await api.put(
      USER_NOTIFICATION_SETTINGS_API_ROUTES.UPDATE,
      settings
    );
    return response.data;
  },
};
