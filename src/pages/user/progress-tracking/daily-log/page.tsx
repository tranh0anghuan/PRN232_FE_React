"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Cigarette,
  Heart,
  Brain,
  Activity,
  Droplets,
  DollarSign,
  FileText,
  Save,
  Trash2,
  Calendar,
  Smile,
  Frown,
  Meh,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { progressTrackingService } from "@/services/progress-tracking/service";
import type { ProgressTrackingEntry } from "@/services/progress-tracking/type";
import { USER_ROUTES } from "@/routes/user/user";

export default function UserProgressTrackingDailyLog() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [existingEntry, setExistingEntry] =
    useState<ProgressTrackingEntry | null>(null);
  const [formData, setFormData] = useState({
    cigarettesSmoked: 0,
    cravingsExperienced: 5,
    moodRating: 5,
    physicalSymptoms: "",
    notes: "",
    moneySaved: 0,
    minutesExercised: 0,
    waterIntake: 0,
  });

  const username = "user"; // In real app, get from auth context
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const checkTodayEntry = async () => {
      try {
        const entry = await progressTrackingService.user.checkDateEntry(
          username,
          today
        );
        if (entry) {
          setExistingEntry(entry);
          setFormData({
            cigarettesSmoked: entry.cigarettesSmoked,
            cravingsExperienced: entry.cravingsExperienced,
            moodRating: entry.moodRating,
            physicalSymptoms: entry.physicalSymptoms,
            notes: entry.notes,
            moneySaved: entry.moneySaved,
            minutesExercised: entry.minutesExercised,
            waterIntake: entry.waterIntake,
          });
        }
      } catch (error) {
        console.error("Error checking today entry:", error);
      }
    };

    checkTodayEntry();
  }, [username, today]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const entryData = {
        username,
        trackingDate: today,
        ...formData,
      };
      if (existingEntry) {
        await progressTrackingService.entry.update(
          existingEntry.trackingId!,
          entryData
        );
      } else {
        await progressTrackingService.entry.create(entryData);
      }
      navigate(USER_ROUTES.PROGRESS_TRACKING.DASHBOARD);
    } catch (error) {
      console.error("Error saving entry:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingEntry) return;
    setLoading(true);
    try {
      await progressTrackingService.entry.delete(existingEntry.trackingId!);
      navigate("/");
    } catch (error) {
      console.error("Error deleting entry:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodIcon = (rating: number) => {
    if (rating <= 3) return <Frown className="h-5 w-5 text-red-500" />;
    if (rating <= 7) return <Meh className="h-5 w-5 text-yellow-500" />;
    return <Smile className="h-5 w-5 text-green-500" />;
  };

  const getCravingColor = (level: number) => {
    if (level <= 3) return "text-green-600";
    if (level <= 7) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
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
              <div className="flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white border-0"
                >
                  {existingEntry ? "Cập nhật" : "Tạo mới"}
                </Badge>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Nhật ký hôm nay</h1>
            <p className="text-green-100 text-lg">
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl border-b">
              <CardTitle className="flex items-center gap-3 text-gray-800">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Cigarette className="h-5 w-5 text-blue-600" />
                </div>
                Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="cigarettes"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Số điếu thuốc đã hút
                  </Label>
                  <div className="relative">
                    <Input
                      id="cigarettes"
                      type="number"
                      min="0"
                      value={formData.cigarettesSmoked}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          cigarettesSmoked:
                            Number.parseInt(e.target.value) || 0,
                        }))
                      }
                      className="pl-10 h-12 text-lg border-2 focus:border-blue-500 rounded-xl"
                    />
                    <Cigarette className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Mức độ thèm thuốc:
                    <span
                      className={`font-bold ${getCravingColor(
                        formData.cravingsExperienced
                      )}`}
                    >
                      {formData.cravingsExperienced}/10
                    </span>
                  </Label>
                  <div className="px-3">
                    <Slider
                      value={[formData.cravingsExperienced]}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          cravingsExperienced: value[0],
                        }))
                      }
                      max={10}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Thấp</span>
                      <span>Cao</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  {getMoodIcon(formData.moodRating)}
                  Tâm trạng:
                  <span className="font-bold text-gray-800">
                    {formData.moodRating}/10
                  </span>
                </Label>
                <div className="px-3">
                  <Slider
                    value={[formData.moodRating]}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        moodRating: value[0],
                      }))
                    }
                    max={10}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Tệ</span>
                    <span>Tuyệt vời</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health & Activities */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-xl border-b">
              <CardTitle className="flex items-center gap-3 text-gray-800">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                Sức khỏe & Hoạt động
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <Label
                  htmlFor="symptoms"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <Heart className="h-4 w-4 text-red-500" />
                  Triệu chứng thể chất
                </Label>
                <Input
                  id="symptoms"
                  placeholder="Ví dụ: đau đầu, khó thở, ho..."
                  value={formData.physicalSymptoms}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      physicalSymptoms: e.target.value,
                    }))
                  }
                  className="h-12 border-2 focus:border-green-500 rounded-xl"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="exercise"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <Activity className="h-4 w-4 text-orange-500" />
                    Thời gian tập thể dục (phút)
                  </Label>
                  <Input
                    id="exercise"
                    type="number"
                    min="0"
                    value={formData.minutesExercised}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        minutesExercised: Number.parseInt(e.target.value) || 0,
                      }))
                    }
                    className="h-12 border-2 focus:border-green-500 rounded-xl"
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="water"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <Droplets className="h-4 w-4 text-blue-500" />
                    Lượng nước uống (ml)
                  </Label>
                  <Input
                    id="water"
                    type="number"
                    min="0"
                    value={formData.waterIntake}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        waterIntake: Number.parseInt(e.target.value) || 0,
                      }))
                    }
                    className="h-12 border-2 focus:border-green-500 rounded-xl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes & Savings */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-xl border-b">
              <CardTitle className="flex items-center gap-3 text-gray-800">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                Ghi chú & Tiết kiệm
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <Label
                  htmlFor="money"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <DollarSign className="h-4 w-4 text-green-600" />
                  Tiền tiết kiệm hôm nay (VNĐ)
                </Label>
                <Input
                  id="money"
                  type="number"
                  min="0"
                  value={formData.moneySaved}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      moneySaved: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="h-12 border-2 focus:border-purple-500 rounded-xl"
                />
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="notes"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <FileText className="h-4 w-4 text-gray-600" />
                  Ghi chú
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Cảm xúc, động lực, thách thức trong ngày..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  className="min-h-[120px] border-2 focus:border-purple-500 rounded-xl resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-xl rounded-xl text-lg font-semibold transition-all duration-200 hover:shadow-2xl hover:scale-[1.02]"
            >
              <Save className="h-5 w-5 mr-2" />
              {loading
                ? "Đang lưu..."
                : existingEntry
                ? "Cập nhật nhật ký"
                : "Lưu nhật ký"}
            </Button>

            {existingEntry && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
                className="h-14 px-8 shadow-xl rounded-xl text-lg font-semibold transition-all duration-200 hover:shadow-2xl hover:scale-[1.02]"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Xóa
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
