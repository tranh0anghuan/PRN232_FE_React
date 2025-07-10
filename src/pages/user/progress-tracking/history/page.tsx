"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Edit,
  Trash2,
  ArrowLeft,
  Cigarette,
  Heart,
  Brain,
  DollarSign,
  Activity,
  Droplets,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { progressTrackingService } from "@/services/progress-tracking/service";
import type { ProgressTrackingEntry } from "@/services/progress-tracking/type";
import { getUserFromToken } from "@/utils/token/auth";
import { useNavigate } from "react-router-dom";
import { USER_ROUTES } from "@/routes/user/user";

export default function UserProgressTrackingHistory() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<ProgressTrackingEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<
    ProgressTrackingEntry[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingEntry, setEditingEntry] =
    useState<ProgressTrackingEntry | null>(null);
  const [editFormData, setEditFormData] = useState({
    cigarettesSmoked: 0,
    cravingsExperienced: 5,
    moodRating: 5,
    physicalSymptoms: "",
    notes: "",
    moneySaved: 0,
    minutesExercised: 0,
    waterIntake: 0,
  });
  const [updateLoading, setUpdateLoading] = useState(false);

  const username = getUserFromToken()?.username;

  useEffect(() => {
    const fetchEntries = async () => {
      if (!username) {
        setLoading(false);
        return;
      }
      try {
        const data = await progressTrackingService.user.getEntries(username);
        const sortedData = data.sort(
          (a, b) =>
            new Date(b.trackingDate).getTime() -
            new Date(a.trackingDate).getTime()
        );
        setEntries(sortedData);
        setFilteredEntries(sortedData);
      } catch (error) {
        console.error("Error fetching entries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [username]);

  useEffect(() => {
    const filtered = entries.filter(
      (entry) =>
        entry.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.physicalSymptoms
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        new Date(entry.trackingDate)
          .toLocaleDateString("vi-VN")
          .includes(searchTerm)
    );
    setFilteredEntries(filtered);
  }, [searchTerm, entries]);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa nhật ký này?")) return;
    try {
      await progressTrackingService.entry.delete(id);
      const updatedEntries = entries.filter((entry) => entry.trackingId !== id);
      setEntries(updatedEntries);
      setFilteredEntries(updatedEntries);
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  const handleEdit = (entry: ProgressTrackingEntry) => {
    setEditingEntry(entry);
    setEditFormData({
      cigarettesSmoked: entry.cigarettesSmoked,
      cravingsExperienced: entry.cravingsExperienced,
      moodRating: entry.moodRating,
      physicalSymptoms: entry.physicalSymptoms,
      notes: entry.notes,
      moneySaved: entry.moneySaved,
      minutesExercised: entry.minutesExercised,
      waterIntake: entry.waterIntake,
    });
  };

  const handleUpdate = async () => {
    if (!editingEntry) return;
    setUpdateLoading(true);
    try {
      await progressTrackingService.entry.update(editingEntry.trackingId!, {
        ...editFormData,
        username: editingEntry.username,
        trackingDate: editingEntry.trackingDate,
      });

      // Update local state
      const updatedEntries = entries.map((entry) =>
        entry.trackingId === editingEntry.trackingId
          ? { ...entry, ...editFormData }
          : entry
      );
      setEntries(updatedEntries);
      setFilteredEntries(updatedEntries);
      setEditingEntry(null);
    } catch (error) {
      console.error("Error updating entry:", error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return "bg-green-100 text-green-800 border-green-200";
    if (mood >= 6) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (mood >= 4) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getCravingColor = (craving: number) => {
    if (craving <= 3) return "bg-green-100 text-green-800 border-green-200";
    if (craving <= 6) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getMoodIcon = (mood: number) => {
    if (mood >= 8) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (mood >= 6) return <Minus className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getSmokingStatus = (cigarettes: number) => {
    if (cigarettes === 0)
      return {
        text: "Không hút",
        color: "bg-green-100 text-green-800 border-green-200",
      };
    if (cigarettes <= 5)
      return {
        text: "Ít",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      };
    if (cigarettes <= 10)
      return {
        text: "Trung bình",
        color: "bg-orange-100 text-orange-800 border-orange-200",
      };
    return { text: "Nhiều", color: "bg-red-100 text-red-800 border-red-200" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải lịch sử...</p>
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
                <Calendar className="h-5 w-5 text-white" />
                <span className="text-sm text-white font-medium">
                  {entries.length} ngày đã ghi
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Lịch sử theo dõi</h1>
                <p className="text-green-100 text-lg">
                  Xem lại hành trình cai thuốc của bạn
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo ghi chú, triệu chứng hoặc ngày..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 border-2 focus:border-green-500 rounded-xl"
                />
              </div>
              <Button
                variant="outline"
                className="h-12 px-6 rounded-xl border-2 bg-transparent"
              >
                <Filter className="h-4 w-4 mr-2" />
                Lọc
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Entries Grid */}
        <div className="grid gap-6">
          {filteredEntries.map((entry) => {
            const smokingStatus = getSmokingStatus(entry.cigarettesSmoked);
            return (
              <Card
                key={entry.trackingId}
                className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]"
              >
                <CardHeader className="pb-4 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-t-xl border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Calendar className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-900">
                          {new Date(entry.trackingDate).toLocaleDateString(
                            "vi-VN",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {Math.abs(
                            new Date().getTime() -
                              new Date(entry.trackingDate).getTime()
                          ) /
                            (1000 * 60 * 60 * 24) <
                          1
                            ? "Hôm nay"
                            : `${Math.floor(
                                Math.abs(
                                  new Date().getTime() -
                                    new Date(entry.trackingDate).getTime()
                                ) /
                                  (1000 * 60 * 60 * 24)
                              )} ngày trước`}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(entry)}
                            className="hover:bg-green-100 rounded-full p-2"
                          >
                            <Edit className="h-4 w-4 text-green-600" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Edit className="h-5 w-5 text-green-600" />
                              Chỉnh sửa nhật ký
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6 py-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Số điếu thuốc đã hút</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={editFormData.cigarettesSmoked}
                                  onChange={(e) =>
                                    setEditFormData((prev) => ({
                                      ...prev,
                                      cigarettesSmoked:
                                        Number.parseInt(e.target.value) || 0,
                                    }))
                                  }
                                  className="h-10"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Tiền tiết kiệm (VNĐ)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={editFormData.moneySaved}
                                  onChange={(e) =>
                                    setEditFormData((prev) => ({
                                      ...prev,
                                      moneySaved:
                                        Number.parseFloat(e.target.value) || 0,
                                    }))
                                  }
                                  className="h-10"
                                />
                              </div>
                            </div>

                            <div className="space-y-3">
                              <Label>
                                Mức độ thèm thuốc:{" "}
                                {editFormData.cravingsExperienced}/10
                              </Label>
                              <Slider
                                value={[editFormData.cravingsExperienced]}
                                onValueChange={(value) =>
                                  setEditFormData((prev) => ({
                                    ...prev,
                                    cravingsExperienced: value[0],
                                  }))
                                }
                                max={10}
                                min={1}
                                step={1}
                              />
                            </div>

                            <div className="space-y-3">
                              <Label>
                                Tâm trạng: {editFormData.moodRating}/10
                              </Label>
                              <Slider
                                value={[editFormData.moodRating]}
                                onValueChange={(value) =>
                                  setEditFormData((prev) => ({
                                    ...prev,
                                    moodRating: value[0],
                                  }))
                                }
                                max={10}
                                min={1}
                                step={1}
                              />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Thời gian tập luyện (phút)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={editFormData.minutesExercised}
                                  onChange={(e) =>
                                    setEditFormData((prev) => ({
                                      ...prev,
                                      minutesExercised:
                                        Number.parseInt(e.target.value) || 0,
                                    }))
                                  }
                                  className="h-10"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Lượng nước uống (ml)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={editFormData.waterIntake}
                                  onChange={(e) =>
                                    setEditFormData((prev) => ({
                                      ...prev,
                                      waterIntake:
                                        Number.parseInt(e.target.value) || 0,
                                    }))
                                  }
                                  className="h-10"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Triệu chứng thể chất</Label>
                              <Input
                                placeholder="Ví dụ: đau đầu, khó thở, ho..."
                                value={editFormData.physicalSymptoms}
                                onChange={(e) =>
                                  setEditFormData((prev) => ({
                                    ...prev,
                                    physicalSymptoms: e.target.value,
                                  }))
                                }
                                className="h-10"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Ghi chú</Label>
                              <Textarea
                                placeholder="Cảm xúc, động lực, thách thức trong ngày..."
                                value={editFormData.notes}
                                onChange={(e) =>
                                  setEditFormData((prev) => ({
                                    ...prev,
                                    notes: e.target.value,
                                  }))
                                }
                                className="min-h-[80px] resize-none"
                              />
                            </div>

                            <div className="flex gap-3 pt-4">
                              <Button
                                onClick={handleUpdate}
                                disabled={updateLoading}
                                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                              >
                                {updateLoading
                                  ? "Đang cập nhật..."
                                  : "Cập nhật"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(entry.trackingId!)}
                        className="hover:bg-red-100 rounded-full p-2"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                        <Cigarette className="h-4 w-4" />
                        Thuốc lá
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-900">
                          {entry.cigarettesSmoked}
                        </span>
                        <Badge className={`${smokingStatus.color} border`}>
                          {smokingStatus.text}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                        <Heart className="h-4 w-4" />
                        Tâm trạng
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-900">
                          {entry.moodRating}/10
                        </span>
                        <Badge
                          className={`${getMoodColor(
                            entry.moodRating
                          )} border flex items-center gap-1`}
                        >
                          {getMoodIcon(entry.moodRating)}
                          {entry.moodRating >= 7
                            ? "Tốt"
                            : entry.moodRating >= 5
                            ? "Bình thường"
                            : "Kém"}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                        <Brain className="h-4 w-4" />
                        Thèm thuốc
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-900">
                          {entry.cravingsExperienced}/10
                        </span>
                        <Badge
                          className={`${getCravingColor(
                            entry.cravingsExperienced
                          )} border`}
                        >
                          {entry.cravingsExperienced <= 3
                            ? "Thấp"
                            : entry.cravingsExperienced <= 6
                            ? "Trung bình"
                            : "Cao"}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        Tiết kiệm
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {entry.moneySaved.toLocaleString("vi-VN")}đ
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    {entry.minutesExercised > 0 && (
                      <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full">
                        <Activity className="h-4 w-4 text-orange-600" />
                        <span>{entry.minutesExercised} phút tập luyện</span>
                      </div>
                    )}
                    {entry.waterIntake > 0 && (
                      <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                        <Droplets className="h-4 w-4 text-blue-600" />
                        <span>{entry.waterIntake}ml nước</span>
                      </div>
                    )}
                  </div>

                  {/* Notes and Symptoms */}
                  {(entry.physicalSymptoms || entry.notes) && (
                    <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                      {entry.physicalSymptoms && (
                        <div className="flex gap-3">
                          <Heart className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-sm font-medium text-gray-700">
                              Triệu chứng:{" "}
                            </span>
                            <span className="text-sm text-gray-600">
                              {entry.physicalSymptoms}
                            </span>
                          </div>
                        </div>
                      )}
                      {entry.notes && (
                        <div className="flex gap-3">
                          <FileText className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-sm font-medium text-gray-700">
                              Ghi chú:{" "}
                            </span>
                            <span className="text-sm text-gray-600">
                              {entry.notes}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {filteredEntries.length === 0 && !loading && (
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardContent className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {searchTerm
                      ? "Không tìm thấy kết quả"
                      : "Chưa có nhật ký nào"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm
                      ? "Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc"
                      : "Bắt đầu ghi nhật ký hàng ngày để theo dõi tiến độ cai thuốc"}
                  </p>
                  {!searchTerm && (
                    <Button
                      onClick={() => navigate("/daily-log")}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg px-8 py-3 rounded-xl"
                    >
                      Tạo nhật ký đầu tiên
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
