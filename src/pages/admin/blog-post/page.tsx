/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText,
  Globe,
  Clock,
  BarChart3,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { blogPostService } from "@/services/admin/blog-post/service";

interface BlogPost {
  blogId: number;
  authorUsername: string;
  title: string;
  content: string;
  featuredImage: string;
  summary: string;
  category: string;
  tags: string;
  viewCount: number;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

type SortField =
  | "title"
  | "authorUsername"
  | "category"
  | "viewCount"
  | "isPublished"
  | "createdAt";
type SortOrder = "asc" | "desc";

export default function BlogPostManagement() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState<number | null>(null);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newPost, setNewPost] = useState({
    authorUsername: "",
    title: "",
    content: "",
    featuredImage: "",
    summary: "",
    category: "",
    tags: "",
  });

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [editPost, setEditPost] = useState({
    blogId: 0,
    authorUsername: "",
    title: "",
    content: "",
    featuredImage: "",
    summary: "",
    category: "",
    tags: "",
    isPublished: false as boolean,
    publishedAt: null as string | null,
  });

  const itemsPerPage = 10;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await blogPostService.getAllBlogPost();
      setPosts(response);
    } catch (error: any) {
      toast.error("Lỗi khi tải danh sách bài viết", {
        description: error.response?.data?.message || "Có lỗi xảy ra",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="w-4 h-4" />
    ) : (
      <ArrowDown className="w-4 h-4" />
    );
  };

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(posts.map((post) => post.category))];
    return uniqueCategories.filter(Boolean);
  }, [posts]);

  const filteredAndSortedPosts = useMemo(() => {
    const filtered = posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.authorUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && post.isPublished) ||
        (statusFilter === "draft" && !post.isPublished);

      const matchesCategory =
        categoryFilter === "all" || post.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === "createdAt") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [posts, searchTerm, statusFilter, categoryFilter, sortField, sortOrder]);

  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedPosts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedPosts, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedPosts.length / itemsPerPage);

  const handleViewDetail = async (blogId: number) => {
    try {
      setDetailLoading(true);
      const response = await blogPostService.getById(blogId);
      setSelectedPost(response);
    } catch (error: any) {
      toast.error("Lỗi khi tải chi tiết bài viết", {
        description: error.response?.data?.message || "Có lỗi xảy ra",
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreatePost = async () => {
    try {
      setCreateLoading(true);
      const response = await blogPostService.createBlogPost(newPost);
      setPosts([response, ...posts]);
      setCreateDialogOpen(false);
      setNewPost({
        authorUsername: "",
        title: "",
        content: "",
        featuredImage: "",
        summary: "",
        category: "",
        tags: "",
      });
      toast.success("Đã tạo bài viết thành công");
      fetchPosts(); // Refresh the list
    } catch (error: any) {
      toast.error("Lỗi khi tạo bài viết", {
        description: error.response?.data?.message || "Có lỗi xảy ra",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditPost = async () => {
    try {
      setEditLoading(true);
      await blogPostService.updateBlogPost(editPost.blogId, {
        title: editPost.title,
        content: editPost.content,
        featuredImage: editPost.featuredImage,
        summary: editPost.summary,
        category: editPost.category,
        tags: editPost.tags,
        isPublished: editPost.isPublished,
        publishedAt: editPost.publishedAt,
      });

      // Update local state
      setPosts(
        posts.map((post) =>
          post.blogId === editPost.blogId
            ? { ...post, ...editPost, updatedAt: new Date().toISOString() }
            : post
        )
      );

      setEditDialogOpen(false);
      toast.success("Đã cập nhật bài viết thành công");
      fetchPosts(); // Refresh the list
    } catch (error: any) {
      toast.error("Lỗi khi cập nhật bài viết", {
        description: error.response?.data?.message || "Có lỗi xảy ra",
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeletePost = async (blogId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      return;
    }

    try {
      setDeleteLoading(blogId);
      await blogPostService.deleteBlogPost(blogId);

      // Update local state
      setPosts(posts.filter((post) => post.blogId !== blogId));
      toast.success("Đã xóa bài viết thành công");
    } catch (error: any) {
      toast.error("Lỗi khi xóa bài viết", {
        description: error.response?.data?.message || "Có lỗi xảy ra",
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  const openEditDialog = (post: BlogPost) => {
    setEditPost({
      blogId: post.blogId,
      authorUsername: post.authorUsername,
      title: post.title,
      content: post.content,
      featuredImage: post.featuredImage,
      summary: post.summary,
      category: post.category,
      tags: post.tags,
      isPublished: post.isPublished,
      publishedAt: post.publishedAt,
    });
    setEditDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stats = useMemo(() => {
    const total = posts.length;
    const published = posts.filter((p) => p.isPublished).length;
    const drafts = posts.filter((p) => !p.isPublished).length;
    const totalViews = posts.reduce((sum, post) => sum + post.viewCount, 0);
    return { total, published, drafts, totalViews };
  }, [posts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Quản lý Blog Posts
            </h1>
            <p className="text-gray-600 mt-2">
              Quản lý và xuất bản các bài viết blog về sức khỏe
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-green-600! hover:bg-primary/90 text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Tạo bài viết mới
            </Button>
            <Button
              onClick={fetchPosts}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 bg-transparent"
            >
              Làm mới
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-health hover:shadow-health-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="feature-icon-green">
                  <FileText className="h-8 w-8" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Tổng bài viết
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-health hover:shadow-health-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="feature-icon-blue">
                  <Globe className="h-8 w-8" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Đã xuất bản
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.published}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-health hover:shadow-health-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="feature-icon-yellow">
                  <Clock className="h-8 w-8" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Bản nháp</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.drafts}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-health hover:shadow-health-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="feature-icon-purple">
                  <BarChart3 className="h-8 w-8" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Tổng lượt xem
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalViews.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-health">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-gray-700 font-medium">
                  Tìm kiếm
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Tìm theo tiêu đề, tác giả, nội dung..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-primary focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">
                  Trạng thái xuất bản
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-gray-200 focus:border-primary focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="published">Đã xuất bản</SelectItem>
                    <SelectItem value="draft">Bản nháp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Danh mục</Label>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="border-gray-200 focus:border-primary focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Kết quả</Label>
                <div className="text-sm text-gray-600 pt-2">
                  Hiển thị {paginatedPosts.length} /{" "}
                  {filteredAndSortedPosts.length} bài viết
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-0 shadow-health">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("title")}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Tiêu đề</span>
                        {getSortIcon("title")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("authorUsername")}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Tác giả</span>
                        {getSortIcon("authorUsername")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("category")}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Danh mục</span>
                        {getSortIcon("category")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("viewCount")}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Lượt xem</span>
                        {getSortIcon("viewCount")}
                      </div>
                    </TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("createdAt")}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Ngày tạo</span>
                        {getSortIcon("createdAt")}
                      </div>
                    </TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPosts.map((post) => (
                    <TableRow key={post.blogId}>
                      <TableCell className="font-medium">
                        <div className="max-w-xs">
                          <div
                            className="font-semibold truncate"
                            title={post.title}
                          >
                            {post.title}
                          </div>
                          <div
                            className="text-sm text-gray-500 truncate"
                            title={post.summary}
                          >
                            {post.summary}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{post.authorUsername}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-primary/20 text-primary bg-primary/5"
                        >
                          {post.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <BarChart3 className="w-4 h-4 text-gray-400" />
                          <span>{post.viewCount.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={post.isPublished ? "default" : "secondary"}
                          className={
                            post.isPublished
                              ? "bg-primary hover:bg-primary/90"
                              : ""
                          }
                        >
                          {post.isPublished ? "Đã xuất bản" : "Bản nháp"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(post.createdAt)}</div>
                          {post.publishedAt && (
                            <div className="text-gray-500">
                              Xuất bản: {formatDate(post.publishedAt)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-2">
                          {/* View Detail Button */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetail(post.blogId)}
                                className="w-full border-primary/20 text-primary hover:bg-primary/10"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Chi tiết
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Chi tiết bài viết</DialogTitle>
                                <DialogDescription>
                                  Thông tin chi tiết của bài viết #{post.blogId}
                                </DialogDescription>
                              </DialogHeader>
                              {detailLoading ? (
                                <div className="flex justify-center py-8">
                                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                                </div>
                              ) : (
                                selectedPost && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-semibold">
                                          ID
                                        </Label>
                                        <p className="text-sm">
                                          {selectedPost.blogId}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">
                                          Tác giả
                                        </Label>
                                        <p className="text-sm">
                                          {selectedPost.authorUsername}
                                        </p>
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="font-semibold">
                                        Tiêu đề
                                      </Label>
                                      <p className="text-sm">
                                        {selectedPost.title}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="font-semibold">
                                        Tóm tắt
                                      </Label>
                                      <p className="text-sm">
                                        {selectedPost.summary}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="font-semibold">
                                        Nội dung
                                      </Label>
                                      <div className="text-sm max-h-40 overflow-y-auto bg-gray-50 p-3 rounded">
                                        {selectedPost.content}
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-semibold">
                                          Danh mục
                                        </Label>
                                        <p className="text-sm">
                                          {selectedPost.category}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">
                                          Tags
                                        </Label>
                                        <p className="text-sm">
                                          {selectedPost.tags}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-semibold">
                                          Lượt xem
                                        </Label>
                                        <p className="text-sm">
                                          {selectedPost.viewCount.toLocaleString()}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">
                                          Ảnh đại diện
                                        </Label>
                                        <p
                                          className="text-sm truncate"
                                          title={selectedPost.featuredImage}
                                        >
                                          {selectedPost.featuredImage}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-semibold">
                                          Ngày tạo
                                        </Label>
                                        <p className="text-sm">
                                          {formatDate(selectedPost.createdAt)}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">
                                          Cập nhật lần cuối
                                        </Label>
                                        <p className="text-sm">
                                          {formatDate(selectedPost.updatedAt)}
                                        </p>
                                      </div>
                                    </div>
                                    {selectedPost.publishedAt && (
                                      <div>
                                        <Label className="font-semibold">
                                          Ngày xuất bản
                                        </Label>
                                        <p className="text-sm">
                                          {formatDate(selectedPost.publishedAt)}
                                        </p>
                                      </div>
                                    )}
                                    <div className="flex space-x-4 pt-4">
                                      <Badge
                                        variant={
                                          selectedPost.isPublished
                                            ? "default"
                                            : "secondary"
                                        }
                                      >
                                        {selectedPost.isPublished
                                          ? "Đã xuất bản"
                                          : "Bản nháp"}
                                      </Badge>
                                    </div>
                                  </div>
                                )
                              )}
                            </DialogContent>
                          </Dialog>

                          {/* Edit Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(post)}
                            className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Chỉnh sửa
                          </Button>

                          {/* Delete Button */}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePost(post.blogId)}
                            disabled={deleteLoading === post.blogId}
                            className="w-full bg-red-400!"
                          >
                            {deleteLoading === post.blogId ? (
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-1" />
                            ) : (
                              <Trash2 className="w-4 h-4 mr-1" />
                            )}
                            {deleteLoading === post.blogId
                              ? "Đang xóa..."
                              : "Xóa"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {paginatedPosts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Không tìm thấy bài viết nào phù hợp với bộ lọc
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(pageNum);
                        }}
                        isActive={currentPage === pageNum}
                        className={
                          currentPage === pageNum
                            ? "bg-primary text-white hover:bg-primary/90"
                            : ""
                        }
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages)
                        setCurrentPage(currentPage + 1);
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Create Blog Post Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo bài viết mới</DialogTitle>
              <DialogDescription>
                Điền thông tin để tạo bài viết blog mới
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="authorUsername">Tác giả</Label>
                  <Input
                    id="authorUsername"
                    value={newPost.authorUsername}
                    onChange={(e) =>
                      setNewPost({ ...newPost, authorUsername: e.target.value })
                    }
                    placeholder="Nhập tên tác giả"
                    className="border-gray-200 focus:border-primary focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Danh mục</Label>
                  <Input
                    id="category"
                    value={newPost.category}
                    onChange={(e) =>
                      setNewPost({ ...newPost, category: e.target.value })
                    }
                    placeholder="Nhập danh mục"
                    className="border-gray-200 focus:border-primary focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề</Label>
                <Input
                  id="title"
                  value={newPost.title}
                  onChange={(e) =>
                    setNewPost({ ...newPost, title: e.target.value })
                  }
                  placeholder="Nhập tiêu đề bài viết"
                  className="border-gray-200 focus:border-primary focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Tóm tắt</Label>
                <Input
                  id="summary"
                  value={newPost.summary}
                  onChange={(e) =>
                    setNewPost({ ...newPost, summary: e.target.value })
                  }
                  placeholder="Nhập tóm tắt bài viết"
                  className="border-gray-200 focus:border-primary focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="featuredImage">Ảnh đại diện (URL)</Label>
                <Input
                  id="featuredImage"
                  value={newPost.featuredImage}
                  onChange={(e) =>
                    setNewPost({ ...newPost, featuredImage: e.target.value })
                  }
                  placeholder="Nhập URL ảnh đại diện"
                  className="border-gray-200 focus:border-primary focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={newPost.tags}
                  onChange={(e) =>
                    setNewPost({ ...newPost, tags: e.target.value })
                  }
                  placeholder="Nhập tags (phân cách bằng dấu phẩy)"
                  className="border-gray-200 focus:border-primary focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Nội dung</Label>
                <textarea
                  id="content"
                  value={newPost.content}
                  onChange={(e) =>
                    setNewPost({ ...newPost, content: e.target.value })
                  }
                  placeholder="Nhập nội dung bài viết"
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-primary focus:ring-primary/20 focus:outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={createLoading}
              >
                Hủy
              </Button>
              <Button
                onClick={handleCreatePost}
                disabled={createLoading || !newPost.title || !newPost.content}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {createLoading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                ) : null}
                {createLoading ? "Đang tạo..." : "Tạo bài viết"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Blog Post Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa bài viết</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin bài viết #{editPost.blogId}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editAuthorUsername">Tác giả</Label>
                  <Input
                    id="editAuthorUsername"
                    value={editPost.authorUsername}
                    disabled
                    className="border-gray-200 focus:border-primary focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editCategory">Danh mục</Label>
                  <Input
                    id="editCategory"
                    value={editPost.category}
                    onChange={(e) =>
                      setEditPost({ ...editPost, category: e.target.value })
                    }
                    placeholder="Nhập danh mục"
                    className="border-gray-200 focus:border-primary focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTitle">Tiêu đề</Label>
                <Input
                  id="editTitle"
                  value={editPost.title}
                  onChange={(e) =>
                    setEditPost({ ...editPost, title: e.target.value })
                  }
                  placeholder="Nhập tiêu đề bài viết"
                  className="border-gray-200 focus:border-primary focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSummary">Tóm tắt</Label>
                <Input
                  id="editSummary"
                  value={editPost.summary}
                  onChange={(e) =>
                    setEditPost({ ...editPost, summary: e.target.value })
                  }
                  placeholder="Nhập tóm tắt bài viết"
                  className="border-gray-200 focus:border-primary focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editFeaturedImage">Ảnh đại diện (URL)</Label>
                <Input
                  id="editFeaturedImage"
                  value={editPost.featuredImage}
                  onChange={(e) =>
                    setEditPost({ ...editPost, featuredImage: e.target.value })
                  }
                  placeholder="Nhập URL ảnh đại diện"
                  className="border-gray-200 focus:border-primary focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTags">Tags</Label>
                <Input
                  id="editTags"
                  value={editPost.tags}
                  onChange={(e) =>
                    setEditPost({ ...editPost, tags: e.target.value })
                  }
                  placeholder="Nhập tags (phân cách bằng dấu phẩy)"
                  className="border-gray-200 focus:border-primary focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editContent">Nội dung</Label>
                <textarea
                  id="editContent"
                  value={editPost.content}
                  onChange={(e) =>
                    setEditPost({ ...editPost, content: e.target.value })
                  }
                  placeholder="Nhập nội dung bài viết"
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-primary focus:ring-primary/20 focus:outline-none resize-none"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="editIsPublished"
                  checked={editPost.isPublished}
                  onChange={(e) =>
                    setEditPost({
                      ...editPost,
                      isPublished: e.target.checked,
                      publishedAt: e.target.checked
                        ? new Date().toISOString()
                        : null,
                    })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="editIsPublished">Xuất bản ngay</Label>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={editLoading}
              >
                Hủy
              </Button>
              <Button
                onClick={handleEditPost}
                disabled={editLoading || !editPost.title || !editPost.content}
                className="bg-blue-600! hover:bg-blue-700! text-white"
              >
                {editLoading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                ) : null}
                {editLoading ? "Đang cập nhật..." : "Cập nhật bài viết"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
