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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users,
  MessageSquare,
  Globe,
  Lock,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { communityService } from "@/services/admin/commnunity/service";

interface Community {
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

type SortField =
  | "name"
  | "category"
  | "createdBy"
  | "memberCount"
  | "postCount"
  | "isPrivate"
  | "isActive"
  | "createdAt";
type SortOrder = "asc" | "desc";

export default function CommunityManagement() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [privacyFilter, setPrivacyFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null
  );
  const [detailLoading, setDetailLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
    category: "",
    communityImage: null as File | null,
    isPrivate: false,
    createdBy: "",
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [editCommunity, setEditCommunity] = useState({
    communityId: 0,
    name: "",
    description: "",
    category: "",
    communityImage: null as File | null,
    communityImageUrl: "",
    isPrivate: false,
    isActive: true,
  });

  const itemsPerPage = 10;

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const response = await communityService.getAllCommunities();
      setCommunities(response.data);
    } catch (error: any) {
      toast.error("Lỗi khi tải danh sách cộng đồng", {
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
    const uniqueCategories = [
      ...new Set(communities.map((community) => community.category)),
    ];
    return uniqueCategories.filter(Boolean);
  }, [communities]);

  const filteredAndSortedCommunities = useMemo(() => {
    const filtered = communities.filter((community) => {
      const matchesSearch =
        community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        community.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        community.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        community.createdBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        community.creatorFullName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && community.isActive) ||
        (statusFilter === "inactive" && !community.isActive);

      const matchesCategory =
        categoryFilter === "all" || community.category === categoryFilter;

      const matchesPrivacy =
        privacyFilter === "all" ||
        (privacyFilter === "private" && community.isPrivate) ||
        (privacyFilter === "public" && !community.isPrivate);

      return (
        matchesSearch && matchesStatus && matchesCategory && matchesPrivacy
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
    communities,
    searchTerm,
    statusFilter,
    categoryFilter,
    privacyFilter,
    sortField,
    sortOrder,
  ]);

  const paginatedCommunities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedCommunities.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredAndSortedCommunities, currentPage]);

  const totalPages = Math.ceil(
    filteredAndSortedCommunities.length / itemsPerPage
  );

  const handleViewDetail = async (communityId: number) => {
    try {
      setDetailLoading(true);
      const response = await communityService.getById(communityId);
      setSelectedCommunity(response.data || response);
    } catch (error: any) {
      toast.error("Lỗi khi tải chi tiết cộng đồng", {
        description: error.response?.data?.message || "Có lỗi xảy ra",
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateCommunity = async () => {
    try {
      setCreateLoading(true);
      const response = await communityService.createCommunity(newCommunity);
      setCommunities([response, ...communities]);
      setCreateDialogOpen(false);
      setNewCommunity({
        name: "",
        description: "",
        category: "",
        communityImage: null,
        isPrivate: false,
        createdBy: "",
      });
      toast.success("Đã tạo cộng đồng thành công");
      window.location.reload();
    } catch (error: any) {
      toast.error("Lỗi khi tạo cộng đồng", {
        description: error.response?.data?.message || "Có lỗi xảy ra",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditCommunity = async () => {
    try {
      setEditLoading(true);
      await communityService.updateCommunity({
        communityId: editCommunity.communityId,
        name: editCommunity.name,
        description: editCommunity.description,
        category: editCommunity.category,
        communityImage: editCommunity.communityImage,
        isPrivate: editCommunity.isPrivate,
        isActive: editCommunity.isActive,
      });

      // Update local state
      setCommunities(
        communities.map((community) =>
          community.communityId === editCommunity.communityId
            ? {
                ...community,
                name: editCommunity.name,
                description: editCommunity.description,
                category: editCommunity.category,
                communityImage: editCommunity.communityImageUrl,
                isPrivate: editCommunity.isPrivate,
                isActive: editCommunity.isActive,
                updatedAt: new Date().toISOString(),
              }
            : community
        )
      );

      setEditDialogOpen(false);
      toast.success("Đã cập nhật cộng đồng thành công");
      fetchCommunities();
    } catch (error: any) {
      toast.error("Lỗi khi cập nhật cộng đồng", {
        description: error.response?.data?.message || "Có lỗi xảy ra",
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteCommunity = async (communityId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa cộng đồng này?")) {
      return;
    }

    try {
      setDeleteLoading(communityId);
      await communityService.deleteCommunity(communityId);
      setCommunities(
        communities.filter((community) => community.communityId !== communityId)
      );
      toast.success("Đã xóa cộng đồng thành công");
    } catch (error: any) {
      toast.error("Lỗi khi xóa cộng đồng", {
        description: error.response?.data?.message || "Có lỗi xảy ra",
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  const openEditDialog = (community: Community) => {
    setEditCommunity({
      communityId: community.communityId,
      name: community.name,
      description: community.description,
      category: community.category,
      communityImage: null,
      communityImageUrl: community.communityImage,
      isPrivate: community.isPrivate,
      isActive: community.isActive,
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
    const total = communities.length;
    const active = communities.filter((c) => c.isActive).length;
    const inactive = communities.filter((c) => !c.isActive).length;
    const private_communities = communities.filter((c) => c.isPrivate).length;
    const public_communities = communities.filter((c) => !c.isPrivate).length;
    const totalMembers = communities.reduce(
      (sum, community) => sum + community.memberCount,
      0
    );
    const totalPosts = communities.reduce(
      (sum, community) => sum + community.postCount,
      0
    );

    return {
      total,
      active,
      inactive,
      private: private_communities,
      public: public_communities,
      totalMembers,
      totalPosts,
    };
  }, [communities]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Quản lý Cộng đồng
            </h1>
            <p className="text-gray-600 mt-2">
              Quản lý các cộng đồng và hoạt động trong hệ thống
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-blue-600! hover:bg-blue-700! text-white"
            >
              <Users className="w-4 h-4 mr-2" />
              Tạo cộng đồng mới
            </Button>
            <Button
              onClick={fetchCommunities}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 bg-transparent"
            >
              Làm mới
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Tổng cộng đồng
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
                <div className="p-3 rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Đang hoạt động
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.active}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Tổng thành viên
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalMembers.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-100">
                  <MessageSquare className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Tổng bài viết
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalPosts.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-gray-700 font-medium">
                  Tìm kiếm
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Tìm theo tên, mô tả..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-primary focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">
                  Trạng thái hoạt động
                </Label>
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
                <Label className="text-gray-700 font-medium">
                  Quyền riêng tư
                </Label>
                <Select value={privacyFilter} onValueChange={setPrivacyFilter}>
                  <SelectTrigger className="border-gray-200 focus:border-primary focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="public">Công khai</SelectItem>
                    <SelectItem value="private">Riêng tư</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Kết quả</Label>
                <div className="text-sm text-gray-600 pt-2">
                  Hiển thị {paginatedCommunities.length} /{" "}
                  {filteredAndSortedCommunities.length} cộng đồng
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
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Tên cộng đồng</span>
                        {getSortIcon("name")}
                      </div>
                    </TableHead>

                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("memberCount")}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Thành viên</span>
                        {getSortIcon("memberCount")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("postCount")}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Bài viết</span>
                        {getSortIcon("postCount")}
                      </div>
                    </TableHead>
                    <TableHead>Quyền riêng tư</TableHead>
                    <TableHead>Trạng thái</TableHead>

                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCommunities.map((community) => (
                    <TableRow key={community.communityId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <img
                            src={
                              community.communityImage ||
                              "/placeholder.svg?height=40&width=40"
                            }
                            alt={community.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="max-w-xs">
                            <div
                              className="font-semibold truncate"
                              title={community.name}
                            >
                              {community.name}
                            </div>
                            <div
                              className="text-sm text-gray-500 truncate"
                              title={community.description}
                            >
                              {community.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span className="font-semibold">
                            {community.memberCount.toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="w-4 h-4 text-orange-500" />
                          <span className="font-semibold">
                            {community.postCount.toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            community.isPrivate ? "secondary" : "default"
                          }
                          className={
                            community.isPrivate
                              ? "bg-gray-100 text-gray-700"
                              : "bg-green-100 text-green-700"
                          }
                        >
                          {community.isPrivate ? (
                            <>
                              <Lock className="w-3 h-3 mr-1" />
                              Riêng tư
                            </>
                          ) : (
                            <>
                              <Globe className="w-3 h-3 mr-1" />
                              Công khai
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={community.isActive ? "default" : "secondary"}
                          className={
                            community.isActive
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-gray-400"
                          }
                        >
                          {community.isActive ? "Hoạt động" : "Không hoạt động"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col space-y-2">
                          {/* View Detail Button */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleViewDetail(community.communityId)
                                }
                                className="w-full border-primary/20 text-primary hover:bg-primary/10"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Chi tiết
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Chi tiết cộng đồng</DialogTitle>
                                <DialogDescription>
                                  Thông tin chi tiết của cộng đồng #
                                  {community.communityId}
                                </DialogDescription>
                              </DialogHeader>
                              {detailLoading ? (
                                <div className="flex justify-center py-8">
                                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                                </div>
                              ) : (
                                selectedCommunity && (
                                  <div className="space-y-4">
                                    <div className="flex items-center space-x-4">
                                      <img
                                        src={
                                          selectedCommunity.communityImage ||
                                          "/placeholder.svg?height=80&width=80"
                                        }
                                        alt={selectedCommunity.name}
                                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                                      />
                                      <div>
                                        <h3 className="text-xl font-bold">
                                          {selectedCommunity.name}
                                        </h3>
                                        <p className="text-gray-600">
                                          {selectedCommunity.description}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-semibold">
                                          ID
                                        </Label>
                                        <p className="text-sm">
                                          {selectedCommunity.communityId}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">
                                          Danh mục
                                        </Label>
                                        <p className="text-sm">
                                          {selectedCommunity.category}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-semibold">
                                          Người tạo
                                        </Label>
                                        <p className="text-sm">
                                          {selectedCommunity.creatorFullName} (@
                                          {selectedCommunity.createdBy})
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">
                                          Quyền riêng tư
                                        </Label>
                                        <p className="text-sm">
                                          {selectedCommunity.isPrivate
                                            ? "Riêng tư"
                                            : "Công khai"}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-semibold">
                                          Số thành viên
                                        </Label>
                                        <p className="text-sm font-semibold text-blue-600">
                                          {selectedCommunity.memberCount.toLocaleString()}{" "}
                                          thành viên
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">
                                          Số bài viết
                                        </Label>
                                        <p className="text-sm font-semibold text-orange-600">
                                          {selectedCommunity.postCount.toLocaleString()}{" "}
                                          bài viết
                                        </p>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-semibold">
                                          Ngày tạo
                                        </Label>
                                        <p className="text-sm">
                                          {formatDate(
                                            selectedCommunity.createdAt
                                          )}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">
                                          Cập nhật lần cuối
                                        </Label>
                                        <p className="text-sm">
                                          {formatDate(
                                            selectedCommunity.updatedAt
                                          )}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex space-x-4 pt-4">
                                      <Badge
                                        variant={
                                          selectedCommunity.isActive
                                            ? "default"
                                            : "secondary"
                                        }
                                        className={
                                          selectedCommunity.isActive
                                            ? "bg-green-500"
                                            : ""
                                        }
                                      >
                                        {selectedCommunity.isActive
                                          ? "Đang hoạt động"
                                          : "Không hoạt động"}
                                      </Badge>
                                      <Badge
                                        variant={
                                          selectedCommunity.isPrivate
                                            ? "secondary"
                                            : "default"
                                        }
                                        className={
                                          selectedCommunity.isPrivate
                                            ? "bg-gray-100 text-gray-700"
                                            : "bg-green-100 text-green-700"
                                        }
                                      >
                                        {selectedCommunity.isPrivate ? (
                                          <>
                                            <Lock className="w-3 h-3 mr-1" />
                                            Riêng tư
                                          </>
                                        ) : (
                                          <>
                                            <Globe className="w-3 h-3 mr-1" />
                                            Công khai
                                          </>
                                        )}
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
                            onClick={() => openEditDialog(community)}
                            className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Chỉnh sửa
                          </Button>

                          {/* Delete Button */}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleDeleteCommunity(community.communityId)
                            }
                            disabled={deleteLoading === community.communityId}
                            className="w-full bg-red-400!"
                          >
                            {deleteLoading === community.communityId ? (
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-1" />
                            ) : (
                              <Trash2 className="w-4 h-4 mr-1" />
                            )}
                            {deleteLoading === community.communityId
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
            {paginatedCommunities.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Không tìm thấy cộng đồng nào phù hợp với bộ lọc
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

        {/* Create Community Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo cộng đồng mới</DialogTitle>
              <DialogDescription>
                Điền thông tin để tạo cộng đồng mới
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên cộng đồng</Label>
                  <Input
                    id="name"
                    value={newCommunity.name}
                    onChange={(e) =>
                      setNewCommunity({
                        ...newCommunity,
                        name: e.target.value,
                      })
                    }
                    placeholder="Nhập tên cộng đồng"
                    className="border-gray-200 focus:border-primary focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Danh mục</Label>
                  <Input
                    id="category"
                    value={newCommunity.category}
                    onChange={(e) =>
                      setNewCommunity({
                        ...newCommunity,
                        category: e.target.value,
                      })
                    }
                    placeholder="Nhập danh mục"
                    className="border-gray-200 focus:border-primary focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Input
                  id="description"
                  value={newCommunity.description}
                  onChange={(e) =>
                    setNewCommunity({
                      ...newCommunity,
                      description: e.target.value,
                    })
                  }
                  placeholder="Nhập mô tả cộng đồng"
                  className="border-gray-200 focus:border-primary focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="createdBy">Người tạo</Label>
                <Input
                  id="createdBy"
                  value={newCommunity.createdBy}
                  onChange={(e) =>
                    setNewCommunity({
                      ...newCommunity,
                      createdBy: e.target.value,
                    })
                  }
                  placeholder="Nhập tên người tạo"
                  className="border-gray-200 focus:border-primary focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="communityImage">Hình ảnh cộng đồng</Label>
                <Input
                  id="communityImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setNewCommunity({
                      ...newCommunity,
                      communityImage: file,
                    });
                  }}
                  className="border-gray-200 focus:border-primary focus:ring-primary/20"
                />
                {newCommunity.communityImage && (
                  <div className="mt-2">
                    <img
                      src={
                        URL.createObjectURL(newCommunity.communityImage) ||
                        "/placeholder.svg"
                      }
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={newCommunity.isPrivate}
                  onChange={(e) =>
                    setNewCommunity({
                      ...newCommunity,
                      isPrivate: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="isPrivate">Cộng đồng riêng tư</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setCreateDialogOpen(false);
                  setNewCommunity({
                    name: "",
                    description: "",
                    category: "",
                    communityImage: null,
                    isPrivate: false,
                    createdBy: "",
                  });
                }}
                disabled={createLoading}
              >
                Hủy
              </Button>
              <Button
                onClick={handleCreateCommunity}
                disabled={
                  createLoading ||
                  !newCommunity.name ||
                  !newCommunity.description ||
                  !newCommunity.createdBy
                }
                className="bg-blue-600! hover:bg-blue-700! text-white"
              >
                {createLoading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                ) : null}
                {createLoading ? "Đang tạo..." : "Tạo cộng đồng"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Community Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa cộng đồng</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin cộng đồng #{editCommunity.communityId}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editName">Tên cộng đồng</Label>
                  <Input
                    id="editName"
                    value={editCommunity.name}
                    onChange={(e) =>
                      setEditCommunity({
                        ...editCommunity,
                        name: e.target.value,
                      })
                    }
                    placeholder="Nhập tên cộng đồng"
                    className="border-gray-200 focus:border-primary focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editCategory">Danh mục</Label>
                  <Input
                    id="editCategory"
                    value={editCommunity.category}
                    onChange={(e) =>
                      setEditCommunity({
                        ...editCommunity,
                        category: e.target.value,
                      })
                    }
                    placeholder="Nhập danh mục"
                    className="border-gray-200 focus:border-primary focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editDescription">Mô tả</Label>
                <Input
                  id="editDescription"
                  value={editCommunity.description}
                  onChange={(e) =>
                    setEditCommunity({
                      ...editCommunity,
                      description: e.target.value,
                    })
                  }
                  placeholder="Nhập mô tả cộng đồng"
                  className="border-gray-200 focus:border-primary focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editCommunityImage">Hình ảnh cộng đồng</Label>
                <Input
                  id="editCommunityImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setEditCommunity({
                      ...editCommunity,
                      communityImage: file,
                    });
                  }}
                  className="border-gray-200 focus:border-primary focus:ring-primary/20"
                />
                <div className="mt-2">
                  {editCommunity.communityImage ? (
                    <img
                      src={
                        URL.createObjectURL(editCommunity.communityImage) ||
                        "/placeholder.svg"
                      }
                      alt="New Preview"
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  ) : editCommunity.communityImageUrl ? (
                    <img
                      src={
                        editCommunity.communityImageUrl || "/placeholder.svg"
                      }
                      alt="Current Image"
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg border flex items-center justify-center">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="editIsPrivate"
                  checked={editCommunity.isPrivate}
                  onChange={(e) =>
                    setEditCommunity({
                      ...editCommunity,
                      isPrivate: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="editIsPrivate">Cộng đồng riêng tư</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editCommunity.isActive}
                  onChange={(e) =>
                    setEditCommunity({
                      ...editCommunity,
                      isActive: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="editIsActive">Kích hoạt cộng đồng</Label>
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
                onClick={handleEditCommunity}
                disabled={
                  editLoading ||
                  !editCommunity.name ||
                  !editCommunity.description
                }
                className="bg-blue-600! hover:bg-blue-700! text-white"
              >
                {editLoading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                ) : null}
                {editLoading ? "Đang cập nhật..." : "Cập nhật cộng đồng"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
