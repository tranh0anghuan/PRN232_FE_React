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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Clock,
  User,
  Star,
  Search,
  Filter,
  MapPin,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { getUserFromToken } from "@/utils/token/auth";
import { sessionService } from "@/services/session/sessionService";
import { ratingService } from "@/services/rating/ratingService";
import { Link } from "react-router-dom";
import { USER_ROUTES } from "@/routes/user/user";
import { getStatusInfo } from "./SessionDetailPage";

export default function UserSessionsPage() {
  const [availableSessions, setAvailableSessions] = useState([]);
  const [mySessions, setMySessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [rating, setRating] = useState({
    sessionId: 0,
    ratingValue: 5,
    review: "",
    ratingType: "session",
  });

  useEffect(() => {
    const user = getUserFromToken();
    if (user) {
      fetchAvailableSessions();
      fetchMySessions(user.username);
    }
  }, []);

  const fetchAvailableSessions = async () => {
    setIsLoading(true);
    try {
      const response = await sessionService.getAllSessions({
        pageIndex: 1,
        pageSize: 50,
      });
      if (response.success) {
        const available = response.data.filter(
          (session: any) => !session.clientUsername
        );
        setAvailableSessions(available);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể tải danh sách sessions"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMySessions = async (username: any) => {
    try {
      const response = await sessionService.getAllSessions({
        pageIndex: 1,
        pageSize: 50,
      });
      if (response.success) {
        const mySessions = response.data.filter(
          (session: any) => session.clientUsername === username
        );
        setMySessions(mySessions);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể tải danh sách sessions"
      );
    }
  };

  const handleJoinSession = async (sessionId: any) => {
    try {
      await sessionService.joinSession({
        sessionId,
        clientUsername: getUserFromToken()?.username,
      });
      toast("Tham gia thành công");
      fetchAvailableSessions();
      fetchMySessions(getUserFromToken()?.username);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Không thể tham gia session"
      );
    }
  };

  const handleSubmitRating = async (e: any) => {
    e.preventDefault();
    try {
      await ratingService.createRating(rating);
      toast("Đánh giá thành công");
      setShowRatingDialog(false);
      fetchMySessions(getUserFromToken()?.username);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể gửi đánh giá");
    }
  };

  const openRatingDialog = (session: any) => {
    setSelectedSession(session);
    setRating({
      sessionId: session.sessionId,
      ratingValue: 5,
      review: "",
      ratingType: "session",
    });
    setShowRatingDialog(true);
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

  const filteredSessions = availableSessions.filter(
    (session: any) =>
      session.sessionTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.sessionDescription
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      session.sessionType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tìm kiếm Sessions
          </h1>
          <p className="text-gray-600">
            Khám phá và tham gia các session coaching phù hợp với bạn
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm sessions theo tiêu đề, mô tả, loại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {/* <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Bộ lọc
            </Button> */}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Available Sessions */}
          <div className="xl:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Sessions Có Sẵn
              </h2>
              <Badge variant="outline" className="text-sm">
                {filteredSessions.length} sessions
              </Badge>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải sessions...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredSessions.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg mb-2">
                        {searchTerm
                          ? "Không tìm thấy session nào"
                          : "Không có session nào"}
                      </p>
                      <p className="text-gray-400">
                        {searchTerm
                          ? "Thử tìm kiếm với từ khóa khác"
                          : "Hãy quay lại sau để xem sessions mới"}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredSessions.map((session: any) => (
                    <Card
                      key={session.sessionId}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">
                              <div className="flex items-center justify-between gap-2">
                                <h3>{session.sessionTitle}</h3>
                                <Link
                                  to={`/session-detail/${session.sessionId}`}
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                              </div>
                            </CardTitle>
                            <CardDescription className="text-base mb-3">
                              {session.sessionDescription}
                            </CardDescription>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline">
                                {session.sessionType}
                              </Badge>
                              <Badge className="bg-green-100 text-green-800">
                                {session.sessionFee.toLocaleString("vi-VN")} VND
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="font-medium">Coach</p>
                              <p className="text-gray-600">
                                {session.coach?.fullName ||
                                  session.coachUsername}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="font-medium">Thời gian</p>
                              <p className="text-gray-600">
                                {formatDateTime(session.scheduledStart)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="font-medium">Thời lượng</p>
                              <p className="text-gray-600">
                                {Math.round(
                                  (new Date(session.scheduledEnd).getTime() -
                                    new Date(
                                      session.scheduledStart
                                    ).getTime()) /
                                    (1000 * 60)
                                )}{" "}
                                phút
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="w-4 h-4" />
                            <span>Online Meeting</span>
                          </div>

                          <Button
                            onClick={() => handleJoinSession(session.sessionId)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Tham gia Session
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>

          {/* My Sessions Sidebar */}
          <div>
            <div className="sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Sessions Của Tôi
              </h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {mySessions.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-gray-500">
                        Bạn chưa tham gia session nào
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  mySessions.map((session: any) => (
                    <Card
                      key={session.sessionId}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">
                              <div className="flex items-center justify-between gap-2">
                                <h3>{session.sessionTitle}</h3>
                                <Link
                                  to={`/session-detail/${session.sessionId}`}
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                              </div>
                            </CardTitle>
                            <CardDescription className="text-sm">
                              {session.sessionDescription}
                            </CardDescription>
                          </div>
                          <Badge
                            className={getStatusColor(session.status)}
                            variant="secondary"
                          >
                            {getStatusInfo(session.status).label}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600">
                              Coach: {session.coach?.username}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600">
                              Bắt đầu: {formatDateTime(session.scheduledStart)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600">
                              Kết thúc: {formatDateTime(session.scheduledEnd)}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                          {session.meetingLink && session.status !== "completed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="flex-1"
                            >
                              <a
                                href={session.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Join
                              </a>
                            </Button>
                          )}

                          {session.status === "completed" &&
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
                        </div>

                        {session.rating && (
                          <div className="mt-3 p-2 bg-green-50 rounded text-xs">
                            <p className="font-medium text-green-800">
                              Đánh giá: {session.rating.ratingValue}/5 ⭐
                            </p>
                            <p className="text-green-700 truncate">
                              {session.rating.review}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

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
      </main>
    </div>
  );
}
