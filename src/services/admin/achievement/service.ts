import api from "@/config/api/api";
import { ADMIN_ACHIEVEMENT_API_ROUTES } from "@/routes/api/admin/achievement";

export const achievementService = {
  getAllAchievements: async () => {
    const response = await api.get(ADMIN_ACHIEVEMENT_API_ROUTES.GET_ALL);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(
      `${ADMIN_ACHIEVEMENT_API_ROUTES.GET_BY_ID}/${id}`
    );
    return response.data;
  },

  createAchievement: async (achievementData: {
    name: string;
    description: string;
    category: string;
    pointsAwarded: number;
    badgeImage: File | null;
    criteria: string;
    thresholdValue: number;
  }) => {
    const formData = new FormData();
    formData.append("Name", achievementData.name);
    formData.append("Description", achievementData.description);
    formData.append("Category", achievementData.category);
    formData.append("PointsAwarded", achievementData.pointsAwarded.toString());
    formData.append("Criteria", achievementData.criteria);
    formData.append(
      "ThresholdValue",
      achievementData.thresholdValue.toString()
    );

    if (achievementData.badgeImage) {
      formData.append("BadgeImage", achievementData.badgeImage);
    }

    const response = await api.post(
      ADMIN_ACHIEVEMENT_API_ROUTES.CREATE,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  updateAchievement: async (achievementData: {
    achievementId: number;
    name: string;
    description: string;
    category: string;
    pointsAwarded: number;
    badgeImage: File | null;
    criteria: string;
    thresholdValue: number;
    isActive: boolean;
  }) => {
    const formData = new FormData();
    formData.append("AchievementId", achievementData.achievementId.toString());
    formData.append("Name", achievementData.name);
    formData.append("Description", achievementData.description);
    formData.append("Category", achievementData.category);
    formData.append("PointsAwarded", achievementData.pointsAwarded.toString());
    formData.append("Criteria", achievementData.criteria);
    formData.append(
      "ThresholdValue",
      achievementData.thresholdValue.toString()
    );
    formData.append("IsActive", achievementData.isActive.toString());

    if (achievementData.badgeImage) {
      formData.append("BadgeImage", achievementData.badgeImage);
    }

    const response = await api.put(
      ADMIN_ACHIEVEMENT_API_ROUTES.UPDATE,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  deleteAchievement: async (id: number) => {
    const response = await api.delete(
      `${ADMIN_ACHIEVEMENT_API_ROUTES.DELETE}?achievementId=${id}`
    );
    return response.data;
  },
};
