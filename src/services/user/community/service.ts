import api from "@/config/api/api";
import { USER_COMMUNITY_API_ROUTES } from "@/routes/api/user/community";

export interface Community {
  communityId: number;
  name: string;
  description: string;
  communityImage: string;
  category: string;
  isPrivate: boolean;
  createdBy: string;
  creatorFullName: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  memberCount: number;
  postCount: number;
}

export interface CommunityResponse {
  success: boolean;
  message: string | null;
  data: Community[];
}

export interface CommunityMember {
  memberId: number;
  communityId: number;
  communityName: string;
  username: string;
  userFullName: string;
  role: string;
  joinedAt: string;
  isActive: boolean;
}

export interface CommunityMemberResponse {
  success: boolean;
  message: string | null;
  data: CommunityMember[];
}

export interface CommunityPost {
  postId: number;
  communityId: number;
  communityName: string;
  username: string;
  userFullName: string;
  title: string;
  content: string;
  mediaUrl: string | null;
  postType: string;
  likesCount: number;
  commentsCount: number;
  isPinned: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityPostResponse {
  success: boolean;
  message: string | null;
  data: CommunityPost[];
}

export interface CommunityDetailResponse {
  success: boolean;
  message: string | null;
  data: Community;
}

export const userCommunityService = {
  getAllCommunities: async (): Promise<CommunityResponse> => {
    const response = await api.get(USER_COMMUNITY_API_ROUTES.GET_ALL);
    return response.data;
  },

  getUserMemberships: async (
    username: string
  ): Promise<CommunityMemberResponse> => {
    const response = await api.get(
      `${USER_COMMUNITY_API_ROUTES.GET_USER_MEMBERSHIPS}?username=${username}`
    );
    return response.data;
  },

  getById: async (id: number): Promise<CommunityDetailResponse> => {
    const response = await api.get(
      `${USER_COMMUNITY_API_ROUTES.GET_BY_ID}?communityId=${id}`
    );
    return response.data;
  },

  getPostsByCommunityId: async (id: number): Promise<CommunityPostResponse> => {
    const response = await api.get(
      `${USER_COMMUNITY_API_ROUTES.GET_POSTS_BY_COMMUNITY}?communityId=${id}`
    );
    return response.data;
  },

  joinCommunity: async (communityId: number, username: string) => {
    const response = await api.post(USER_COMMUNITY_API_ROUTES.JOIN_COMMUNITY, {
      communityId,
      username,
      role: "Member",
    });
    return response.data;
  },

  leaveCommunity: async (communityId: number, username: string) => {
    const response = await api.delete(
      `${
        USER_COMMUNITY_API_ROUTES.LEAVE_COMMUNITY
      }?username=${encodeURIComponent(username)}&communityId=${communityId}`
    );
    return response.data;
  },
};
