/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users,
  UserCheck,
  Clock,
} from "lucide-react"
import { toast } from "sonner"
import { coachService } from "@/services/coach/coachService"

interface CoachProfile {
  username: string
  fullName: string | null
  specialization: string
  qualifications: string
  experience: string
  certificationProof: string
  hourlyRate: number
  availability: string
  averageRating: number | null
  totalSessions: number
  isVerified: boolean
  isActive: boolean
}

type SortField = "username" | "specialization" | "hourlyRate" | "totalSessions" | "isVerified" | "isActive"
type SortOrder = "asc" | "desc"

export default function CoachManagement() {
  const [coaches, setCoaches] = useState<CoachProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [verificationFilter, setVerificationFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("username")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCoach, setSelectedCoach] = useState<CoachProfile | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState<string | null>(null)

  const itemsPerPage = 10

  useEffect(() => {
    fetchCoaches()
  }, [])

  const fetchCoaches = async () => {
    try {
      setLoading(true)
      const response = await coachService.getAllProfiles()
      if (response.success) {
        setCoaches(response.data)
      }
    } catch (error: any) {
      toast.error("Lỗi khi tải danh sách coaches", {
        description: error.response?.data?.message || "Có lỗi xảy ra",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />
    return sortOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
  }

  const filteredAndSortedCoaches = useMemo(() => {
    const filtered = coaches.filter((coach) => {
      const matchesSearch =
        coach.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coach.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (coach.fullName && coach.fullName.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && coach.isActive) ||
        (statusFilter === "inactive" && !coach.isActive)

      const matchesVerification =
        verificationFilter === "all" ||
        (verificationFilter === "verified" && coach.isVerified) ||
        (verificationFilter === "unverified" && !coach.isVerified)

      return matchesSearch && matchesStatus && matchesVerification
    })

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [coaches, searchTerm, statusFilter, verificationFilter, sortField, sortOrder])

  const paginatedCoaches = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedCoaches.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedCoaches, currentPage])

  const totalPages = Math.ceil(filteredAndSortedCoaches.length / itemsPerPage)

  const handleViewDetail = async (username: string) => {
    try {
      setDetailLoading(true)
      const response = await coachService.getProfileByUsername(username)
      if (response.success) {
        setSelectedCoach(response.data)
      }
    } catch (error: any) {
      toast.error("Lỗi khi tải chi tiết coach", {
        description: error.response?.data?.message || "Có lỗi xảy ra",
      })
    } finally {
      setDetailLoading(false)
    }
  }

  const handleUpdateStatus = async (username: string, field: "isVerified" | "isActive", newValue: boolean) => {
    try {
      setVerifyLoading(username)

      // Get current coach data
      const currentCoach = coaches.find((c) => c.username === username)
      if (!currentCoach) return

      // Prepare update data with current values, only changing the specified field
      const updateData = {
        username,
        isVerified: field === "isVerified" ? newValue : currentCoach.isVerified,
        isActive: field === "isActive" ? newValue : currentCoach.isActive,
      }

      await coachService.verifyCoach(updateData)

      // Update local state
      setCoaches(coaches.map((coach) => (coach.username === username ? { ...coach, [field]: newValue } : coach)))

      const statusText =
        field === "isVerified" ? (newValue ? "xác thực" : "bỏ xác thực") : newValue ? "kích hoạt" : "vô hiệu hóa"

      toast.success(`Đã ${statusText} coach thành công`)
    } catch (error: any) {
      toast.error("Lỗi khi cập nhật trạng thái", {
        description: error.response?.data?.message || "Có lỗi xảy ra",
      })
    } finally {
      setVerifyLoading(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const stats = useMemo(() => {
    const total = coaches.length
    const verified = coaches.filter((c) => c.isVerified).length
    const active = coaches.filter((c) => c.isActive).length
    const pending = coaches.filter((c) => !c.isVerified).length

    return { total, verified, active, pending }
  }, [coaches])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Coach Profiles</h1>
            <p className="text-gray-600 mt-2">Quản lý và xác thực các coach profiles</p>
          </div>
          <Button onClick={fetchCoaches} variant="outline">
            Làm mới
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng số Coach</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Đã xác thực</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Chờ xác thực</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Tìm kiếm</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Tìm theo username, tên, chuyên môn..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Trạng thái hoạt động</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
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
                <Label>Trạng thái xác thực</Label>
                <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="verified">Đã xác thực</SelectItem>
                    <SelectItem value="unverified">Chưa xác thực</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Kết quả</Label>
                <div className="text-sm text-gray-600 pt-2">
                  Hiển thị {paginatedCoaches.length} / {filteredAndSortedCoaches.length} coaches
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("username")}>
                      <div className="flex items-center space-x-2">
                        <span>Username</span>
                        {getSortIcon("username")}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("specialization")}>
                      <div className="flex items-center space-x-2">
                        <span>Chuyên môn</span>
                        {getSortIcon("specialization")}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("hourlyRate")}>
                      <div className="flex items-center space-x-2">
                        <span>Giá/giờ</span>
                        {getSortIcon("hourlyRate")}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("totalSessions")}>
                      <div className="flex items-center space-x-2">
                        <span>Sessions</span>
                        {getSortIcon("totalSessions")}
                      </div>
                    </TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCoaches.map((coach) => (
                    <TableRow key={coach.username}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{coach.username}</div>
                          {coach.fullName && <div className="text-sm text-gray-500">{coach.fullName}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={coach.specialization}>
                          {coach.specialization}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(coach.hourlyRate)}</TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-semibold">{coach.totalSessions}</div>
                          {coach.averageRating && (
                            <div className="text-sm text-gray-500">⭐ {coach.averageRating.toFixed(1)}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant={coach.isVerified ? "default" : "secondary"}>
                            {coach.isVerified ? "Đã xác thực" : "Chưa xác thực"}
                          </Badge>
                          <Badge variant={coach.isActive ? "default" : "destructive"}>
                            {coach.isActive ? "Hoạt động" : "Không hoạt động"}
                          </Badge>
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
                                onClick={() => handleViewDetail(coach.username)}
                                className="w-full"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Chi tiết
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Chi tiết Coach Profile</DialogTitle>
                                <DialogDescription>Thông tin chi tiết của coach {coach.username}</DialogDescription>
                              </DialogHeader>
                              {detailLoading ? (
                                <div className="flex justify-center py-8">
                                  <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                </div>
                              ) : (
                                selectedCoach && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-semibold">Username</Label>
                                        <p className="text-sm">{selectedCoach.username}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Họ tên</Label>
                                        <p className="text-sm">{selectedCoach.fullName || "Chưa cập nhật"}</p>
                                      </div>
                                    </div>

                                    <div>
                                      <Label className="font-semibold">Chuyên môn</Label>
                                      <p className="text-sm">{selectedCoach.specialization}</p>
                                    </div>

                                    <div>
                                      <Label className="font-semibold">Bằng cấp</Label>
                                      <p className="text-sm">{selectedCoach.qualifications}</p>
                                    </div>

                                    <div>
                                      <Label className="font-semibold">Kinh nghiệm</Label>
                                      <p className="text-sm">{selectedCoach.experience}</p>
                                    </div>

                                    <div>
                                      <Label className="font-semibold">Chứng minh chứng chỉ</Label>
                                      <p className="text-sm">{selectedCoach.certificationProof}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-semibold">Giá theo giờ</Label>
                                        <p className="text-sm">{formatCurrency(selectedCoach.hourlyRate)}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Tổng sessions</Label>
                                        <p className="text-sm">{selectedCoach.totalSessions}</p>
                                      </div>
                                    </div>

                                    <div>
                                      <Label className="font-semibold">Lịch làm việc</Label>
                                      <p className="text-sm">{selectedCoach.availability}</p>
                                    </div>

                                    <div className="flex space-x-4 pt-4">
                                      <Badge variant={selectedCoach.isVerified ? "default" : "secondary"}>
                                        {selectedCoach.isVerified ? "Đã xác thực" : "Chưa xác thực"}
                                      </Badge>
                                      <Badge variant={selectedCoach.isActive ? "default" : "destructive"}>
                                        {selectedCoach.isActive ? "Hoạt động" : "Không hoạt động"}
                                      </Badge>
                                    </div>
                                  </div>
                                )
                              )}
                            </DialogContent>
                          </Dialog>

                          {/* Verification Status Button */}
                          <Button
                            variant={coach.isVerified ? "destructive" : "default"}
                            size="sm"
                            onClick={() => handleUpdateStatus(coach.username, "isVerified", !coach.isVerified)}
                            disabled={verifyLoading === coach.username}
                            className={`w-full ${!coach.isVerified ? "bg-green-600!" : "bg-red-600!"}`}
                          >
                            {verifyLoading === coach.username ? (
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-1" />
                            ) : coach.isVerified ? (
                              <XCircle className="w-4 h-4 mr-1" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-1" />
                            )}
                            {coach.isVerified ? "Bỏ xác thực" : "Xác thực"}
                          </Button>

                          {/* Active Status Button */}
                          <Button
                            variant={coach.isActive ? "destructive" : "default"}
                            size="sm"
                            onClick={() => handleUpdateStatus(coach.username, "isActive", !coach.isActive)}
                            disabled={verifyLoading === coach.username}
                             className={`w-full ${!coach.isActive ? "bg-green-600!" : "bg-red-600!"}`}
                          >
                            {verifyLoading === coach.username ? (
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-1" />
                            ) : coach.isActive ? (
                              <XCircle className="w-4 h-4 mr-1" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-1" />
                            )}
                            {coach.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {paginatedCoaches.length === 0 && (
              <div className="text-center py-8 text-gray-500">Không tìm thấy coach nào phù hợp với bộ lọc</div>
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
                      e.preventDefault()
                      if (currentPage > 1) setCurrentPage(currentPage - 1)
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(pageNum)
                        }}
                        isActive={currentPage === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  )
}
