import api from "@/config/api/api";
import { ADMIN_POST_API_ROUTES } from "@/routes/api/admin/post";

export const postService = {
  getAllPosts: async () => {
    const response = await api.get(ADMIN_POST_API_ROUTES.GET_ALL);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(
      `${ADMIN_POST_API_ROUTES.GET_BY_ID}?postId=${id}`
    );
    return response.data;
  },

  createPost: async (postData: {
    communityId: number;
    username: string;
    title: string;
    content: string;
    mediaFile: File | null;
    postType: string;
  }) => {
    const formData = new FormData();
    formData.append("CommunityId", postData.communityId.toString());
    formData.append("Username", postData.username);
    formData.append("Title", postData.title);
    formData.append("Content", postData.content);
    formData.append("PostType", postData.postType);

    if (postData.mediaFile) {
      formData.append("MediaFile", postData.mediaFile);
    }

    const response = await api.post(ADMIN_POST_API_ROUTES.CREATE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  updatePost: async (postData: {
    postId: number;
    title: string;
    content: string;
    mediaFile: File | null;
    postType: string;
    isPinned: boolean;
    isActive: boolean;
  }) => {
    const formData = new FormData();
    formData.append("PostId", postData.postId.toString());
    formData.append("Title", postData.title);
    formData.append("Content", postData.content);
    formData.append("PostType", postData.postType);
    formData.append("IsPinned", postData.isPinned.toString());
    formData.append("IsActive", postData.isActive.toString());

    if (postData.mediaFile) {
      formData.append("MediaFile", postData.mediaFile);
    }

    const response = await api.put(ADMIN_POST_API_ROUTES.UPDATE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  deletePost: async (id: number) => {
    const response = await api.delete(
      `${ADMIN_POST_API_ROUTES.DELETE}?postId=${id}`
    );
    return response.data;
  },
};
