"use client";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Cigarette,
  Calendar,
  DollarSign,
  Package,
  BarChart3,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Target,
} from "lucide-react";
import { smokeStatusService } from "@/services/smoke-status/smokeStatusService";
import { getUserFromToken } from "@/utils/token/auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { USER_ROUTES } from "@/routes/user/user";
import { quitPLanService } from "@/services/quit-plan/service";

interface SmokeStatusData {
  cigarettesPerDay: number;
  smokingFrequency: string;
  cigarettePricePerPack: number;
  cigarettesPerPack: number;
  yearsOfSmoking: number;
}

// Add this interface near the top with other interfaces
interface FormErrors {
  cigarettesPerDay?: string;
  smokingFrequency?: string;
  cigarettePricePerPack?: string;
  cigarettesPerPack?: string;
  yearsOfSmoking?: string;
  quitMethod?: string;
}

export default function SmokeStatusPage() {
  const user = getUserFromToken();
  const username = user?.username || "";
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    cigarettesPerDay: 0,
    smokingFrequency: "",
    cigarettePricePerPack: 0,
    cigarettesPerPack: 20,
    yearsOfSmoking: 0,
  });

  // Update the errors state declaration
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [autoGeneratePlan, setAutoGeneratePlan] = useState(false);
  const [quitMethod, setQuitMethod] = useState<string>("");

  // Quit method options
  const quitMethods = [
    { value: "cold_turkey", label: "Cold Turkey - Stop immediately" },
    {
      value: "gradual_reduction",
      label: "Gradual Reduction - Slowly decrease",
    },
    { value: "nicotine_replacement", label: "Nicotine Replacement Therapy" },
    { value: "medication", label: "Prescription Medication" },
    { value: "behavioral_therapy", label: "Behavioral Therapy" },
    { value: "support_groups", label: "Support Groups" },
    {
      value: "alternative_methods",
      label: "Alternative Methods (Acupuncture, etc.)",
    },
  ];

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

  // Replace the validateForm function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

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

    // Validate quit method if auto-generate is enabled
    if (autoGeneratePlan && !quitMethod) {
      newErrors.quitMethod = "Please select a quit method.";
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

  const handleQuitMethodChange = (value: string) => {
    setQuitMethod(value);
    setErrors((prev) => ({ ...prev, quitMethod: undefined }));
  };

  const handleAutoGenerateChange = (checked: boolean) => {
    setAutoGeneratePlan(checked);
    if (!checked) {
      setQuitMethod("");
      setErrors((prev) => ({ ...prev, quitMethod: undefined }));
    }
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

      if (autoGeneratePlan && username) {
        try {
          const quitPlanData = {
            username: username,
            quitDate: new Date().toISOString(),
            method: quitMethod,
          };
          const result = await quitPLanService.autoGeneratePlan(quitPlanData);
          toast.success("Quit plan generated successfully!");
          console.log("Generated quit plan:", result);
        } catch (planError) {
          console.error("Error generating quit plan:", planError);
          if (planError instanceof Error) {
            toast.error(`Quit plan generation failed: ${planError.message}`);
          } else {
            toast.error(
              "Failed to generate quit plan, but smoking status was saved."
            );
          }
        }
      }

      navigate(USER_ROUTES.SMOKE_STATUS_DETAIL);
    } catch (error) {
      console.error("Error saving smoke status:", error);
      toast.error("Failed to save smoking status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4 pt-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mb-4">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Track Your Journey
          </h1>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-800">
              Smoking Status Assessment
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Help us understand your current smoking habits to create a
              personalized quit plan and calculate your potential savings
            </p>
          </div>
        </div>

        {/* Main Form Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4 mx-auto">
              <Cigarette className="w-6 h-6 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl text-gray-800">
              Current Smoking Habits
            </CardTitle>
            <CardDescription className="text-base">
              Please provide accurate information to get the best personalized
              support
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cigarettes Per Day */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-600" />
                    <Label
                      htmlFor="cigarettesPerDay"
                      className="text-sm font-medium text-gray-700"
                    >
                      Cigarettes Per Day
                    </Label>
                  </div>
                  <Input
                    id="cigarettesPerDay"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.cigarettesPerDay || ""}
                    onChange={(e) =>
                      handleInputChange("cigarettesPerDay", e.target.value)
                    }
                    className="h-12 text-lg bg-white border-2 border-gray-200 focus:border-emerald-400 focus:ring-emerald-400 rounded-xl transition-all duration-200"
                    placeholder="e.g., 10"
                  />
                  {errors.cigarettesPerDay && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.cigarettesPerDay}
                    </p>
                  )}
                </div>

                {/* Smoking Frequency */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <Label className="text-sm font-medium text-gray-700">
                      Smoking Frequency
                    </Label>
                  </div>
                  <Select
                    value={formData.smokingFrequency}
                    onValueChange={(value) =>
                      handleInputChange("smokingFrequency", value)
                    }
                  >
                    <SelectTrigger className="h-12 text-lg bg-white border-2 border-gray-200 focus:border-emerald-400 focus:ring-emerald-400 rounded-xl transition-all duration-200">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Daily
                        </div>
                      </SelectItem>
                      <SelectItem value="weekly">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Weekly
                        </div>
                      </SelectItem>
                      <SelectItem value="occasionally">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Occasionally
                        </div>
                      </SelectItem>
                      <SelectItem value="socially">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Socially
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.smokingFrequency && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.smokingFrequency}
                    </p>
                  )}
                </div>

                {/* Price Per Pack */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <Label
                      htmlFor="cigarettePricePerPack"
                      className="text-sm font-medium text-gray-700"
                    >
                      Price Per Pack (VNĐ)
                    </Label>
                  </div>
                  <Input
                    id="cigarettePricePerPack"
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.cigarettePricePerPack || ""}
                    onChange={(e) =>
                      handleInputChange("cigarettePricePerPack", e.target.value)
                    }
                    className="h-12 text-lg bg-white border-2 border-gray-200 focus:border-emerald-400 focus:ring-emerald-400 rounded-xl transition-all duration-200"
                    placeholder="e.g., 25,000"
                  />
                  {errors.cigarettePricePerPack && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.cigarettePricePerPack}
                    </p>
                  )}
                </div>

                {/* Cigarettes Per Pack */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-600" />
                    <Label
                      htmlFor="cigarettesPerPack"
                      className="text-sm font-medium text-gray-700"
                    >
                      Cigarettes Per Pack
                    </Label>
                  </div>
                  <Input
                    id="cigarettesPerPack"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.cigarettesPerPack || ""}
                    onChange={(e) =>
                      handleInputChange("cigarettesPerPack", e.target.value)
                    }
                    className="h-12 text-lg bg-white border-2 border-gray-200 focus:border-emerald-400 focus:ring-emerald-400 rounded-xl transition-all duration-200"
                    placeholder="e.g., 20"
                  />
                  {errors.cigarettesPerPack && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.cigarettesPerPack}
                    </p>
                  )}
                </div>
              </div>

              {/* Years of Smoking - Full Width */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <Label
                    htmlFor="yearsOfSmoking"
                    className="text-sm font-medium text-gray-700"
                  >
                    Years of Smoking
                  </Label>
                </div>
                <Input
                  id="yearsOfSmoking"
                  type="number"
                  min="0"
                  max="80"
                  value={formData.yearsOfSmoking || ""}
                  onChange={(e) =>
                    handleInputChange("yearsOfSmoking", e.target.value)
                  }
                  className="h-12 text-lg bg-white border-2 border-gray-200 focus:border-emerald-400 focus:ring-emerald-400 rounded-xl transition-all duration-200 max-w-xs"
                  placeholder="e.g., 5"
                />
                {errors.yearsOfSmoking && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.yearsOfSmoking}
                  </p>
                )}
              </div>

              {/* Auto-generate option */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <Checkbox
                    id="autoGeneratePlan"
                    checked={autoGeneratePlan}
                    onCheckedChange={handleAutoGenerateChange}
                    className="mt-1 data-[state=checked]:bg-emerald-500! data-[state=checked]:border-emerald-500"
                  />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <Label
                        htmlFor="autoGeneratePlan"
                        className="text-sm font-medium text-emerald-800 cursor-pointer"
                      >
                        Automatically generate quit plan after saving
                      </Label>
                    </div>
                    <p className="text-xs text-emerald-700">
                      We'll create a personalized quit plan based on your
                      smoking habits to help you on your journey to quit
                      smoking.
                    </p>
                  </div>
                </div>

                {/* Quit Method Selection - Only show when auto-generate is checked */}
                {autoGeneratePlan && (
                  <div className="space-y-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <Label className="text-sm font-medium text-blue-800">
                        Select Your Preferred Quit Method
                      </Label>
                    </div>
                    <Select
                      value={quitMethod}
                      onValueChange={handleQuitMethodChange}
                    >
                      <SelectTrigger className="h-12 text-lg bg-white border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl transition-all duration-200">
                        <SelectValue placeholder="Choose a quit method" />
                      </SelectTrigger>
                      <SelectContent>
                        {quitMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.quitMethod && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.quitMethod}
                      </p>
                    )}
                    <p className="text-xs text-blue-700">
                      This method will be used to create your personalized quit
                      plan with specific strategies and milestones.
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {autoGeneratePlan
                        ? "Saving & Generating..."
                        : "Saving..."}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {autoGeneratePlan ? (
                        <Sparkles className="w-5 h-5" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5" />
                      )}
                      {autoGeneratePlan
                        ? "Save & Generate Plan"
                        : "Save Smoking Status"}
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
