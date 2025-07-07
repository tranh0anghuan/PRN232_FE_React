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
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText,
  Heart,
  MessageCircle,
  Pin,
  Edit,
  Trash2,
  ImageIcon,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { postService } from "@/services/admin/post/service";
import { getUserFromToken } from "@/utils/token/auth";

interface Post {
  postId: number;
  communityId: number;
  communityName: string;
  username: string;
  userFullName: string;
  title: string;
  content: string;
  mediaUrl: string;
  postType: string;
  likesCount: number;
  commentsCount: number;
  isPinned: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type SortField =
  | "title"
  | "communityName"
  | "username"
  | "postType"
  | "likesCount"
  | "commentsCount"
  | "isPinned"
  | "isActive"
  | "createdAt";
type SortOrder = "asc" | "desc";

export default function PostManagement() {
  const username = getUserFromToken()?.username;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [communityFilter, setCommunityFilter] = useState<string>("all");
  const [postTypeFilter, setPostTypeFilter] = useState<string>("all");
  const [pinnedFilter, setPinnedFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newPost, setNewPost] = useState({
    communityId: 0,
    username: username ?? "",
    title: "",
    content: "",
    mediaFile: null as File | null,
    postType: "text",
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [editPost, setEditPost] = useState({
    postId: 0,
    title: "",
    content: "",
    mediaFile: null as File | null,
    mediaUrl: "",
    postType: "text",
    isPinned: false,
    isActive: true,
  });

  const itemsPerPage = 10;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postService.getAllPosts();
      setPosts(response.data);
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

  const communities = useMemo(() => {
    const uniqueCommunities = [
      ...new Set(posts.map((post) => post.communityName)),
    ];
    return uniqueCommunities.filter(Boolean);
  }, [posts]);

  const postTypes = useMemo(() => {
    const uniqueTypes = [...new Set(posts.map((post) => post.postType))];
    return uniqueTypes.filter(Boolean);
  }, [posts]);

  const filteredAndSortedPosts = useMemo(() => {
    const filtered = posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.communityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.userFullName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && post.isActive) ||
        (statusFilter === "inactive" && !post.isActive);

      const matchesCommunity =
        communityFilter === "all" || post.communityName === communityFilter;

      const matchesPostType =
        postTypeFilter === "all" || post.postType === postTypeFilter;

      const matchesPinned =
        pinnedFilter === "all" ||
        (pinnedFilter === "pinned" && post.isPinned) ||
        (pinnedFilter === "unpinned" && !post.isPinned);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCommunity &&
        matchesPostType &&
        matchesPinned
      );
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
  }, [
    posts,
    searchTerm,
    statusFilter,
    communityFilter,
    postTypeFilter,
    pinnedFilter,
    sortField,
    sortOrder,
  ]);

  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedPosts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedPosts, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedPosts.length / itemsPerPage);

