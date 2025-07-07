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
  Trophy,
  Star,
  Target,
  Award,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { achievementService } from "@/services/admin/achievement/service";

interface Achievement {
  achievementId: number;
  name: string;
  description: string;
  category: string;
  pointsAwarded: number;
  badgeImage: string;
  criteria: string;
  thresholdValue: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type SortField =
  | "name"
  | "category"
  | "pointsAwarded"
  | "thresholdValue"
  | "isActive"
  | "createdAt";
type SortOrder = "asc" | "desc";

export default function AchievementManagement() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newAchievement, setNewAchievement] = useState({
    name: "",
    description: "",
    category: "",
    pointsAwarded: 0,
    badgeImage: null as File | null,
    criteria: "",
    thresholdValue: 0,
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [editAchievement, setEditAchievement] = useState({
    achievementId: 0,
    name: "",
    description: "",
    category: "",
    pointsAwarded: 0,
    badgeImage: null as File | null,
    badgeImageUrl: "", // Keep existing URL for display
    criteria: "",
    thresholdValue: 0,
    isActive: true,
  });

  const itemsPerPage = 10;

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await achievementService.getAllAchievements();
      setAchievements(response.data);
    } catch (error: any) {
      toast.error("Lỗi khi tải danh sách thành tựu", {
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
      ...new Set(achievements.map((achievement) => achievement.category)),
    ];
    return uniqueCategories.filter(Boolean);
  }, [achievements]);

  const filteredAndSortedAchievements = useMemo(() => {
    const filtered = achievements.filter((achievement) => {
      const matchesSearch =
        achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        achievement.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        achievement.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        achievement.criteria.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && achievement.isActive) ||
        (statusFilter === "inactive" && !achievement.isActive);

      const matchesCategory =
        categoryFilter === "all" || achievement.category === categoryFilter;

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
  }, [
    achievements,
    searchTerm,
    statusFilter,
    categoryFilter,
    sortField,
    sortOrder,
  ]);

  const paginatedAchievements = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedAchievements.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredAndSortedAchievements, currentPage]);

  const totalPages = Math.ceil(
    filteredAndSortedAchievements.length / itemsPerPage
  );

  const handleViewDetail = async (achievementId: number) => {
    try {
      setDetailLoading(true);
      const response = await achievementService.getById(achievementId);
      setSelectedAchievement(response.data || response);
    } catch (error: any) {
      toast.error("Lỗi khi tải chi tiết thành tựu", {
        description: error.response?.data?.message || "Có lỗi xảy ra",
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateAchievement = async () => {
    try {
      setCreateLoading(true);
      const response = await achievementService.createAchievement(
        newAchievement
      );
      setAchievements([response, ...achievements]);
      setCreateDialogOpen(false);
      setNewAchievement({
        name: "",
        description: "",
        category: "",
        pointsAwarded: 0,
        badgeImage: null,
        criteria: "",
        thresholdValue: 0,
      });
      toast.success("Đã tạo thành tựu thành công");
      window.location.reload();
    } catch (error: any) {
      toast.error("Lỗi khi tạo thành tựu", {
        description: error.response?.data?.message || "Có lỗi xảy ra",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditAchievement = async () => {
    try {
      setEditLoading(true);
      await achievementService.updateAchievement({
        achievementId: editAchievement.achievementId,
        name: editAchievement.name,
        description: editAchievement.description,
        category: editAchievement.category,
        pointsAwarded: editAchievement.pointsAwarded,
        badgeImage: editAchievement.badgeImage,
        criteria: editAchievement.criteria,
        thresholdValue: editAchievement.thresholdValue,
        isActive: editAchievement.isActive,
      });
      // Update local state
      setAchievements(
        achievements.map((achievement) =>
          achievement.achievementId === editAchievement.achievementId
            ? {
                ...achievement,
                achievementId: editAchievement.achievementId,
                name: editAchievement.name,
                description: editAchievement.description,
                category: editAchievement.category,
                pointsAwarded: editAchievement.pointsAwarded,
                badgeImage: editAchievement.badgeImageUrl, // ensure this is a string (URL)
                criteria: editAchievement.criteria,
                thresholdValue: editAchievement.thresholdValue,
                isActive: editAchievement.isActive,
                updatedAt: new Date().toISOString(),
              }
            : achievement
        )
      );
      setEditDialogOpen(false);
      toast.success("Đã cập nhật thành tựu thành công");
      fetchAchievements(); // Refresh the list
    } catch (error: any) {
      toast.error("Lỗi khi cập nhật thành tựu", {
        description: error.response?.data?.message || "Có lỗi xảy ra",
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteAchievement = async (achievementId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa thành tựu này?")) {
      return;
    }

    try {
      setDeleteLoading(achievementId);
      await achievementService.deleteAchievement(achievementId);
      // Update local state
      setAchievements(
        achievements.filter(
          (achievement) => achievement.achievementId !== achievementId
        )
      );
      toast.success("Đã xóa thành tựu thành công");
    } catch (error: any) {
      toast.error("Lỗi khi xóa thành tựu", {
        description: error.response?.data?.message || "Có lỗi xảy ra",
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  const openEditDialog = (achievement: Achievement) => {
    setEditAchievement({
      achievementId: achievement.achievementId,
      name: achievement.name,
      description: achievement.description,
      category: achievement.category,
      pointsAwarded: achievement.pointsAwarded,
      badgeImage: null,
      badgeImageUrl: achievement.badgeImage,
      criteria: achievement.criteria,
      thresholdValue: achievement.thresholdValue,
      isActive: achievement.isActive,
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
    const total = achievements.length;
    const active = achievements.filter((a) => a.isActive).length;
    const inactive = achievements.filter((a) => !a.isActive).length;
    const totalPoints = achievements.reduce(
      (sum, achievement) => sum + achievement.pointsAwarded,
      0
    );
    return { total, active, inactive, totalPoints };
  }, [achievements]);

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
              Quản lý Thành tựu
            </h1>
            <p className="text-gray-600 mt-2">
              Quản lý các thành tựu và phần thưởng trong hệ thống
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-green-600! hover:bg-primary/90 text-white"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Tạo thành tựu mới
            </Button>
            <Button
              onClick={fetchAchievements}
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
                  <Trophy className="h-8 w-8" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Tổng thành tựu
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
                  <CheckCircle className="h-8 w-8" />
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
          <Card className="border-0 shadow-health hover:shadow-health-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="feature-icon-yellow">
                  <XCircle className="h-8 w-8" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Không hoạt động
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.inactive}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-health hover:shadow-health-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="feature-icon-purple">
                  <Star className="h-8 w-8" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Tổng điểm thưởng
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalPoints.toLocaleString()}
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
                    placeholder="Tìm theo tên, mô tả, tiêu chí..."
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
                <Label className="text-gray-700 font-medium">Kết quả</Label>
                <div className="text-sm text-gray-600 pt-2">
                  Hiển thị {paginatedAchievements.length} /{" "}
                  {filteredAndSortedAchievements.length} thành tựu
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
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Tên thành tựu</span>
                        {getSortIcon("name")}
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
                      onClick={() => handleSort("pointsAwarded")}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Điểm thưởng</span>
                        {getSortIcon("pointsAwarded")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("thresholdValue")}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Ngưỡng</span>
                        {getSortIcon("thresholdValue")}
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
                  {paginatedAchievements.map((achievement) => (
                    <TableRow key={achievement.achievementId}>
                      <TableCell className="font-medium">
                        <div className="max-w-xs">
                          <div
                            className="font-semibold truncate"
                            title={achievement.name}
                          >
                            {achievement.name}
                          </div>
                          <div
                            className="text-sm text-gray-500 truncate"
                            title={achievement.description}
                          >
                            {achievement.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-primary/20 text-primary bg-primary/5"
                        >
                          {achievement.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-semibold">
                            {achievement.pointsAwarded}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Target className="w-4 h-4 text-gray-400" />
                          <span>{achievement.thresholdValue}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            achievement.isActive ? "default" : "secondary"
                          }
                          className={
                            achievement.isActive
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-gray-400"
                          }
                        >
                          {achievement.isActive
                            ? "Hoạt động"
                            : "Không hoạt động"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(achievement.createdAt)}</div>
                          <div className="text-gray-500">
                            Cập nhật: {formatDate(achievement.updatedAt)}
                          </div>
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
                                onClick={() =>
                                  handleViewDetail(achievement.achievementId)
                                }
                                className="w-full border-primary/20 text-primary hover:bg-primary/10"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Chi tiết
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Chi tiết thành tựu</DialogTitle>
                                <DialogDescription>
                                  Thông tin chi tiết của thành tựu #
                                  {achievement.achievementId}
                                </DialogDescription>
                              </DialogHeader>
                              {detailLoading ? (
                                <div className="flex justify-center py-8">
                                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                                </div>
                              ) : (
                                selectedAchievement && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-semibold">
                                          ID
                                        </Label>
                                        <p className="text-sm">
                                          {selectedAchievement.achievementId}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">
                                          Danh mục
                                        </Label>
                                        <p className="text-sm">
                                          {selectedAchievement.category}
                                        </p>
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="font-semibold">
                                        Tên thành tựu
                                      </Label>
                                      <p className="text-sm">
                                        {selectedAchievement.name}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="font-semibold">
                                        Mô tả
                                      </Label>
                                      <p className="text-sm">
                                        {selectedAchievement.description}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="font-semibold">
                                        Tiêu chí
                                      </Label>
                                      <p className="text-sm">
                                        {selectedAchievement.criteria}
                                      </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-semibold">
                                          Điểm thưởng
                                        </Label>
                                        <p className="text-sm font-semibold text-yellow-600">
                                          {selectedAchievement.pointsAwarded}{" "}
                                          điểm
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">
                                          Ngưỡng đạt được
                                        </Label>
                                        <p className="text-sm">
                                          {selectedAchievement.thresholdValue}
                                        </p>
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="font-semibold">
                                        Hình ảnh huy hiệu
                                      </Label>
                                      <div className="mt-2">
                                        {selectedAchievement.badgeImage ? (
                                          <img
                                            src={
                                              selectedAchievement.badgeImage ||
                                              "/placeholder.svg"
                                            }
                                            alt="Badge"
                                            className="w-16 h-16 object-cover rounded-lg border"
                                          />
                                        ) : (
                                          <div className="w-16 h-16 bg-gray-100 rounded-lg border flex items-center justify-center">
                                            <Award className="w-8 h-8 text-gray-400" />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-semibold">
                                          Ngày tạo
                                        </Label>
                                        <p className="text-sm">
                                          {formatDate(
                                            selectedAchievement.createdAt
                                          )}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">
                                          Cập nhật lần cuối
                                        </Label>
                                        <p className="text-sm">
                                          {formatDate(
                                            selectedAchievement.updatedAt
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex space-x-4 pt-4">
                                      <Badge
                                        variant={
                                          selectedAchievement.isActive
                                            ? "default"
                                            : "secondary"
                                        }
                                        className={
                                          selectedAchievement.isActive
                                            ? "bg-green-500"
                                            : ""
                                        }
                                      >
                                        {selectedAchievement.isActive
                                          ? "Đang hoạt động"
                                          : "Không hoạt động"}
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
                            onClick={() => openEditDialog(achievement)}
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
                              handleDeleteAchievement(achievement.achievementId)
                            }
                            disabled={
                              deleteLoading === achievement.achievementId
                            }
                            className="w-full bg-red-400!"
                          >
                            {deleteLoading === achievement.achievementId ? (
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-1" />
                            ) : (
                              <Trash2 className="w-4 h-4 mr-1" />
                            )}
                            {deleteLoading === achievement.achievementId
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
            {paginatedAchievements.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Không tìm thấy thành tựu nào phù hợp với bộ lọc
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

        {/* Create Achievement Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo thành tựu mới</DialogTitle>
              <DialogDescription>
                Điền thông tin để tạo thành tựu mới
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên thành tựu</Label>
                  <Input
                    id="name"
                    value={newAchievement.name}
                    onChange={(e) =>
                      setNewAchievement({
                        ...newAchievement,
                        name: e.target.value,
                      })
                    }
                    placeholder="Nhập tên thành tựu"
                    className="border-gray-200 focus:border-primary focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Danh mục</Label>
                  <Input
                    id="category"
                    value={newAchievement.category}
                    onChange={(e) =>
                      setNewAchievement({
                        ...newAchievement,
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
                  value={newAchievement.description}
                  onChange={(e) =>
                    setNewAchievement({
                      ...newAchievement,
                      description: e.target.value,
                    })
                  }
                  placeholder="Nhập mô tả thành tựu"
                  className="border-gray-200 focus:border-primary focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="criteria">Tiêu chí đạt được</Label>
                <Input
                  id="criteria"
                  value={newAchievement.criteria}
                  onChange={(e) =>
                    setNewAchievement({
                      ...newAchievement,
                      criteria: e.target.value,
                    })
                  }
                  placeholder="Nhập tiêu chí để đạt được thành tựu"
                  className="border-gray-200 focus:border-primary focus:ring-primary/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pointsAwarded">Điểm thưởng</Label>
                  <Input
                    id="pointsAwarded"
                    type="number"
                    value={newAchievement.pointsAwarded}
                    onChange={(e) =>
                      setNewAchievement({
                        ...newAchievement,
                        pointsAwarded: Number.parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="Nhập số điểm thưởng"
                    className="border-gray-200 focus:border-primary focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thresholdValue">Ngưỡng đạt được</Label>
                  <Input
                    id="thresholdValue"
                    type="number"
                    value={newAchievement.thresholdValue}
                    onChange={(e) =>
                      setNewAchievement({
                        ...newAchievement,
                        thresholdValue: Number.parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="Nhập ngưỡng cần đạt"
                    className="border-gray-200 focus:border-primary focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="badgeImage">Hình ảnh huy hiệu</Label>
                <Input
                  id="badgeImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setNewAchievement({
                      ...newAchievement,
                      badgeImage: file,
                    });
                  }}
                  className="border-gray-200 focus:border-primary focus:ring-primary/20"
                />
                {newAchievement.badgeImage && (
                  <div className="mt-2">
                    <img
                      src={
                        URL.createObjectURL(newAchievement.badgeImage) ||
                        "/placeholder.svg"
                      }
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setCreateDialogOpen(false);
                  setNewAchievement({
                    name: "",
                    description: "",
                    category: "",
                    pointsAwarded: 0,
                    badgeImage: null,
                    criteria: "",
                    thresholdValue: 0,
                  });
                }}
                disabled={createLoading}
              >
                Hủy
              </Button>
              <Button
                onClick={handleCreateAchievement}
                disabled={
                  createLoading ||
                  !newAchievement.name ||
                  !newAchievement.description
                }
                className="bg-green-600! hover:bg-primary/90 text-white"
              >
                {createLoading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                ) : null}
                {createLoading ? "Đang tạo..." : "Tạo thành tựu"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Achievement Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa thành tựu</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin thành tựu #{editAchievement.achievementId}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editName">Tên thành tựu</Label>
                  <Input
                    id="editName"
                    value={editAchievement.name}
                    onChange={(e) =>
                      setEditAchievement({
                        ...editAchievement,
                        name: e.target.value,
                      })
                    }
                    placeholder="Nhập tên thành tựu"
                    className="border-gray-200 focus:border-primary focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editCategory">Danh mục</Label>
                  <Input
                    id="editCategory"
                    value={editAchievement.category}
                    onChange={(e) =>
                      setEditAchievement({
                        ...editAchievement,
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
                  value={editAchievement.description}
                  onChange={(e) =>
                    setEditAchievement({
                      ...editAchievement,
                      description: e.target.value,
                    })
                  }
                  placeholder="Nhập mô tả thành tựu"
                  className="border-gray-200 focus:border-primary focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCriteria">Tiêu chí đạt được</Label>
                <Input
                  id="editCriteria"
                  value={editAchievement.criteria}
                  onChange={(e) =>
                    setEditAchievement({
                      ...editAchievement,
                      criteria: e.target.value,
                    })
                  }
                  placeholder="Nhập tiêu chí để đạt được thành tựu"
                  className="border-gray-200 focus:border-primary focus:ring-primary/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editPointsAwarded">Điểm thưởng</Label>
                  <Input
                    id="editPointsAwarded"
                    type="number"
                    value={editAchievement.pointsAwarded}
                    onChange={(e) =>
                      setEditAchievement({
                        ...editAchievement,
                        pointsAwarded: Number.parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="Nhập số điểm thưởng"
                    className="border-gray-200 focus:border-primary focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editThresholdValue">Ngưỡng đạt được</Label>
                  <Input
                    id="editThresholdValue"
                    type="number"
                    value={editAchievement.thresholdValue}
                    onChange={(e) =>
                      setEditAchievement({
                        ...editAchievement,
                        thresholdValue: Number.parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="Nhập ngưỡng cần đạt"
                    className="border-gray-200 focus:border-primary focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editBadgeImage">Hình ảnh huy hiệu</Label>
                <Input
                  id="editBadgeImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setEditAchievement({
                      ...editAchievement,
                      badgeImage: file,
                    });
                  }}
                  className="border-gray-200 focus:border-primary focus:ring-primary/20"
                />
                <div className="mt-2">
                  {editAchievement.badgeImage ? (
                    <img
                      src={
                        URL.createObjectURL(editAchievement.badgeImage) ||
                        "/placeholder.svg"
                      }
                      alt="New Preview"
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  ) : editAchievement.badgeImageUrl ? (
                    <img
                      src={editAchievement.badgeImageUrl || "/placeholder.svg"}
                      alt="Current Badge"
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg border flex items-center justify-center">
                      <Award className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editAchievement.isActive}
                  onChange={(e) =>
                    setEditAchievement({
                      ...editAchievement,
                      isActive: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="editIsActive">Kích hoạt thành tựu</Label>
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
                onClick={handleEditAchievement}
                disabled={
                  editLoading ||
                  !editAchievement.name ||
                  !editAchievement.description
                }
                className="bg-blue-600! hover:bg-blue-700! text-white"
              >
                {editLoading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                ) : null}
                {editLoading ? "Đang cập nhật..." : "Cập nhật thành tựu"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
