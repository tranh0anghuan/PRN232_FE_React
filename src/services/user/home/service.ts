import api from "@/config/api/api";
import { USER_HOME_API_ROUTES } from "@/routes/api/user/home";

export interface FeaturedBlog {
  blogId: number;
  title: string;
  summary: string;
  featuredImage: string;
  authorUsername: string;
  category: string;
  tags: string[];
  viewCount: number;
  publishedAt: string;
}

export interface Achievement {
  achievementId: number;
  achievementName: string;
  description: string;
  iconUrl: string | null;
  awardedDate: string;
}

export interface TopAchievement {
  username: string;
  totalAchievements: number;
  recentAchievements: Achievement[];
  lastAchievementDate: string;
}

export interface MembershipPlan {
  planId: number;
  planName: string;
  description: string;
  price: number;
  durationDays: number;
  features: string;
  isActive: boolean;
}

export interface CategoryStat {
  category: string;
  count: number;
}

export interface BlogStats {
  totalBlogs: number;
  totalViews: number;
  blogsThisMonth: number;
  categoryStats: CategoryStat[];
}

export interface HomePageApiResponse {
  featuredBlogs: FeaturedBlog[];
  topAchievements: TopAchievement[];
  membershipPlans: MembershipPlan[];
  blogStats: BlogStats;
}

export const userHomePageService = {
  getAll: async (): Promise<HomePageApiResponse> => {
    const response = await api.get(USER_HOME_API_ROUTES.GET);
    return response.data;
  },
};
