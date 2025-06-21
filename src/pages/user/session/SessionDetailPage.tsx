/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

import {
  Calendar,
  Clock,
  Users,
  Star,
  ArrowLeft,
  Edit,
  Save,
  X,
  User,
  DollarSign,
  LinkIcon,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock3,
} from "lucide-react"
import { sessionService } from "@/services/session/sessionService"
import { USER_ROUTES } from "@/routes/user/user"
import { Link, useNavigate } from "react-router-dom"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useParams } from "react-router-dom"
import { getUserFromToken } from "@/utils/token/auth"
import { ratingService } from "@/services/rating/ratingService"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function SessionDetailPage() {
    const { id } = useParams<{ id: string }>(); 
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editData, setEditData] = useState({
    sessionId: 0,
    scheduledStart: "",
    scheduledEnd: "",
    status: "",
    notes: "",
    paymentStatus: "",
    meetingLink: "",
  })
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [rating, setRating] = useState({
    sessionId: id,
    ratingValue: 5,
    review: "",
    ratingType: "session",
  });

  useEffect(() => {
    fetchSessionDetail()
  }, [id])

  const fetchSessionDetail = async () => {
    setIsLoading(true)
    try {
      const response = await sessionService.getSessionById(id)
      if (response.success) {
        setSession(response.data)
        setEditData({
          sessionId: response.data.sessionId,
          scheduledStart: response.data.scheduledStart.slice(0, 16), // Format for datetime-local
          scheduledEnd: response.data.scheduledEnd.slice(0, 16),
          status: response.data.status,
          notes: response.data.notes || "",
          paymentStatus: response.data.paymentStatus,
          meetingLink: response.data.meetingLink,
        })
      }
    } catch (error:any) {
      toast(error.response?.data?.message || "Không thể tải thông tin session")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await sessionService.updateSession(editData)
      toast("Cập nhật thành công")
      setIsEditing(false)
      fetchSessionDetail()
    } catch (error:any) {
      toast(error.response?.data?.message || "Không thể cập nhật session")
    } finally {
      setIsSaving(false)
    }
  }
  const navigate = useNavigate();
  const handleCancel = () => {
    setIsEditing(false)
    if (session) {
      setEditData({
        sessionId: session.sessionId,
        scheduledStart: session.scheduledStart.slice(0, 16),
        scheduledEnd: session.scheduledEnd.slice(0, 16),
        status: session.status,
        notes: session.notes || "",
        paymentStatus: session.paymentStatus,
        meetingLink: session.meetingLink,
      })
    }
  }

  const formatDateTime = (dateString:any) => {
    return new Date(dateString).toLocaleString("vi-VN")
  }


  const canEdit = session && session.status !== "completed"  && session.coach.username === getUserFromToken()?.username  

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="flex items-center justify-center py-20">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải thông tin session...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="flex items-center justify-center py-20">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Không tìm thấy session</p>
              <Button asChild>
                <Link to={USER_ROUTES.USER_SESSION}>Quay lại danh sách</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(session.status)
  const paymentInfo = getPaymentStatusInfo(session.paymentStatus)
  const StatusIcon = statusInfo.icon
 

  const handleSubmitRating = async (e: any) => {
    e.preventDefault();
    try {
      await ratingService.createRating(rating);
      toast("Đánh giá thành công");
      setShowRatingDialog(false);
      fetchSessionDetail();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể gửi đánh giá");
    }
  };

  const openRatingDialog = (session: any) => {
    setRating({
      sessionId: session.sessionId,
      ratingValue: 5,
      review: "",
      ratingType: "session",
    });
    setShowRatingDialog(true);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate(-1)}>
               
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Chi tiết Session</h1>
                <p className="text-gray-600 mt-1">Xem và quản lý thông tin session</p>
              </div>
            </div>

            <div className="flex gap-2">
              {canEdit && !isEditing && (
                <Button onClick={() => setIsEditing(true)} className="bg-green-600 hover:bg-green-700">
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Button>
              )}
              {isEditing && (
                <>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-2" />
                    Hủy
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Đang lưu..." : "Lưu"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{session.sessionTitle}</CardTitle>
                    <CardDescription className="text-base mt-2">{session.sessionDescription}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon className="w-5 h-5" />
                    <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Session Type & Fee */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Loại session</p>
                      <p className="text-lg font-semibold">{session.sessionType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Phí session</p>
                      <p className="text-lg font-semibold">{session.sessionFee.toLocaleString("vi-VN")} VND</p>
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Thời gian bắt đầu</Label>
                    {isEditing ? (
                      <Input
                        type="datetime-local"
                        value={editData.scheduledStart}
                        onChange={(e) => setEditData({ ...editData, scheduledStart: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{formatDateTime(session.scheduledStart)}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Thời gian kết thúc</Label>
                    {isEditing ? (
                      <Input
                        type="datetime-local"
                        value={editData.scheduledEnd}
                        onChange={(e) => setEditData({ ...editData, scheduledEnd: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{formatDateTime(session.scheduledEnd)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status & Payment */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Trạng thái session</Label>
                    {isEditing ? (
                      <Select
                        value={editData.status}
                        onValueChange={(value) => setEditData({ ...editData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Đang mở</SelectItem>
                          <SelectItem value="scheduled">Đã đặt</SelectItem>
                          <SelectItem value="expired">Hết hạn</SelectItem>
                          <SelectItem value="completed">Kết thúc</SelectItem>
                          <SelectItem value="cancelled">Đã hủy</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <StatusIcon className="w-4 h-4 text-gray-500" />
                        <span>{statusInfo.label}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Trạng thái thanh toán</Label>
                    {isEditing ? (
                      <Select
                        value={editData.paymentStatus}
                        onValueChange={(value) => setEditData({ ...editData, paymentStatus: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Chờ thanh toán</SelectItem>
                          <SelectItem value="paid">Đã thanh toán</SelectItem>
                          <SelectItem value="failed">Thanh toán thất bại</SelectItem>
                          <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <Badge className={paymentInfo.color}>{paymentInfo.label}</Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* Meeting Link */}
                <div className="space-y-2">
                  <Label>Link meeting</Label>
                  {isEditing ? (
                    <Input
                      value={editData.meetingLink}
                      onChange={(e) => setEditData({ ...editData, meetingLink: e.target.value })}
                      placeholder="https://meet.google.com/..."
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <LinkIcon className="w-4 h-4 text-gray-500" />
                      {session.meetingLink ? (
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate"
                        >
                          {session.meetingLink}
                        </a>
                      ) : (
                        <span className="text-gray-500">Chưa có link meeting</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Ghi chú</Label>
                  {isEditing ? (
                    <Textarea
                      value={editData.notes}
                      onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                      placeholder="Thêm ghi chú cho session..."
                      rows={3}
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg min-h-[80px]">
                      {session.notes || <span className="text-gray-500">Chưa có ghi chú</span>}
                    </div>
                  )}
                </div>

                {/* Meeting Action */}
                {session.meetingLink && !isEditing && (
                  <div className="pt-4 border-t">
                    <Button asChild className="bg-white hover:bg-blue-200">
                      <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Tham gia Meeting
                      </a>
                    </Button>
                  </div>
                )}
                {session.status === "completed" && session.clientUsername === getUserFromToken()?.username &&
                            !session.rating && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openRatingDialog(session)}
                                className="flex-1"
                              >
                                <Star className="w-3 h-3 mr-1" />
                                Đánh giá
                              </Button>
                            )}
              </CardContent>
            </Card>
            
            {/* Rating Section */}
            {session.rating && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Đánh giá từ khách hàng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{session.rating.ratingValue}/5</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < session.rating.ratingValue ? "text-yellow-500 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">{session.rating.review}</p>
                    <p className="text-sm text-gray-500">
                      Đánh giá bởi {session.rating.raterUsername} • {formatDateTime(session.rating.createdAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Coach Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Thông tin Coach
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tên coach</p>
                  <p className="font-semibold">{session.coach.fullName || session.coach.username}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Chuyên môn</p>
                  <p>{session.coach.specialization}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Giá theo giờ</p>
                  <p className="font-semibold text-green-600">{session.coach.hourlyRate.toLocaleString("vi-VN")} VND</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Trạng thái</p>
                  <div className="flex gap-2">
                    <Badge variant={session.coach.isVerified ? "default" : "secondary"}>
                      {session.coach.isVerified ? "Đã xác thực" : "Chưa xác thực"}
                    </Badge>
                    <Badge variant={session.coach.isActive ? "default" : "destructive"}>
                      {session.coach.isActive ? "Hoạt động" : "Không hoạt động"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Info */}
            {session.client && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Thông tin Khách hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tên khách hàng</p>
                    <p className="font-semibold">{session.client.fullName || session.client.username}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p>{session.client.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Số điện thoại</p>
                    <p>{session.client.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Giới tính</p>
                    <p>{session.client.gender}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Session Status Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800">Trạng thái Session</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-3">
                  <StatusIcon className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-800">{statusInfo.label}</p>
                    <p className="text-sm text-blue-600">{statusInfo.description}</p>
                  </div>
                </div>

                {!canEdit && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">⚠️ Session này không thể chỉnh sửa vì đã có khách hàng đặt</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Hành động nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" onClick={() => navigate(-1)} className="w-full justify-start">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </Button>
                {session.meetingLink && (
                  <Button asChild variant="outline" className="w-full justify-start">
                    <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Tham gia Meeting
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
       {/* Rating Dialog */}
       <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Đánh giá Session</DialogTitle>
              <DialogDescription>
                Hãy chia sẻ trải nghiệm của bạn về session này
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitRating} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ratingValue">Điểm đánh giá (1-5)</Label>
                <Input
                  id="ratingValue"
                  type="number"
                  min="1"
                  max="5"
                  value={rating.ratingValue}
                  onChange={(e) =>
                    setRating({
                      ...rating,
                      ratingValue: Number.parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="review">Nhận xét</Label>
                <Textarea
                  id="review"
                  value={rating.review}
                  onChange={(e) =>
                    setRating({ ...rating, review: e.target.value })
                  }
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRatingDialog(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Gửi đánh giá
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
    </div>
  )
}
export const getStatusInfo = (status:any) => {
    switch (status) {
      case "open":
        return {
          label: "Đang mở",
          color: "bg-green-100 text-green-800",
          icon: CheckCircle,
          description: "Session đang mở và có thể được đặt",
        }
      case "scheduled":
        return {
          label: "Đã đặt",
          color: "bg-blue-100 text-blue-800",
          icon: Clock3,
          description: "Session đã có khách hàng đặt",
        }
      case "expired":
        return {
          label: "Hết hạn",
          color: "bg-orange-100 text-orange-800",
          icon: AlertCircle,
          description: "Session đã quá thời gian",
        }
      case "completed":
        return {
          label: "Kết thúc",
          color: "bg-gray-100 text-gray-800",
          icon: CheckCircle,
          description: "Session đã hoàn thành",
        }
      case "cancelled":
        return {
          label: "Đã hủy",
          color: "bg-red-100 text-red-800",
          icon: XCircle,
          description: "Session đã bị hủy",
        }
      default:
        return {
          label: status,
          color: "bg-gray-100 text-gray-800",
          icon: AlertCircle,
          description: "Trạng thái không xác định",
        }
    }
  }
  
  export const getPaymentStatusInfo = (paymentStatus:any) => {
    switch (paymentStatus) {
      case "pending":
        return { label: "Chờ thanh toán", color: "bg-yellow-100 text-yellow-800" }
      case "paid":
        return { label: "Đã thanh toán", color: "bg-green-100 text-green-800" }
      case "failed":
        return { label: "Thanh toán thất bại", color: "bg-red-100 text-red-800" }
      case "refunded":
        return { label: "Đã hoàn tiền", color: "bg-blue-100 text-blue-800" }
      default:
        return { label: paymentStatus, color: "bg-gray-100 text-gray-800" }
    }
  }