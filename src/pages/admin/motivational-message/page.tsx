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
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Heart,
  User,
  Calendar,
  Edit,
  Trash2,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";
import { motivationalMessageService } from "@/services/admin/motivational-message/service";
import { getUserFromToken } from "@/utils/token/auth";

interface MotivationalMessage {
  messageId: number;
  content: string;
  category: string;
  author: string;
  quitPhase: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type SortField =
  | "content"
  | "category"
  | "author"
  | "quitPhase"
  | "isActive"
  | "createdAt";
type SortOrder = "asc" | "desc";

export default function MotivationalMessageManagement() {
  const username = getUserFromToken()?.username;
  const [messages, setMessages] = useState<MotivationalMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [quitPhaseFilter, setQuitPhaseFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMessage, setSelectedMessage] =
    useState<MotivationalMessage | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newMessage, setNewMessage] = useState({
    content: "",
    category: "",
    author:  username ?? "",
    quitPhase: "",
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [editMessage, setEditMessage] = useState({
    messageId: 0,
    content: "",
    category: "",
    author: username ?? "",
    quitPhase: "",
    isActive: true,
  });

  const itemsPerPage = 10;

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await motivationalMessageService.getAllMessages();
      setMessages(response.data);
    } catch (error: any) {
      toast.error("Lỗi khi tải danh sách tin nhắn động viên", {
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
      ...new Set(messages.map((message) => message.category)),
    ];
    return uniqueCategories.filter(Boolean);
  }, [messages]);

  const quitPhases = useMemo(() => {
    const uniquePhases = [
      ...new Set(messages.map((message) => message.quitPhase)),
    ];
    return uniquePhases.filter(Boolean);
  }, [messages]);

  const filteredAndSortedMessages = useMemo(() => {
    const filtered = messages.filter((message) => {
      const matchesSearch =
        message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.quitPhase.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && message.isActive) ||
        (statusFilter === "inactive" && !message.isActive);

      const matchesCategory =
        categoryFilter === "all" || message.category === categoryFilter;

      const matchesQuitPhase =
        quitPhaseFilter === "all" || message.quitPhase === quitPhaseFilter;

      return (
        matchesSearch && matchesStatus && matchesCategory && matchesQuitPhase
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
    messages,
    searchTerm,
    statusFilter,
    categoryFilter,
    quitPhaseFilter,
    sortField,
    sortOrder,
  ]);

  const paginatedMessages = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedMessages.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredAndSortedMessages, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedMessages.length / itemsPerPage);

  const handleViewDetail = async (messageId: number) => {
    try {
      setDetailLoading(true);
      const response = await motivationalMessageService.getById(messageId);
      setSelectedMessage(response.data || response);
    } catch (error: any) {
      toast.error("Lỗi khi tải chi tiết tin nhắn", {
        description: error.response?.data?.message || "Có lỗi xảy ra",
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateMessage = async () => {
    try {
      setCreateLoading(true);
      const response = await motivationalMessageService.createMessage(
        newMessage
      );
      setMessages([response, ...messages]);
      setCreateDialogOpen(false);
      setNewMessage({
        content: "",
        category: "",
        author: username ?? "",
        quitPhase: "",
      });
      toast.success("Đã tạo tin nhắn động viên thành công");
      window.location.reload();
    } catch (error: any) {
      toast.error("Lỗi khi tạo tin nhắn động viên", {
        description: error.response?.data?.message || "Có lỗi xảy ra",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditMessage = async () => {
    try {
      setEditLoading(true);
      await motivationalMessageService.updateMessage({
        messageId: editMessage.messageId,
        content: editMessage.content,
        category: editMessage.category,
        author: username ?? "",
        quitPhase: editMessage.quitPhase,
        isActive: editMessage.isActive,
      });

      // Update local state
      setMessages(
        messages.map((message) =>
          message.messageId === editMessage.messageId
            ? {
                ...message,
                content: editMessage.content,
                category: editMessage.category,
                author: editMessage.author,
                quitPhase: editMessage.quitPhase,
                isActive: editMessage.isActive,
                updatedAt: new Date().toISOString(),
              }
            : message
        )
      );

      setEditDialogOpen(false);
      toast.success("Đã cập nhật tin nhắn động viên thành công");
      fetchMessages();
    } catch (error: any) {
      toast.error("Lỗi khi cập nhật tin nhắn động viên", {
        description: error.response?.data?.message || "Có lỗi xảy ra",
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tin nhắn động viên này?")) {
      return;
    }

    try {
      setDeleteLoading(messageId);
      await motivationalMessageService.deleteMessage(messageId);
      setMessages(
        messages.filter((message) => message.messageId !== messageId)
      );
      toast.success("Đã xóa tin nhắn động viên thành công");
    } catch (error: any) {
      toast.error("Lỗi khi xóa tin nhắn động viên", {
        description: error.response?.data?.message || "Có lỗi xảy ra",
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  const openEditDialog = (message: MotivationalMessage) => {
    setEditMessage({
      messageId: message.messageId,
      content: message.content,
      category: message.category,
      author: message.author,
      quitPhase: message.quitPhase,
      isActive: message.isActive,
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
    const total = messages.length;
    const active = messages.filter((m) => m.isActive).length;
    const inactive = messages.filter((m) => !m.isActive).length;
    const categoriesCount = new Set(messages.map((m) => m.category)).size;
    const phasesCount = new Set(messages.map((m) => m.quitPhase)).size;

    return {
      total,
      active,
      inactive,
      categoriesCount,
      phasesCount,
    };
  }, [messages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Quản lý Tin nhắn Động viên
            </h1>
            <p className="text-gray-600 mt-2">
              Quản lý các tin nhắn động viên và hỗ trợ người dùng
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-orange-600! hover:bg-orange-700! text-white"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Tạo tin nhắn mới
            </Button>
            <Button
              onClick={fetchMessages}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 bg-transparent"
            >
              Làm mới
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-100">
                  <MessageSquare className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Tổng tin nhắn
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
                  <Heart className="h-8 w-8 text-green-600" />
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
                <div className="p-3 rounded-full bg-gray-100">
                  <MessageSquare className="h-8 w-8 text-gray-600" />
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

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <Lightbulb className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Danh mục</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.categoriesCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Giai đoạn</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.phasesCount}
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
                    placeholder="Tìm theo nội dung, tác giả..."
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
                  Giai đoạn cai
                </Label>
                <Select
                  value={quitPhaseFilter}
                  onValueChange={setQuitPhaseFilter}
                >
                  <SelectTrigger className="border-gray-200 focus:border-primary focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {quitPhases.map((phase) => (
                      <SelectItem key={phase} value={phase}>
                        {phase}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Kết quả</Label>
                <div className="text-sm text-gray-600 pt-2">
                  Hiển thị {paginatedMessages.length} /{" "}
                  {filteredAndSortedMessages.length} tin nhắn
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
                      onClick={() => handleSort("content")}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Nội dung</span>
                        {getSortIcon("content")}
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
                      onClick={() => handleSort("author")}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Tác giả</span>
                        {getSortIcon("author")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("quitPhase")}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Giai đoạn cai</span>
                        {getSortIcon("quitPhase")}
                      </div>
                    </TableHead>
                    <TableHead>Trạng thái</TableHead>

                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMessages.map((message) => (
                    <TableRow key={message.messageId}>
                      <TableCell className="font-medium">
                        <div className="max-w-md">
                          <div
                            className="text-sm text-gray-900 line-clamp-2"
                            title={message.content}
                          >
                            {message.content}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-orange-200 text-orange-700 bg-orange-50"
                        >
                          {message.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{message.author}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-purple-200 text-purple-700 bg-purple-50"
                        >
                          {message.quitPhase}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={message.isActive ? "default" : "secondary"}
                          className={
                            message.isActive
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-gray-400"
                          }
                        >
                          {message.isActive ? "Hoạt động" : "Không hoạt động"}
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
                                  handleViewDetail(message.messageId)
                                }
                                className="w-full border-primary/20 text-primary hover:bg-primary/10"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Chi tiết
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>
                                  Chi tiết tin nhắn động viên
                                </DialogTitle>
                                <DialogDescription>
                                  Thông tin chi tiết của tin nhắn #
                                  {message.messageId}
                                </DialogDescription>
                              </DialogHeader>
                              {detailLoading ? (
                                <div className="flex justify-center py-8">
                                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                                </div>
                              ) : (
                                selectedMessage && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-semibold">
                                          ID
                                        </Label>
                                        <p className="text-sm">
                                          {selectedMessage.messageId}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">
                                          Danh mục
                                        </Label>
                                        <p className="text-sm">
                                          {selectedMessage.category}
                                        </p>
                                      </div>
                                    </div>

                                    <div>
                                      <Label className="font-semibold">
                                        Nội dung tin nhắn
                                      </Label>
                                      <p className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-lg mt-2">
                                        {selectedMessage.content}
                                      </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-semibold">
                                          Tác giả
                                        </Label>
                                        <p className="text-sm">
                                          {selectedMessage.author}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">
                                          Giai đoạn cai thuốc
                                        </Label>
                                        <p className="text-sm">
                                          {selectedMessage.quitPhase}
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
                                            selectedMessage.createdAt
                                          )}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">
                                          Cập nhật lần cuối
                                        </Label>
                                        <p className="text-sm">
                                          {formatDate(
                                            selectedMessage.updatedAt
                                          )}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex space-x-4 pt-4">
                                      <Badge
                                        variant={
                                          selectedMessage.isActive
                                            ? "default"
                                            : "secondary"
                                        }
                                        className={
                                          selectedMessage.isActive
                                            ? "bg-green-500"
                                            : ""
                                        }
                                      >
                                        {selectedMessage.isActive
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
                            onClick={() => openEditDialog(message)}
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
                              handleDeleteMessage(message.messageId)
                            }
                            disabled={deleteLoading === message.messageId}
                            className="w-full bg-red-400!"
                          >
                            {deleteLoading === message.messageId ? (
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-1" />
                            ) : (
                              <Trash2 className="w-4 h-4 mr-1" />
                            )}
                            {deleteLoading === message.messageId
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
            {paginatedMessages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Không tìm thấy tin nhắn nào phù hợp với bộ lọc
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

        {/* Create Message Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo tin nhắn động viên mới</DialogTitle>
              <DialogDescription>
                Điền thông tin để tạo tin nhắn động viên mới
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Nội dung tin nhắn</Label>
                <Textarea
                  id="content"
                  value={newMessage.content}
                  onChange={(e) =>
                    setNewMessage({
                      ...newMessage,
                      content: e.target.value,
                    })
                  }
                  placeholder="Nhập nội dung tin nhắn động viên"
                  className="border-gray-200 focus:border-primary focus:ring-primary/20 min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Danh mục</Label>
                  <Input
                    id="category"
                    value={newMessage.category}
                    onChange={(e) =>
                      setNewMessage({
                        ...newMessage,
                        category: e.target.value,
                      })
                    }
                    placeholder="Nhập danh mục (VD: Motivation, Support)"
                    className="border-gray-200 focus:border-primary focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Tác giả</Label>
                  <Input
                    id="author"
                    disabled
                    value={username}
                    onChange={(e) =>
                      setNewMessage({
                        ...newMessage,
                        author: e.target.value,
                      })
                    }
                    placeholder="Nhập tên tác giả"
                    className="border-gray-200 focus:border-primary focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quitPhase">Giai đoạn cai thuốc</Label>
                <Input
                  id="quitPhase"
                  value={newMessage.quitPhase}
                  onChange={(e) =>
                    setNewMessage({
                      ...newMessage,
                      quitPhase: e.target.value,
                    })
                  }
                  placeholder="Nhập giai đoạn cai thuốc (VD: Preparation Phase, Action Phase)"
                  className="border-gray-200 focus:border-primary focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setCreateDialogOpen(false);
                  setNewMessage({
                    content: "",
                    category: "",
                    author: "",
                    quitPhase: "",
                  });
                }}
                disabled={createLoading}
              >
                Hủy
              </Button>
              <Button
                onClick={handleCreateMessage}
                disabled={
                  createLoading ||
                  !newMessage.content ||
                  !newMessage.category ||
                  !newMessage.author ||
                  !newMessage.quitPhase
                }
                className="bg-orange-600! hover:bg-orange-700! text-white"
              >
                {createLoading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                ) : null}
                {createLoading ? "Đang tạo..." : "Tạo tin nhắn"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Message Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa tin nhắn động viên</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin tin nhắn #{editMessage.messageId}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editContent">Nội dung tin nhắn</Label>
                <Textarea
                  id="editContent"
                  value={editMessage.content}
                  onChange={(e) =>
                    setEditMessage({
                      ...editMessage,
                      content: e.target.value,
                    })
                  }
                  placeholder="Nhập nội dung tin nhắn động viên"
                  className="border-gray-200 focus:border-primary focus:ring-primary/20 min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editCategory">Danh mục</Label>
                  <Input
                    id="editCategory"
                    value={editMessage.category}
                    onChange={(e) =>
                      setEditMessage({
                        ...editMessage,
                        category: e.target.value,
                      })
                    }
                    placeholder="Nhập danh mục"
                    className="border-gray-200 focus:border-primary focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editAuthor">Tác giả</Label>
                  <Input
                  disabled
                    id="editAuthor"
                    value={username}
                    onChange={(e) =>
                      setEditMessage({
                        ...editMessage,
                        author: e.target.value,
                      })
                    }
                    placeholder="Nhập tên tác giả"
                    className="border-gray-200 focus:border-primary focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editQuitPhase">Giai đoạn cai thuốc</Label>
                <Input
                  id="editQuitPhase"
                  value={editMessage.quitPhase}
                  onChange={(e) =>
                    setEditMessage({
                      ...editMessage,
                      quitPhase: e.target.value,
                    })
                  }
                  placeholder="Nhập giai đoạn cai thuốc"
                  className="border-gray-200 focus:border-primary focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editMessage.isActive}
                  onChange={(e) =>
                    setEditMessage({
                      ...editMessage,
                      isActive: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="editIsActive">Kích hoạt tin nhắn</Label>
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
                onClick={handleEditMessage}
                disabled={
                  editLoading ||
                  !editMessage.content ||
                  !editMessage.category ||
                  !editMessage.author ||
                  !editMessage.quitPhase
                }
                className="bg-orange-600! hover:bg-orange-700! text-white"
              >
                {editLoading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                ) : null}
                {editLoading ? "Đang cập nhật..." : "Cập nhật tin nhắn"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
