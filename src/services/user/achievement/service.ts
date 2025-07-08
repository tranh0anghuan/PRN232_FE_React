import api from "@/config/api/api"
import { USER_ACHIEVEMENT_API_ROUTES } from "@/routes/api/user/achievement"

export interface Achievement {
  achievementId: number
  name: string
  description: string
  category: string
  pointsAwarded: number
  badgeImage: string
  criteria: string
  thresholdValue: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AchievementResponse {
  success: boolean
  message: string | null
  data: Achievement[]
}

export interface UserAchievement {
  userAchievementId: number
  achievementId: number
  achievementName: string
  username: string
  userFullName: string
  awardedAt: string
  reason: string
}

export interface UserAchievementResponse {
  success: boolean
  message: string | null
  data: UserAchievement[]
}

export interface AwardAchievementRequest {
  username: string
  achievementId: number
  reason: string
}

export interface AwardAchievementResponse {
  success: boolean
  message: string | null
  data: any
}

export const userAchievementService = {
  getAllAchievements: async (): Promise<AchievementResponse> => {
    const response = await api.get(USER_ACHIEVEMENT_API_ROUTES.GET_ALL)
    return response.data
  },

  getUserAchievements: async (username: string): Promise<UserAchievementResponse> => {
    const response = await api.get(
      `${USER_ACHIEVEMENT_API_ROUTES.GET_USER_ACHIEVEMENTS}?username=${encodeURIComponent(username)}`,
    )
    return response.data
  },

  awardAchievement: async (
    achievementId: number,
    username: string,
    reason = "Manual claim",
  ): Promise<AwardAchievementResponse> => {
    const response = await api.post(USER_ACHIEVEMENT_API_ROUTES.AWARD_ACHIEVEMENT, {
      username,
      achievementId,
      reason,
    })
    return response.data
  },
}
