import type React from "react";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "react-router-dom";
import { progressTrackingService } from "@/services/progress-tracking/service";
import type { ProgressTrackingEntry } from "@/services/progress-tracking/type";



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
          existingEntry.id!,
          entryData
        );
      } else {
        await progressTrackingService.entry.create(entryData);
      }

      navigate("/");
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
      await progressTrackingService.entry.delete(existingEntry.id!);
      navigate("/");
    } catch (error) {
      console.error("Error deleting entry:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Nhật ký hôm nay</h1>
        <p className="text-green-100">
          {new Date().toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
            <CardTitle className="text-gray-900">Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div>
              <Label htmlFor="cigarettes">Số điếu thuốc đã hút</Label>
              <Input
                id="cigarettes"
                type="number"
                min="0"
                value={formData.cigarettesSmoked}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    cigarettesSmoked: Number.parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>

            <div>
              <Label>
                Mức độ thèm thuốc: {formData.cravingsExperienced}/10
              </Label>
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
            </div>

            <div>
              <Label>Tâm trạng: {formData.moodRating}/10</Label>
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
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
            <CardTitle className="text-gray-900">
              Sức khỏe & Hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div>
              <Label htmlFor="symptoms">Triệu chứng thể chất</Label>
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
              />
            </div>

            <div>
              <Label htmlFor="exercise">Thời gian tập thể dục (phút)</Label>
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
              />
            </div>

            <div>
              <Label htmlFor="water">Lượng nước uống (ml)</Label>
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
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
            <CardTitle className="text-gray-900">Ghi chú & Tiết kiệm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div>
              <Label htmlFor="money">Tiền tiết kiệm hôm nay (VNĐ)</Label>
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
              />
            </div>

            <div>
              <Label htmlFor="notes">Ghi chú</Label>
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
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg"
          >
            {loading
              ? "Đang lưu..."
              : existingEntry
              ? "Cập nhật"
              : "Lưu nhật ký"}
          </Button>

          {existingEntry && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="shadow-lg"
            >
              Xóa
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
