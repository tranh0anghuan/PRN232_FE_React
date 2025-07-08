import api from "@/config/api/api";
import { COMMENT_API_ROUTES } from "@/routes/api/user/community/comment";

export interface Comment {
  commentId: number;
  postId: number;
  postTitle: string;
  username: string;
  userFullName: string;
  content: string;
  mediaUrl: string | null;
  likesCount: number;
  parentCommentId: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  replies: Comment[];
}

export interface CommentResponse {
  success: boolean;
  message: string | null;
  data: Comment[];
}

export interface CreateCommentData {
  postId: number;
  username: string;
  content: string;
  mediaFile?: File | null;
  parentCommentId?: number;
}

export interface UpdateCommentData {
  commentId: number;
  content: string;
  mediaFile?: File | null;
  isActive: boolean;
}

export const commentService = {
  getCommentsByPostId: async (postId: number): Promise<CommentResponse> => {
    const response = await api.get(
      `${COMMENT_API_ROUTES.GET_BY_POST}?postId=${postId}`
    );
    return response.data;
  },

  createComment: async (commentData: CreateCommentData) => {
    const formData = new FormData();
    formData.append("PostId", commentData.postId.toString());
    formData.append("Username", commentData.username);
    formData.append("Content", commentData.content);
    formData.append(
      "ParentCommentId",
      (commentData.parentCommentId || 0).toString()
    );

    if (commentData.mediaFile) {
      formData.append("MediaFile", commentData.mediaFile);
    }

    const response = await api.post(COMMENT_API_ROUTES.CREATE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  updateComment: async (commentData: UpdateCommentData) => {
    const formData = new FormData();
    formData.append("CommentId", commentData.commentId.toString());
    formData.append("Content", commentData.content);
    formData.append("IsActive", commentData.isActive.toString());

    if (commentData.mediaFile) {
      formData.append("MediaFile", commentData.mediaFile);
    }

    const response = await api.put(COMMENT_API_ROUTES.UPDATE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  deleteComment: async (commentId: number) => {
    const response = await api.delete(
      `${COMMENT_API_ROUTES.DELETE}?commentId=${commentId}`
    );
    return response.data;
  },
};
