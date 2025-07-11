/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  Users,
  Star,
  Plus,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { getUserFromToken } from "@/utils/token/auth";
import { sessionService } from "@/services/session/sessionService";
import { USER_ROUTES } from "@/routes/user/user";
import { Link } from "react-router-dom";
import { getStatusInfo } from "./SessionDetailPage";

export default function CoachSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSession, setNewSession] = useState({
    coachUsername: "",
    sessionTitle: "",
    sessionDescription: "",
    scheduledStart: "",
    scheduledEnd: "",
    sessionType: "",
    meetingLink: "",
    sessionFee: 0,
    notes: "",
  });

  useEffect(() => {
    const user = getUserFromToken();
    if (user) {
      setNewSession((prev) => ({ ...prev, coachUsername: user.username }));
      fetchSessions(user.username);
    }
  }, []);

  const fetchSessions = async (username: any) => {
    setIsLoading(true);
    try {
      const response = await sessionService.getAllSessions({
        coachUsername: username,
        pageIndex: 1,
        pageSize: 50,
      });
      if (response.success) {
        setSessions(response.data);
      }
    } catch (error: any) {
      toast(
        "Lỗi",
        error.response?.data?.message || "Không thể tải danh sách sessions"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSession = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await sessionService.createSession(newSession);
      toast("Tạo session thành công");
      setShowCreateDialog(false);
      setNewSession({
        coachUsername: getUserFromToken()?.username || "",
        sessionTitle: "",
        sessionDescription: "",
        scheduledStart: "",
        scheduledEnd: "",
        sessionType: "",
        meetingLink: "",
        sessionFee: 0,
        notes: "",
      });
      fetchSessions(getUserFromToken()?.username);
    } catch (error: any) {
      toast("Lỗi", error.response?.data?.message || "Không thể tạo session");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: any) => {
    if (!confirm("Bạn có chắc muốn xóa session này?")) return;

    try {
      await sessionService.deleteSession(sessionId);
      toast("Xóa thành công");
      fetchSessions(getUserFromToken()?.username);
    } catch (error: any) {
      toast("Lỗi", error.response?.data?.message || "Không thể xóa session");
    }
  };

  const formatDateTime = (dateString: any) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <a href={USER_ROUTES.COACH_PROFILE}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại Profile
                </a>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  My Sessions
                </h1>
                <p className="text-gray-600 mt-1">
                  Quản lý các session coaching của bạn
                </p>
              </div>
            </div>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-green-600! hover:bg-green-700!">
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo Session Mới
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tạo Session Mới</DialogTitle>
                  <DialogDescription>
                    Tạo session tư vấn mới cho khách hàng
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSession} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sessionTitle">Tiêu đề session *</Label>
                      <Input
                        id="sessionTitle"
                        value={newSession.sessionTitle}
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            sessionTitle: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sessionType">Loại session *</Label>
                      <Input
                        id="sessionType"
                        value={newSession.sessionType}
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            sessionType: e.target.value,
                          })
                        }
                        placeholder="VD: Tư vấn cá nhân, Nhóm..."
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sessionDescription">Mô tả *</Label>
                    <Textarea
                      id="sessionDescription"
                      value={newSession.sessionDescription}
                      onChange={(e) =>
                        setNewSession({
                          ...newSession,
                          sessionDescription: e.target.value,
                        })
                      }
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="scheduledStart">
                        Thời gian bắt đầu *
                      </Label>
                      <Input
                        id="scheduledStart"
                        type="datetime-local"
                        value={newSession.scheduledStart}
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            scheduledStart: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scheduledEnd">Thời gian kết thúc *</Label>
                      <Input
                        id="scheduledEnd"
                        type="datetime-local"
                        value={newSession.scheduledEnd}
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            scheduledEnd: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="meetingLink">Link meeting *</Label>
                      <Input
                        id="meetingLink"
                        value={newSession.meetingLink}
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            meetingLink: e.target.value,
                          })
                        }
                        placeholder="https://meet.google.com/..."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sessionFee">Phí session (VND) *</Label>
                      <Input
                        id="sessionFee"
                        type="number"
                        value={newSession.sessionFee}
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            sessionFee: Number.parseInt(e.target.value) || 0,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Ghi chú</Label>
                    <Textarea
                      id="notes"
                      value={newSession.notes}
                      onChange={(e) =>
                        setNewSession({ ...newSession, notes: e.target.value })
                      }
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-green-600! hover:bg-green-700!"
                    >
                      {isLoading ? "Đang tạo..." : "Tạo Session"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Tổng Sessions
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {sessions.length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Đã hoàn thành
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      sessions.filter((s: any) => s.status === "completed")
                        .length
                    }
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Có khách hàng
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {sessions.filter((s: any) => s.clientUsername).length}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Đánh giá TB
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Number(
                      sessions
                        .filter(
                          (session: any) => session?.rating?.ratingValue != null
                        ) // Only keep sessions with valid ratings
                        .reduce(
                          (total, session: any) =>
                            total + session.rating.ratingValue,
                          0
                        ) /
                        (sessions.filter(
                          (session: any) => session?.rating?.ratingValue != null
                        ).length || 1)
                    ).toFixed(1)}
                  </p>
                </div>
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải sessions...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {sessions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">
                    Chưa có session nào
                  </p>
                  <p className="text-gray-400 mb-4">
                    Tạo session đầu tiên để bắt đầu coaching
                  </p>
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo Session Đầu Tiên
                  </Button>
                </CardContent>
              </Card>
            ) : (
              sessions.map((session: any) => (
                <Card
                  key={session.sessionId}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-3 mb-2">
                          <span className="text-xl">
                            {session.sessionTitle}
                          </span>
                          <Badge className={getStatusColor(session.status)}>
                            {getStatusInfo(session.status).label}
                          </Badge>
                          {session.clientUsername && (
                            <Badge
                              variant="outline"
                              className={getStatusColor(session.status)}
                            >
                              Có khách hàng
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {session.sessionDescription}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/session-detail/${session.sessionId}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        {session.status !== "completed" && !session.client && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDeleteSession(session.sessionId)
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium">Bắt đầu</p>
                          <p className="text-gray-600">
                            {formatDateTime(session.scheduledStart)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium">Kết thúc</p>
                          <p className="text-gray-600">
                            {formatDateTime(session.scheduledEnd)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium">Khách hàng</p>
                          <p className="text-gray-600">
                            {session.clientUsername || "Chưa có"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium">Phí</p>
                          <p className="text-gray-600">
                            {session.sessionFee.toLocaleString("vi-VN")} VND
                          </p>
                        </div>
                      </div>
                    </div>

                    {session.meetingLink && (
                      <div className="mt-4 pt-4 border-t">
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={session.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Tham gia Meeting
                          </a>
                        </Button>
                      </div>
                    )}

                    {session.rating && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-green-800 mb-1">
                          Đánh giá từ khách hàng: {session.rating.ratingValue}/5
                          ⭐
                        </p>
                        <p className="text-sm text-green-700">
                          {session.rating.review}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