  const handleViewDetail = async (postId: number) => {
    try {
      setDetailLoading(true);
      const response = await postService.getById(postId);
      setSelectedPost(response.data || response);
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
      const response = await postService.createPost(newPost);
      setPosts([response, ...posts]);
      setCreateDialogOpen(false);
      setNewPost({
        communityId: 0,
        username: username ?? "",
        title: "",
        content: "",
        mediaFile: null,
        postType: "text",
      });
      toast.success("Đã tạo bài viết thành công");
      window.location.reload();
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
      await postService.updatePost({
        postId: editPost.postId,
        title: editPost.title,
        content: editPost.content,
        mediaFile: editPost.mediaFile,
        postType: editPost.postType,
        isPinned: editPost.isPinned,
        isActive: editPost.isActive,
      });

      // Update local state
      setPosts(
        posts.map((post) =>
          post.postId === editPost.postId
            ? {
                ...post,
                title: editPost.title,
                content: editPost.content,
                mediaUrl: editPost.mediaUrl,
                postType: editPost.postType,
                isPinned: editPost.isPinned,
                isActive: editPost.isActive,
                updatedAt: new Date().toISOString(),
              }
            : post
        )
      );

      setEditDialogOpen(false);
      toast.success("Đã cập nhật bài viết thành công");
      fetchPosts();
    } catch (error: any) {
      toast.error("Lỗi khi cập nhật bài viết", {
        description: error.response?.data?.message || "Có lỗi xảy ra",
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      return;
    }

    try {
      setDeleteLoading(postId);
      await postService.deletePost(postId);
      setPosts(posts.filter((post) => post.postId !== postId));
      toast.success("Đã xóa bài viết thành công");
    } catch (error: any) {
      toast.error("Lỗi khi xóa bài viết", {
        description: error.response?.data?.message || "Có lỗi xảy ra",
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  const openEditDialog = (post: Post) => {
    setEditPost({
      postId: post.postId,
      title: post.title,
      content: post.content,
      mediaFile: null,
      mediaUrl: post.mediaUrl,
      postType: post.postType,
      isPinned: post.isPinned,
      isActive: post.isActive,
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

  const getPostTypeIcon = (postType: string) => {
    switch (postType.toLowerCase()) {
      case "image":
        return <ImageIcon className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const stats = useMemo(() => {
    const total = posts.length;
    const active = posts.filter((p) => p.isActive).length;
    const inactive = posts.filter((p) => !p.isActive).length;
    const pinned = posts.filter((p) => p.isPinned).length;
    const totalLikes = posts.reduce((sum, post) => sum + post.likesCount, 0);
    const totalComments = posts.reduce(
      (sum, post) => sum + post.commentsCount,
      0
    );

    return {
      total,
      active,
      inactive,
      pinned,
      totalLikes,
      totalComments,
    };
  }, [posts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Quản lý Bài viết
            </h1>
            <p className="text-gray-600 mt-2">
              Quản lý các bài viết và nội dung trong hệ thống
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-purple-600! hover:bg-purple-700! text-white"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <FileText className="h-8 w-8 text-purple-600" />
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

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100">
                  <Heart className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Tổng lượt thích
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalLikes.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <MessageCircle className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Tổng bình luận
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalComments.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-gray-700 font-medium">
                  Tìm kiếm
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Tìm theo tiêu đề, nội dung..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-primary focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Trạng thái</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-gray-200 focus:border-primary focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="active">Đang hoạt động</SelectItem>
                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Cộng đồng</Label>
                <Select
                  value={communityFilter}
                  onValueChange={setCommunityFilter}
                >
                  <SelectTrigger className="border-gray-200 focus:border-primary focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {communities.map((community) => (
                      <SelectItem key={community} value={community}>
                        {community}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">
                  Loại bài viết
                </Label>
                <Select
                  value={postTypeFilter}
                  onValueChange={setPostTypeFilter}
                >
                  <SelectTrigger className="border-gray-200 focus:border-primary focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {postTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Ghim</Label>
                <Select value={pinnedFilter} onValueChange={setPinnedFilter}>
                  <SelectTrigger className="border-gray-200 focus:border-primary focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="pinned">Đã ghim</SelectItem>
                    <SelectItem value="unpinned">Chưa ghim</SelectItem>
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
        <Card className="border-0 shadow-lg">
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
                      onClick={() => handleSort("communityName")}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Cộng đồng</span>
                        {getSortIcon("communityName")}
                      </div>
                    </TableHead>

                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("postType")}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Loại</span>
                        {getSortIcon("postType")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("likesCount")}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Lượt thích</span>
                        {getSortIcon("likesCount")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("commentsCount")}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Bình luận</span>
                        {getSortIcon("commentsCount")}
                      </div>
                    </TableHead>
                    <TableHead>Trạng thái</TableHead>

                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPosts.map((post) => (
                    <TableRow key={post.postId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          {post.mediaUrl && (
                            <img
                              src={
                                post.mediaUrl ||
                                "/placeholder.svg?height=40&width=40"
                              }
                              alt={post.title}
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <div className="max-w-xs">
                            <div
                              className="font-semibold truncate flex items-center"
                              title={post.title}
                            >
                              {post.isPinned && (
                                <Pin className="w-4 h-4 text-yellow-500 mr-1" />
                              )}
                              {post.title}
                            </div>
                            <div
                              className="text-sm text-gray-500 truncate"
                              title={post.content}
                            >
                              {post.content}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-primary/20 text-primary bg-primary/5"
                        >
                          {post.communityName}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {getPostTypeIcon(post.postType)}
                          <span className="capitalize">{post.postType}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span className="font-semibold">
                            {post.likesCount.toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-4 h-4 text-blue-500" />
                          <span className="font-semibold">
                            {post.commentsCount.toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <Badge
                            variant={post.isActive ? "default" : "secondary"}
                            className={
                              post.isActive
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-gray-400"
                            }
                          >
                            {post.isActive ? "Hoạt động" : "Không hoạt động"}
                          </Badge>
                          {post.isPinned && (
                            <Badge
                              variant="outline"
                              className="border-yellow-200 text-yellow-700 bg-yellow-50"
                            >
                              <Pin className="w-3 h-3 mr-1" />
                              Đã ghim
                            </Badge>
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
                                onClick={() => handleViewDetail(post.postId)}
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
                                  Thông tin chi tiết của bài viết #{post.postId}
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
                                          {selectedPost.postId}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">
                                          Cộng đồng
                                        </Label>
                                        <p className="text-sm">
                                          {selectedPost.communityName}
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
                                        Nội dung
                                      </Label>
                                      <p className="text-sm whitespace-pre-wrap">
                                        {selectedPost.content}
                                      </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-semibold">
                                          Tác giả
                                        </Label>
                                        <p className="text-sm">
                                          {selectedPost.userFullName} (@
                                          {selectedPost.username})
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">
                                          Loại bài viết
                                        </Label>
                                        <p className="text-sm capitalize">
                                          {selectedPost.postType}
                                        </p>
                                      </div>
                                    </div>

                                    {selectedPost.mediaUrl && (
                                      <div>
                                        <Label className="font-semibold">
                                          Media
                                        </Label>
                                        <div className="mt-2">
                                          <img
                                            src={
                                              selectedPost.mediaUrl ||
                                              "/placeholder.svg"
                                            }
                                            alt="Post media"
                                            className="max-w-full h-auto rounded-lg border"
                                          />
                                        </div>
                                      </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-semibold">
                                          Lượt thích
                                        </Label>
                                        <p className="text-sm font-semibold text-red-600">
                                          {selectedPost.likesCount.toLocaleString()}{" "}
                                          lượt thích
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">
                                          Bình luận
                                        </Label>
                                        <p className="text-sm font-semibold text-blue-600">
                                          {selectedPost.commentsCount.toLocaleString()}{" "}
                                          bình luận
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

                                    <div className="flex space-x-4 pt-4">
                                      <Badge
                                        variant={
                                          selectedPost.isActive
                                            ? "default"
                                            : "secondary"
                                        }
                                        className={
                                          selectedPost.isActive
                                            ? "bg-green-500"
                                            : ""
                                        }
                                      >
                                        {selectedPost.isActive
                                          ? "Đang hoạt động"
                                          : "Không hoạt động"}
                                      </Badge>
                                      {selectedPost.isPinned && (
                                        <Badge
                                          variant="outline"
                                          className="border-yellow-200 text-yellow-700 bg-yellow-50"
                                        >
                                          <Pin className="w-3 h-3 mr-1" />
                                          Đã ghim
                                        </Badge>
                                      )}
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
                            onClick={() => handleDeletePost(post.postId)}
                            disabled={deleteLoading === post.postId}
                            className="w-full bg-red-400!"
                          >
                            {deleteLoading === post.postId ? (
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-1" />
                            ) : (
                              <Trash2 className="w-4 h-4 mr-1" />
                            )}
                            {deleteLoading === post.postId
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

        {/* Create Post Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo bài viết mới</DialogTitle>
              <DialogDescription>
                Điền thông tin để tạo bài viết mới
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="communityId">ID Cộng đồng</Label>
                  <Input
                    id="communityId"
                    type="number"
                    value={newPost.communityId}
                    onChange={(e) =>
                      setNewPost({
                        ...newPost,
                        communityId: Number.parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="Nhập ID cộng đồng"
                    className="border-gray-200 focus:border-primary focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Tên người dùng</Label>
                  <Input
                    disabled
                    value={username}
                    onChange={(e) =>
                      setNewPost({
                        ...newPost,
                        username: e.target.value,
                      })
                    }
                    placeholder="Nhập tên người dùng"
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
                    setNewPost({
                      ...newPost,
                      title: e.target.value,
                    })
                  }
                  placeholder="Nhập tiêu đề bài viết"
                  className="border-gray-200 focus:border-primary focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Nội dung</Label>
                <Textarea
                  id="content"
                  value={newPost.content}
                  onChange={(e) =>
                    setNewPost({
                      ...newPost,
                      content: e.target.value,
                    })
                  }
                  placeholder="Nhập nội dung bài viết"
                  className="border-gray-200 focus:border-primary focus:ring-primary/20 min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postType">Loại bài viết</Label>
                <Select
                  value={newPost.postType}
                  onValueChange={(value) =>
                    setNewPost({ ...newPost, postType: value })
                  }
                >
                  <SelectTrigger className="border-gray-200 focus:border-primary focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mediaFile">File media</Label>
                <Input
                  id="mediaFile"
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setNewPost({
                      ...newPost,
                      mediaFile: file,
                    });
                  }}
                  className="border-gray-200 focus:border-primary focus:ring-primary/20"
                />
                {newPost.mediaFile && (
                  <div className="mt-2">
                    {newPost.mediaFile.type.startsWith("image/") ? (
                      <img
                        src={
                          URL.createObjectURL(newPost.mediaFile) ||
                          "/placeholder.svg"
                        }
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gray-100 rounded-lg border flex items-center justify-center">
                        <Video className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setCreateDialogOpen(false);
                  setNewPost({
                    communityId: 0,
                    username: "",
                    title: "",
                    content: "",
                    mediaFile: null,
                    postType: "text",
                  });
                }}
                disabled={createLoading}
              >
                Hủy
              </Button>
              <Button
                onClick={handleCreatePost}
                disabled={
                  createLoading ||
                  !newPost.title ||
                  !newPost.content ||
                  !newPost.username ||
                  newPost.communityId === 0
                }
                className="bg-purple-600! hover:bg-purple-700! text-white"
              >
                {createLoading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                ) : null}
                {createLoading ? "Đang tạo..." : "Tạo bài viết"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Post Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa bài viết</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin bài viết #{editPost.postId}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editTitle">Tiêu đề</Label>
                <Input
                  id="editTitle"
                  value={editPost.title}
                  onChange={(e) =>
                    setEditPost({
                      ...editPost,
                      title: e.target.value,
                    })
                  }
                  placeholder="Nhập tiêu đề bài viết"
                  className="border-gray-200 focus:border-primary focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editContent">Nội dung</Label>
                <Textarea
                  id="editContent"
                  value={editPost.content}
                  onChange={(e) =>
                    setEditPost({
                      ...editPost,
                      content: e.target.value,
                    })
                  }
                  placeholder="Nhập nội dung bài viết"
                  className="border-gray-200 focus:border-primary focus:ring-primary/20 min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editPostType">Loại bài viết</Label>
                <Select
                  value={editPost.postType}
                  onValueChange={(value) =>
                    setEditPost({ ...editPost, postType: value })
                  }
                >
                  <SelectTrigger className="border-gray-200 focus:border-primary focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editMediaFile">File media</Label>
                <Input
                  id="editMediaFile"
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setEditPost({
                      ...editPost,
                      mediaFile: file,
                    });
                  }}
                  className="border-gray-200 focus:border-primary focus:ring-primary/20"
                />
                <div className="mt-2">
                  {editPost.mediaFile ? (
                    editPost.mediaFile.type.startsWith("image/") ? (
                      <img
                        src={
                          URL.createObjectURL(editPost.mediaFile) ||
                          "/placeholder.svg"
                        }
                        alt="New Preview"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gray-100 rounded-lg border flex items-center justify-center">
                        <Video className="w-8 h-8 text-gray-400" />
                      </div>
                    )
                  ) : editPost.mediaUrl ? (
                    <img
                      src={editPost.mediaUrl || "/placeholder.svg"}
                      alt="Current Media"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 rounded-lg border flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="editIsPinned"
                  checked={editPost.isPinned}
                  onChange={(e) =>
                    setEditPost({
                      ...editPost,
                      isPinned: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="editIsPinned">Ghim bài viết</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editPost.isActive}
                  onChange={(e) =>
                    setEditPost({
                      ...editPost,
                      isActive: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="editIsActive">Kích hoạt bài viết</Label>
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
                className="bg-purple-600! hover:bg-purple-700! text-white"
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
