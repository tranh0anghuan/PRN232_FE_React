import api from "@/config/api/api";
import { ADMIN_COMMUNITY_API_ROUTES } from "@/routes/api/admin/community";

export const communityService = {
  getAllCommunities: async () => {
    const response = await api.get(ADMIN_COMMUNITY_API_ROUTES.GET_ALL);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(
      `${ADMIN_COMMUNITY_API_ROUTES.GET_BY_ID}?communityId=${id}`
    );
    return response.data;
  },

  createCommunity: async (communityData: {
    name: string;
    description: string;
    category: string;
    communityImage: File | null;
    isPrivate: boolean;
    createdBy: string;
  }) => {
    const formData = new FormData();
    formData.append("Name", communityData.name);
    formData.append("Description", communityData.description);
    formData.append("Category", communityData.category);
    formData.append("IsPrivate", communityData.isPrivate.toString());
    formData.append("CreatedBy", communityData.createdBy);

    if (communityData.communityImage) {
      formData.append("CommunityImage", communityData.communityImage);
    }

    const response = await api.post(
      ADMIN_COMMUNITY_API_ROUTES.CREATE,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  updateCommunity: async (communityData: {
    communityId: number;
    name: string;
    description: string;
    category: string;
    communityImage: File | null;
    isPrivate: boolean;
    isActive: boolean;
  }) => {
    const formData = new FormData();
    formData.append("CommunityId", communityData.communityId.toString());
    formData.append("Name", communityData.name);
    formData.append("Description", communityData.description);
    formData.append("Category", communityData.category);
    formData.append("IsPrivate", communityData.isPrivate.toString());
    formData.append("IsActive", communityData.isActive.toString());

    if (communityData.communityImage) {
      formData.append("CommunityImage", communityData.communityImage);
    }

    const response = await api.put(
      ADMIN_COMMUNITY_API_ROUTES.UPDATE,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  deleteCommunity: async (id: number) => {
    const response = await api.delete(
      `${ADMIN_COMMUNITY_API_ROUTES.DELETE}?communityId=${id}`
    );
    return response.data;
  },
};
