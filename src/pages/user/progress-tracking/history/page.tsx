import { useState, useEffect } from "react";
import { Calendar, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { progressTrackingService } from "@/services/progress-tracking/service";
import type { ProgressTrackingEntry } from "@/services/progress-tracking/type";

export default function UserProgressTrackingHistory() {
  const [entries, setEntries] = useState<ProgressTrackingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const username = "user"; // In real app, get from auth context

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const data = await progressTrackingService.user.getEntries(username);
        setEntries(
          data.sort(
            (a, b) =>
              new Date(b.trackingDate).getTime() -
              new Date(a.trackingDate).getTime()
          )
        );
      } catch (error) {
        console.error("Error fetching entries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [username]);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa nhật ký này?")) return;

    try {
      await progressTrackingService.entry.delete(id);
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return "bg-green-100 text-green-800";
    if (mood >= 6) return "bg-yellow-100 text-yellow-800";
    if (mood >= 4) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const getCravingColor = (craving: number) => {
    if (craving <= 3) return "bg-green-100 text-green-800";
    if (craving <= 6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Lịch sử theo dõi</h1>
            <p className="text-green-100">
              Xem lại hành trình cai thuốc của bạn
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-4 py-2">
            <Calendar className="h-5 w-5 text-white" />
            <span className="text-sm text-white font-medium">
              {entries.length} ngày đã ghi
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {entries.map((entry) => (
          <Card
            key={entry.id}
            className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-gray-900">
                  {new Date(entry.trackingDate).toLocaleDateString("vi-VN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-green-100"
                  >
                    <Edit className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(entry.id!)}
                    className="hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-500">
                    Thuốc lá
                  </div>
                  <div className="text-2xl font-bold">
                    {entry.cigarettesSmoked} điếu
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-500">
                    Tâm trạng
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold">
                      {entry.moodRating}/10
                    </span>
                    <Badge className={getMoodColor(entry.moodRating)}>
                      {entry.moodRating >= 7
                        ? "Tốt"
                        : entry.moodRating >= 5
                        ? "Bình thường"
                        : "Kém"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-500">
                    Thèm thuốc
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold">
                      {entry.cravingsExperienced}/10
                    </span>
                    <Badge
                      className={getCravingColor(entry.cravingsExperienced)}
                    >
                      {entry.cravingsExperienced <= 3
                        ? "Thấp"
                        : entry.cravingsExperienced <= 6
                        ? "Trung bình"
                        : "Cao"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-500">
                    Tiết kiệm
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {entry.moneySaved.toLocaleString("vi-VN")}đ
                  </div>
                </div>
              </div>

              {(entry.physicalSymptoms || entry.notes) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {entry.physicalSymptoms && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        Triệu chứng:{" "}
                      </span>
                      <span className="text-sm">{entry.physicalSymptoms}</span>
                    </div>
                  )}
                  {entry.notes && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Ghi chú:{" "}
                      </span>
                      <span className="text-sm">{entry.notes}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                {entry.minutesExercised > 0 && (
                  <span>🏃‍♂️ {entry.minutesExercised} phút tập luyện</span>
                )}
                {entry.waterIntake > 0 && (
                  <span>💧 {entry.waterIntake}ml nước</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {entries.length === 0 && (
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có nhật ký nào
              </h3>
              <p className="text-gray-600 mb-4">
                Bắt đầu ghi nhật ký hàng ngày để theo dõi tiến độ cai thuốc
              </p>
              <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg">
                Tạo nhật ký đầu tiên
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
