import type React from "react";
import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Cigarette } from "lucide-react";
import { smokeStatusService } from "@/services/smoke-status/smokeStatusService";
import { getUserFromToken } from "@/utils/token/auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { USER_ROUTES } from "@/routes/user/user";

interface SmokeStatusData {
  cigarettesPerDay: number;
  smokingFrequency: string;
  cigarettePricePerPack: number;
  cigarettesPerPack: number;
  yearsOfSmoking: number;
}

export default function SmokeStatusPage() {
  const user = getUserFromToken();
  const username = user?.username || "";
  const navigate = useNavigate();

  const [formData, setFormData] = useState<SmokeStatusData>({
    cigarettesPerDay: 0,
    smokingFrequency: "",
    cigarettePricePerPack: 0,
    cigarettesPerPack: 20,
    yearsOfSmoking: 0,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SmokeStatusData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStatusDetail = async () => {
      if (!username) return;
      try {
        setIsLoading(true);
        await smokeStatusService.getStatusByUserName(username);
        navigate(USER_ROUTES.SMOKE_STATUS_DETAIL);
      } catch (additionalErr) {
        console.error("Error fetching additional data:", additionalErr);
      }
    };

    fetchStatusDetail()
      .catch((err) => {
        console.error("Error fetching status detail:", err);
        if (err instanceof Error && err.message === "NOT_FOUND") {
          window.location.href = "/";
          return;
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [username]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SmokeStatusData, string>> = {};

    if (formData.cigarettesPerDay < 1 || formData.cigarettesPerDay > 100) {
      newErrors.cigarettesPerDay = "Must be between 1 and 100.";
    }

    if (!formData.smokingFrequency) {
      newErrors.smokingFrequency = "Please select a frequency.";
    }

    if (formData.cigarettePricePerPack <= 0) {
      newErrors.cigarettePricePerPack = "Enter a valid price.";
    }

    if (formData.cigarettesPerPack < 1 || formData.cigarettesPerPack > 50) {
      newErrors.cigarettesPerPack = "Must be between 1 and 50.";
    }

    if (formData.yearsOfSmoking < 0 || formData.yearsOfSmoking > 80) {
      newErrors.yearsOfSmoking = "Must be between 0 and 80.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof SmokeStatusData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]:
        typeof value === "string"
          ? field === "smokingFrequency"
            ? value
            : Number.parseFloat(value) || 0
          : value,
    }));

    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the validation errors.");
      return;
    }

    setIsLoading(true);
    try {
      const statusData = {
        ...formData,
        username: user?.username,
      };
      await smokeStatusService.createStatus(statusData);
      toast.success("Smoking status saved successfully!");
      navigate(USER_ROUTES.SMOKE_STATUS_DETAIL);
    } catch (error) {
      console.error("Error saving smoke status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <section className="py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              {"📊 Track Your Smoking Habits"}
            </Badge>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Smoking Status Assessment
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Help us understand your current smoking habits to create a
              personalized quit plan and calculate potential savings.
            </p>
          </div>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl text-gray-900 flex items-center justify-center gap-2">
                <Cigarette className="h-6 w-6 text-red-500" />
                Current Smoking Habits
              </CardTitle>
              <CardDescription className="text-gray-600">
                Please provide accurate information to get the best personalized
                support
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Cigarettes Per Day */}
                  <div className="space-y-2">
                    <Label htmlFor="cigarettesPerDay">Cigarettes Per Day</Label>
                    <Input
                      id="cigarettesPerDay"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.cigarettesPerDay}
                      onChange={(e) =>
                        handleInputChange("cigarettesPerDay", e.target.value)
                      }
                      className="bg-white border-gray-300 focus:border-green-500 focus:ring-green-500"
                      placeholder="e.g., 10"
                    />
                    {errors.cigarettesPerDay && (
                      <p className="text-red-500 text-sm">{errors.cigarettesPerDay}</p>
                    )}
                  </div>

                  {/* Smoking Frequency */}
                  <div className="space-y-2">
                    <Label htmlFor="smokingFrequency">Smoking Frequency</Label>
                    <Select
                      value={formData.smokingFrequency}
                      onValueChange={(value) =>
                        handleInputChange("smokingFrequency", value)
                      }
                    >
                      <SelectTrigger className="bg-white border-gray-300 focus:border-green-500 focus:ring-green-500">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="occasionally">Occasionally</SelectItem>
                        <SelectItem value="socially">Socially</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.smokingFrequency && (
                      <p className="text-red-500 text-sm">{errors.smokingFrequency}</p>
                    )}
                  </div>

                  {/* Price Per Pack */}
                  <div className="space-y-2">
                    <Label htmlFor="cigarettePricePerPack">Price Per Pack (VNĐ)</Label>
                    <Input
                      id="cigarettePricePerPack"
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.cigarettePricePerPack}
                      onChange={(e) =>
                        handleInputChange("cigarettePricePerPack", e.target.value)
                      }
                      className="bg-white border-gray-300 focus:border-green-500 focus:ring-green-500"
                      placeholder="e.g., 25000"
                    />
                    {errors.cigarettePricePerPack && (
                      <p className="text-red-500 text-sm">{errors.cigarettePricePerPack}</p>
                    )}
                  </div>

                  {/* Cigarettes Per Pack */}
                  <div className="space-y-2">
                    <Label htmlFor="cigarettesPerPack">Cigarettes Per Pack</Label>
                    <Input
                      id="cigarettesPerPack"
                      type="number"
                      min="1"
                      max="50"
                      value={formData.cigarettesPerPack}
                      onChange={(e) =>
                        handleInputChange("cigarettesPerPack", e.target.value)
                      }
                      className="bg-white border-gray-300 focus:border-green-500 focus:ring-green-500"
                      placeholder="e.g., 20"
                    />
                    {errors.cigarettesPerPack && (
                      <p className="text-red-500 text-sm">{errors.cigarettesPerPack}</p>
                    )}
                  </div>

                  {/* Years of Smoking */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="yearsOfSmoking">Years of Smoking</Label>
                    <Input
                      id="yearsOfSmoking"
                      type="number"
                      min="0"
                      max="80"
                      value={formData.yearsOfSmoking}
                      onChange={(e) =>
                        handleInputChange("yearsOfSmoking", e.target.value)
                      }
                      className="bg-white border-gray-300 focus:border-green-500 focus:ring-green-500 max-w-xs"
                      placeholder="e.g., 5"
                    />
                    {errors.yearsOfSmoking && (
                      <p className="text-red-500 text-sm">{errors.yearsOfSmoking}</p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-green-600! hover:bg-green-700! cursor-pointer text-white! px-8 py-3 text-lg min-w-[200px]"
                  >
                    {isLoading ? "Saving..." : "Save Smoking Status"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
