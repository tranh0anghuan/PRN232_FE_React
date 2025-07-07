"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  DollarSign,
  Heart,
  Cigarette,
  TrendingUp,
  Droplets,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCard } from "./components/stats-card";
import { progressTrackingService } from "@/services/progress-tracking/service";
import { ProgressChart } from "./components/progress-chart";
import type {
  ProgressSummary,
  ProgressTrackingEntry,
} from "@/services/progress-tracking/type";

export default function UserProgressTrackingDashboard() {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [recentEntries, setRecentEntries] = useState<ProgressTrackingEntry[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  const username = "user"; // In real app, get from auth context

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, entriesData] = await Promise.all([
          progressTrackingService.user.getSummary(username),
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const chartData = recentEntries.map((entry) => ({
    date: entry.trackingDate,
    cigarettes: entry.cigarettesSmoked,
    mood: entry.moodRating,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Chào mừng trở lại!</h1>
            <p className="text-green-100 text-lg">
              Theo dõi tiến độ cai thuốc của bạn
            </p>
          </div>
          <Button className="bg-white text-green-600 hover:bg-green-50 shadow-lg">
            Ghi nhật ký hôm nay
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Ngày không hút thuốc"
          value={summary?.smokeFreeStreak || 0}
          icon={Calendar}
          description="Chuỗi ngày liên tiếp"
        />
        <StatsCard
          title="Tiền tiết kiệm"
          value={`${(summary?.totalMoneySaved || 0).toLocaleString("vi-VN")}đ`}
          icon={DollarSign}
          description="Tổng số tiền đã tiết kiệm"
        />
        <StatsCard
          title="Tâm trạng trung bình"
          value={`${(summary?.averageMoodRating || 0).toFixed(1)}/10`}
          icon={Heart}
          description="Điểm tâm trạng trung bình"
        />
        <StatsCard
          title="Thời gian tập luyện"
          value={`${summary?.totalExerciseMinutes || 0} phút`}
          icon={TrendingUp}
          description="Tổng thời gian tập thể dục"
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid gap-4 md:grid-cols-7">
        <ProgressChart data={chartData} />

        <Card className="col-span-3 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
            <CardTitle className="text-gray-900">Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentEntries
                .slice(-5)
                .reverse()
                .map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center space-x-4 p-3 bg-green-50/50 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(entry.trackingDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        {entry.cigarettesSmoked} điếu thuốc • Tâm trạng:{" "}
                        {entry.moodRating}/10
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
          <CardTitle className="text-gray-900">Hành động nhanh</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Button
              variant="outline"
              className="h-20 flex-col bg-white hover:bg-green-50 border-green-200 hover:border-green-300 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Cigarette className="h-6 w-6 mb-2 text-green-600" />
              <span className="text-gray-700">Ghi nhật ký hôm nay</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col bg-white hover:bg-green-50 border-green-200 hover:border-green-300 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Heart className="h-6 w-6 mb-2 text-green-600" />
              <span className="text-gray-700">Xem cải thiện sức khỏe</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col bg-white hover:bg-green-50 border-green-200 hover:border-green-300 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Droplets className="h-6 w-6 mb-2 text-green-600" />
              <span className="text-gray-700">Theo dõi nước uống</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
