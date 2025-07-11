import api from "@/config/api/api";
import { ADMIN_BLOG_POST_API_ROUTES } from "@/routes/api/admin/blog-post";

export interface BlogPost {
  blogId: number
  authorUsername: string
  title: string
  content: string
  featuredImage: string
  summary: string
  category: string
  tags: string
  viewCount: number
  isPublished: boolean
  publishedAt: string
  createdAt: string
  updatedAt: string
}


export const blogPostService = {
  getAllBlogPost: async () => {
    const response = await api.get(ADMIN_BLOG_POST_API_ROUTES.GET_ALL);
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(
      `${ADMIN_BLOG_POST_API_ROUTES.GET_BY_ID}/${id}`
    );
    return response.data;
  },
  createBlogPost: async (blogPostData: {
    authorUsername: string;
    title: string;
    content: string;
    featuredImage: string;
    summary: string;
    category: string;
    tags: string;
  }) => {
    const response = await api.post(
      ADMIN_BLOG_POST_API_ROUTES.CREATE,
      blogPostData
    );
    return response.data;
  },
  updateBlogPost: async (
    id: number,
    blogPostData: {
      title: string;
      content: string;
      featuredImage: string;
      summary: string;
      category: string;
      tags: string;
      isPublished: boolean;
      publishedAt: string | null;
    }
  ) => {
    const response = await api.put(
      `${ADMIN_BLOG_POST_API_ROUTES.UPDATE}/${id}`,
      blogPostData
    );
    return response.data;
  },

  deleteBlogPost: async (id: number) => {
    const response = await api.delete(
      `${ADMIN_BLOG_POST_API_ROUTES.DELETE}/${id}`
    );
    return response.data;
  },
};
