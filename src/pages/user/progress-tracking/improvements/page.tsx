"use client";

import { useState, useEffect } from "react";
import {
  Check,
  Heart,
  Sparkles,
  ArrowLeft,
  Clock,
  TrendingUp,
  Award,
  Calendar,
  Activity,
  Zap,
  Wind,
  Eye,
  Smile,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { progressTrackingService } from "@/services/progress-tracking/service";
import type { HealthImprovement } from "@/services/progress-tracking/type";
import { getUserFromToken } from "@/utils/token/auth";
import { useNavigate } from "react-router-dom";
import { USER_ROUTES } from "@/routes/user/user";

export default function UserProgressTrackingImprovements() {
  const navigate = useNavigate();
  const [improvements, setImprovements] = useState<HealthImprovement[]>([]);
  const [unacknowledged, setUnacknowledged] = useState<HealthImprovement[]>([]);
  const [loading, setLoading] = useState(true);
  const username = getUserFromToken()?.username;

  useEffect(() => {
    const fetchImprovements = async () => {
      if (!username) {
        setLoading(false);
        return;
      }
      try {
        const [allImprovements, unacknowledgedImprovements] = await Promise.all(
          [
            progressTrackingService.improvements.getAll(username),
            progressTrackingService.improvements.getUnacknowledged(username),
          ]
        );
        setImprovements(allImprovements);
        setUnacknowledged(unacknowledgedImprovements);
      } catch (error) {
        console.error("Error fetching improvements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImprovements();
  }, [username]);

  const handleAcknowledge = async (improvementId: number) => {
    if (!username) {
      console.error("Username is undefined. Cannot acknowledge improvement.");
      return;
    }
    try {
      await progressTrackingService.improvements.acknowledge(
        username,
        improvementId
      );
      // Update local state
      setImprovements((prev) =>
        prev.map((imp) =>
          imp.id === improvementId ? { ...imp, isAcknowledged: true } : imp
        )
      );
      setUnacknowledged((prev) =>
        prev.filter((imp) => imp.id !== improvementId)
      );
    } catch (error) {
      console.error("Error acknowledging improvement:", error);
    }
  };

  const getImprovementIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "cardiovascular":
        return <Heart className="h-6 w-6 text-red-500" />;
      case "respiratory":
        return <Wind className="h-6 w-6 text-blue-500" />;
      case "sleep":
        return <Clock className="h-6 w-6 text-purple-500" />;
      case "energy":
        return <Zap className="h-6 w-6 text-yellow-500" />;
      case "taste":
        return <Smile className="h-6 w-6 text-pink-500" />;
      case "smell":
        return <Eye className="h-6 w-6 text-green-500" />;
      default:
        return <Sparkles className="h-6 w-6 text-indigo-500" />;
    }
  };

  const getImprovementEmoji = (type: string) => {
    switch (type.toLowerCase()) {
      case "cardiovascular":
        return "❤️";
      case "respiratory":
        return "🫁";
      case "sleep":
        return "😴";
      case "energy":
        return "⚡";
      case "taste":
        return "👅";
      case "smell":
        return "👃";
      default:
        return "✨";
    }
  };

  const timelineData = [
    {
      time: "20 phút",
      title: "Nhịp tim và huyết áp giảm",
      description: "Cơ thể bắt đầu phục hồi ngay lập tức",
      icon: <Heart className="h-5 w-5" />,
      color: "from-red-500 to-pink-500",
    },
    {
      time: "12 giờ",
      title: "Mức CO trong máu bình thường",
      description: "Oxy trong máu tăng lên mức bình thường",
      icon: <Activity className="h-5 w-5" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      time: "2 tuần",
      title: "Tuần hoàn máu cải thiện",
      description: "Chức năng tim mạch được cải thiện đáng kể",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "from-green-500 to-emerald-500",
    },
    {
      time: "1 tháng",
      title: "Chức năng phổi tăng 30%",
      description: "Hô hấp dễ dàng hơn, ít ho và đờm",
      icon: <Wind className="h-5 w-5" />,
      color: "from-purple-500 to-violet-500",
    },
    {
      time: "3 tháng",
      title: "Vị giác và khứu giác phục hồi",
      description: "Cảm nhận hương vị thức ăn tốt hơn",
      icon: <Smile className="h-5 w-5" />,
      color: "from-orange-500 to-amber-500",
    },
    {
      time: "1 năm",
      title: "Nguy cơ bệnh tim giảm 50%",
      description: "Sức khỏe tim mạch được cải thiện đáng kể",
      icon: <Award className="h-5 w-5" />,
      color: "from-indigo-500 to-purple-500",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải cải thiện sức khỏe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header with Back Button */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  navigate(USER_ROUTES.PROGRESS_TRACKING.DASHBOARD)
                }
                className="text-black hover:bg-white/20 rounded-full p-2"
              >
                <ArrowLeft className="h-5 w-5" />
                Back
              </Button>
              <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-4 py-2">
                <Sparkles className="h-5 w-5 text-white" />
                <span className="text-sm text-white font-medium">
                  {improvements.length} cải thiện đã đạt được
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Cải thiện sức khỏe</h1>
                <p className="text-green-100 text-lg">
                  Theo dõi những cải thiện tích cực trong hành trình cai thuốc
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Unacknowledged Improvements */}
        {unacknowledged.length > 0 && (
          <Card className="border-0 shadow-2xl bg-gradient-to-r from-green-100 via-emerald-50 to-green-100 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20"></div>
            <CardHeader className="relative z-10 pb-4">
              <CardTitle className="flex items-center space-x-3 text-green-800">
                <div className="p-2 bg-green-200 rounded-full">
                  <Sparkles className="h-6 w-6 text-green-700" />
                </div>
                <span className="text-xl">🎉 Cải thiện mới!</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 pt-0">
              <div className="space-y-4">
                {unacknowledged.map((improvement) => (
                  <div
                    key={improvement.id}
                    className="flex items-center justify-between p-6 bg-white/90 backdrop-blur-sm rounded-2xl border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full">
                        {getImprovementIcon(improvement.improvementType)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">
                          {improvement.description}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(
                              improvement.dateAchieved
                            ).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAcknowledge(improvement.id)}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-xl hover:scale-105"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Tôi đã cảm nhận được
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Improvements */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-t-xl border-b">
            <CardTitle className="flex items-center space-x-3 text-gray-800">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Heart className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xl">Tất cả cải thiện</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {improvements.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {improvements.map((improvement) => (
                  <div
                    key={improvement.id}
                    className="group p-6 border-2 border-gray-100 rounded-2xl hover:border-green-200 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-white to-gray-50"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full group-hover:from-green-100 group-hover:to-emerald-100 transition-all duration-300">
                          {getImprovementIcon(improvement.improvementType)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {improvement.description}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(
                                improvement.dateAchieved
                              ).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        className={
                          improvement.isAcknowledged
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-gray-100 text-gray-800 border-gray-200"
                        }
                      >
                        {improvement.isAcknowledged ? (
                          <div className="flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Đã xác nhận
                          </div>
                        ) : (
                          "Chưa xác nhận"
                        )}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Chưa có cải thiện nào được ghi nhận
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Hãy kiên trì cai thuốc, những cải thiện sức khỏe sẽ sớm xuất
                  hiện! Cơ thể bạn đang phục hồi từng ngày.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health Benefits Timeline */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 rounded-t-xl border-b">
            <CardTitle className="flex items-center space-x-3 text-gray-800">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xl">Lợi ích sức khỏe theo thời gian</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {timelineData.map((item, index) => (
                <div key={index} className="flex items-start space-x-6 group">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}
                    >
                      <div className="text-white">{item.icon}</div>
                    </div>
                    {index < timelineData.length - 1 && (
                      <div className="w-0.5 h-12 bg-gradient-to-b from-gray-300 to-transparent mt-4"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="bg-gradient-to-r from-white to-gray-50 p-6 rounded-2xl border border-gray-100 group-hover:border-gray-200 group-hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-gray-100 text-gray-800 font-semibold px-3 py-1">
                          {item.time}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-gray-900 text-lg mb-2">
                        {item.title}
                      </h4>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Motivational Card */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <CardContent className="relative z-10 p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">
              Bạn đang làm rất tốt! 🎉
            </h3>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Mỗi ngày không hút thuốc là một chiến thắng. Cơ thể bạn đang tự
              chữa lành và trở nên khỏe mạnh hơn từng ngày.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
