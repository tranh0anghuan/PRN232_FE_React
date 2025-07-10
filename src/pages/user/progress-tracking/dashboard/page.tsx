"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  DollarSign,
  Heart,
  Cigarette,
  History,
  Sparkles,
  Target,
  Award,
  ChevronRight,
  Activity,
  Smile,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { progressTrackingService } from "@/services/progress-tracking/service";
import { ProgressChart } from "./components/progress-chart";
import type {
  ProgressSummary,
  ProgressTrackingEntry,
} from "@/services/progress-tracking/type";
import { getUserFromToken } from "@/utils/token/auth";
import { useNavigate } from "react-router-dom";
import { USER_ROUTES } from "@/routes/user/user";

export default function UserProgressTrackingDashboard() {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [recentEntries, setRecentEntries] = useState<ProgressTrackingEntry[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const username = getUserFromToken()?.username;
  const navigate = useNavigate();

  // Helper function to get current month's start and end dates
  const getCurrentMonthDateRange = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      startDate: startOfMonth.toISOString().split("T")[0], // YYYY-MM-DD format
      endDate: endOfMonth.toISOString().split("T")[0],
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!username) {
        setLoading(false);
        return;
      }
      try {
        const { startDate, endDate } = getCurrentMonthDateRange();

        const [summaryData, entriesData] = await Promise.all([
          progressTrackingService.user.getSummary(username, startDate, endDate),
          progressTrackingService.user.getEntries(username),
        ]);
        setSummary(summaryData);
        setRecentEntries(entriesData.slice(-7)); // Last 7 entries for chart
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const getMoodEmoji = (rating: number) => {
    if (rating >= 8) return "😊";
    if (rating >= 6) return "🙂";
    if (rating >= 4) return "😐";
    return "😔";
  };

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return "Hãy bắt đầu hành trình của bạn!";
    if (streak === 1) return "Ngày đầu tiên - Bạn đã làm được!";
    if (streak < 7) return "Tuần đầu tiên - Tiếp tục phấn đấu!";
    if (streak < 30) return "Tuyệt vời! Bạn đang tiến bộ!";
    return "Thành tích xuất sắc! 🎉";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Đang tải bảng điều khiển...</p>
        </div>
      </div>
    );
  }

  const chartData = recentEntries.map((entry) => ({
    date: entry.trackingDate,
    cigarettes: entry.cigarettesSmoked,
    mood: entry.moodRating,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 rounded-3xl p-8 text-white shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <Badge className="bg-white/20 text-white border-0 px-4 py-1">
                    Tháng {new Date().getMonth() + 1}
                  </Badge>
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    {getGreeting()}! 👋
                  </h1>
                  <p className="text-green-100 text-xl">
                    {getStreakMessage(summary?.smokeFreeStreak || 0)}
                  </p>
                </div>
              </div>
              <Button
                onClick={() =>
                  navigate(USER_ROUTES.PROGRESS_TRACKING.DAILY_LOG)
                }
                className="bg-white text-green-600 hover:bg-green-50 shadow-xl px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-200 hover:shadow-2xl hover:scale-105"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Ghi nhật ký hôm nay
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-green-50 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-2xl">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  {summary?.smokeFreeStreak || 0 > 0
                    ? "Đang tiến bộ"
                    : "Bắt đầu"}
                </Badge>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600">
                  Ngày không hút thuốc
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  {summary?.smokeFreeStreak || 0}
                </p>
                <p className="text-sm text-gray-500">Chuỗi ngày liên tiếp</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-2xl">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  Tiết kiệm
                </Badge>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600">
                  Tiền tiết kiệm
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  {(summary?.totalMoneySaved || 0).toLocaleString("vi-VN")}đ
                </p>
                <p className="text-sm text-gray-500">
                  Tổng số tiền đã tiết kiệm
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-pink-50 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-pink-100 rounded-2xl">
                  <Heart className="h-6 w-6 text-pink-600" />
                </div>
                <Badge className="bg-pink-100 text-pink-800 border-pink-200">
                  {getMoodEmoji(summary?.averageMoodRating || 5)}
                </Badge>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600">
                  Tâm trạng trung bình
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  {(summary?.averageMoodRating || 0).toFixed(1)}/10
                </p>
                <p className="text-sm text-gray-500">
                  Điểm tâm trạng trung bình
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-orange-50 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-2xl">
                  <Activity className="h-6 w-6 text-orange-600" />
                </div>
                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                  Hoạt động
                </Badge>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600">
                  Thời gian tập luyện
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  {summary?.totalExerciseMinutes || 0}
                </p>
                <p className="text-sm text-gray-500">Phút tập thể dục</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid gap-8 lg:grid-cols-7">
          <div className="lg:col-span-4">
            <ProgressChart data={chartData} />
          </div>

          <Card className="lg:col-span-3 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-2xl border-b">
              <CardTitle className="flex items-center gap-3 text-gray-900">
                <Clock className="h-5 w-5 text-green-600" />
                Hoạt động gần đây
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {recentEntries.length > 0 ? (
                  recentEntries
                    .slice(-5)
                    .reverse()
                    .map((entry) => (
                      <div
                        key={entry.trackingId}
                        className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50/50 to-blue-50/50 rounded-xl border border-green-100 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-sm"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">
                            {new Date(entry.trackingDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Cigarette className="h-3 w-3" />
                              {entry.cigarettesSmoked} điếu
                            </span>
                            <span className="flex items-center gap-1">
                              <Smile className="h-3 w-3" />
                              {entry.moodRating}/10
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Chưa có hoạt động nào</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Quick Actions */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl border-b">
            <CardTitle className="flex items-center gap-3 text-gray-900">
              <Target className="h-6 w-6 text-purple-600" />
              Hành động nhanh
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid gap-6 md:grid-cols-3">
              <Button
                onClick={() =>
                  navigate(USER_ROUTES.PROGRESS_TRACKING.DAILY_LOG)
                }
                variant="outline"
                className="group h-24 flex-col bg-gradient-to-br from-white to-green-50 hover:from-green-50 hover:to-green-100 border-2 border-green-200 hover:border-green-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="p-3 bg-green-100 rounded-full  group-hover:bg-green-200 transition-colors">
                  <Cigarette className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-gray-700 font-medium">
                  Ghi nhật ký hôm nay
                </span>
              </Button>

              <Button
                onClick={() =>
                  navigate(USER_ROUTES.PROGRESS_TRACKING.IMPROVEMENTS)
                }
                variant="outline"
                className="group h-24 flex-col bg-gradient-to-br from-white to-pink-50 hover:from-pink-50 hover:to-pink-100 border-2 border-pink-200 hover:border-pink-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="p-3 bg-pink-100 rounded-full  group-hover:bg-pink-200 transition-colors">
                  <Heart className="h-6 w-6 text-pink-600" />
                </div>
                <span className="text-gray-700 font-medium">
                  Xem cải thiện sức khỏe
                </span>
              </Button>

              <Button
                onClick={() => navigate(USER_ROUTES.PROGRESS_TRACKING.HISTORY)}
                variant="outline"
                className="group h-24 flex-col bg-gradient-to-br from-white to-blue-50 hover:from-blue-50 hover:to-blue-100 border-2 border-blue-200 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="p-3 bg-blue-100 rounded-full  group-hover:bg-blue-200 transition-colors">
                  <History className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-gray-700 font-medium">
                  Lịch sử theo dõi
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Motivational Footer */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <CardContent className="relative z-10 p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Award className="h-8 w-8" />
              <h3 className="text-2xl font-bold">Bạn đang làm rất tốt!</h3>
            </div>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Mỗi ngày không hút thuốc là một chiến thắng. Hãy tiếp tục hành
              trình tuyệt vời này! 🌟
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
