"use client";

import { useState, useEffect } from "react";
import { Check, Heart, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { progressTrackingService } from "@/services/progress-tracking/service";
import type { HealthImprovement } from "@/services/progress-tracking/type";

export default function UserProgressTrackingImprovements() {
  const [improvements, setImprovements] = useState<HealthImprovement[]>([]);
  const [unacknowledged, setUnacknowledged] = useState<HealthImprovement[]>([]);
  const [loading, setLoading] = useState(true);

  const username = "user"; // In real app, get from auth context

  useEffect(() => {
    const fetchImprovements = async () => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white shadow-xl">
          <h1 className="text-3xl font-bold mb-2">Cải thiện sức khỏe</h1>
          <p className="text-green-100">
            Theo dõi những cải thiện tích cực trong hành trình cai thuốc
          </p>
        </div>
      </div>

      {/* Unacknowledged Improvements */}
      {unacknowledged.length > 0 && (
        <Card className="border-green-300 bg-gradient-to-r from-green-50 to-green-100 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Sparkles className="h-5 w-5" />
              <span>Cải thiện mới!</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unacknowledged.map((improvement) => (
                <div
                  key={improvement.id}
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-green-200 shadow-md"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {getImprovementIcon(improvement.improvementType)}
                    </span>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {improvement.description}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(improvement.dateAchieved).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleAcknowledge(improvement.id)}
                    size="sm"
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Tôi đã cảm nhận được
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Improvements */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
          <CardTitle className="flex items-center space-x-2 text-gray-900">
            <Heart className="h-5 w-5" />
            <span>Tất cả cải thiện</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {improvements.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {improvements.map((improvement) => (
                <div key={improvement.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {getImprovementIcon(improvement.improvementType)}
                      </span>
                      <div>
                        <h3 className="font-medium">
                          {improvement.description}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(
                            improvement.dateAchieved
                          ).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        improvement.isAcknowledged ? "default" : "secondary"
                      }
                    >
                      {improvement.isAcknowledged
                        ? "Đã xác nhận"
                        : "Chưa xác nhận"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có cải thiện nào được ghi nhận
              </h3>
              <p className="text-gray-500">
                Hãy kiên trì cai thuốc, những cải thiện sức khỏe sẽ sớm xuất
                hiện!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Health Benefits Timeline */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
          <CardTitle className="text-gray-900">
            Lợi ích sức khỏe theo thời gian
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-sm font-bold text-white">20p</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">
                  Nhịp tim và huyết áp giảm
                </h4>
                <p className="text-sm text-gray-600">
                  Sau 20 phút không hút thuốc
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-sm font-bold text-white">12h</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">
                  Mức CO trong máu bình thường
                </h4>
                <p className="text-sm text-gray-600">
                  Sau 12 giờ không hút thuốc
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-sm font-bold text-white">2w</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">
                  Tuần hoàn máu cải thiện
                </h4>
                <p className="text-sm text-gray-600">
                  Sau 2 tuần không hút thuốc
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-sm font-bold text-white">1m</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">
                  Chức năng phổi tăng 30%
                </h4>
                <p className="text-sm text-gray-600">
                  Sau 1 tháng không hút thuốc
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
