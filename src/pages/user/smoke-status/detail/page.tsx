"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Cigarette,
  Calendar,
  DollarSign,
  Clock,
  TrendingDown,
  User,
  Package,
  ArrowLeft,
  Calculator,
  Edit,
  Save,
  X,
  AlertCircle,
} from "lucide-react";
import { getUserFromToken } from "@/utils/token/auth";
import { smokeStatusService } from "@/services/smoke-status/smokeStatusService";
import { Link, useNavigate } from "react-router-dom";
import { USER_ROUTES } from "@/routes/user/user";

interface SmokeStatusDetail {
  statusId: number;
  username: string;
  cigarettesPerDay: number;
  smokingFrequency: string;
  cigarettePricePerPack: number;
  cigarettesPerPack: number;
  yearsOfSmoking: number;
  createdAt: string;
  updatedAt: string;
}

interface EditFormData {
  username: string;
  cigarettesPerDay: number;
  smokingFrequency: string;
  cigarettePricePerPack: number;
  cigarettesPerPack: number;
  yearsOfSmoking: number;
}

interface ValidationErrors {
  cigarettesPerDay?: string;
  smokingFrequency?: string;
  cigarettePricePerPack?: string;
  cigarettesPerPack?: string;
  yearsOfSmoking?: string;
}

export default function SmokeStatusDetailPage() {
  const username = getUserFromToken()?.username;
  const navigate = useNavigate();
  const [statusData, setStatusData] = useState<SmokeStatusDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [costData, setCostData] = useState<number | null>(null);
  const [healthImpactData, setHealthImpactData] = useState<string | null>(null);
  const [isLoadingAdditionalData, setIsLoadingAdditionalData] = useState(false);

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    username: "",
    cigarettesPerDay: 0,
    smokingFrequency: "",
    cigarettePricePerPack: 0,
    cigarettesPerPack: 0,
    yearsOfSmoking: 0,
  });

  // Validation states
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validFrequencies = ["daily", "weekly", "occasionally", "socially"];

  // Validation functions
  const validateField = (
    field: keyof EditFormData,
    value: string | number
  ): string | undefined => {
    switch (field) {
      case "cigarettesPerDay":
        const cigarettesPerDay = Number(value);
        if (isNaN(cigarettesPerDay)) return "Must be a valid number";
        if (cigarettesPerDay < 0) return "Cannot be negative";
        if (cigarettesPerDay > 100) return "Seems unreasonably high (max 100)";
        if (!Number.isInteger(cigarettesPerDay))
          return "Must be a whole number";
        return undefined;

      case "smokingFrequency":
        const frequency = String(value).toLowerCase();
        if (!frequency) return "Please select a smoking frequency";
        if (!validFrequencies.includes(frequency))
          return "Please select a valid frequency";
        return undefined;

      case "cigarettePricePerPack":
        const pricePerPack = Number(value);
        if (isNaN(pricePerPack)) return "Must be a valid number";
        if (pricePerPack <= 0) return "Must be greater than 0";
        if (pricePerPack > 1000000)
          return "Seems unreasonably high (max 1,000,000 VNĐ)";
        return undefined;

      case "cigarettesPerPack":
        const cigarettesPerPack = Number(value);
        if (isNaN(cigarettesPerPack)) return "Must be a valid number";
        if (cigarettesPerPack <= 0) return "Must be greater than 0";
        if (cigarettesPerPack > 50) return "Seems unreasonably high (max 50)";
        if (!Number.isInteger(cigarettesPerPack))
          return "Must be a whole number";
        return undefined;

      case "yearsOfSmoking":
        const yearsOfSmoking = Number(value);
        if (isNaN(yearsOfSmoking)) return "Must be a valid number";
        if (yearsOfSmoking < 0) return "Cannot be negative";
        if (yearsOfSmoking > 80)
          return "Seems unreasonably high (max 80 years)";
        if (!Number.isInteger(yearsOfSmoking)) return "Must be a whole number";
        return undefined;

      default:
        return undefined;
    }
  };

  const validateAllFields = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;
    (Object.keys(editFormData) as Array<keyof EditFormData>).forEach(
      (field) => {
        if (field !== "username") {
          // Skip username validation as it's disabled
          const error = validateField(field, editFormData[field]);
          if (error) {
            errors[field] = error;
            isValid = false;
          }
        }
      }
    );

    setValidationErrors(errors);
    return isValid;
  };

  const handleFieldBlur = (field: keyof EditFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, editFormData[field]);
    setValidationErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleInputChange = (
    field: keyof EditFormData,
    value: string | number
  ) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error when user starts typing
    if (
      field !== "username" &&
      validationErrors[field as keyof ValidationErrors]
    ) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Validate on change for immediate feedback (only if field was touched)
    if (touched[field]) {
      const error = validateField(field, value);
      setValidationErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  useEffect(() => {
    const fetchStatusDetail = async () => {
      if (!username) return;

      try {
        setIsLoading(true);
        const response = await smokeStatusService.getStatusByUserName(username);
        setStatusData(response);
        // Initialize edit form data
        setEditFormData({
          username: response.username,
          cigarettesPerDay: response.cigarettesPerDay,
          smokingFrequency: response.smokingFrequency,
          cigarettePricePerPack: response.cigarettePricePerPack,
          cigarettesPerPack: response.cigarettesPerPack,
          yearsOfSmoking: response.yearsOfSmoking,
        });

        // Fetch additional data using the statusId
        if (response.statusId) {
          setIsLoadingAdditionalData(true);
          const [costResponse, healthImpactResponse] = await Promise.all([
            smokeStatusService.getCostById(response.statusId),
            smokeStatusService.getHealthImpactById(response.statusId),
          ]);

          setCostData(costResponse);
          setHealthImpactData(healthImpactResponse);
        }
      } catch (additionalErr) {
        console.error("Error fetching additional data:", additionalErr);
      } finally {
        setIsLoadingAdditionalData(false);
      }
    };

    fetchStatusDetail()
      .catch((err) => {
        console.error("Error fetching status detail:", err);
        // Check if it's a 404 error and navigate to home
        if (err instanceof Error && err.message === "NOT_FOUND") {
          window.location.href = "/";
          return;
        }
        setError("Failed to load smoking status details");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [username]);

  const handleEditToggle = () => {
    if (isEditMode) {
      // Reset form data and validation when canceling edit
      if (statusData) {
        setEditFormData({
          username: statusData.username,
          cigarettesPerDay: statusData.cigarettesPerDay,
          smokingFrequency: statusData.smokingFrequency,
          cigarettePricePerPack: statusData.cigarettePricePerPack,
          cigarettesPerPack: statusData.cigarettesPerPack,
          yearsOfSmoking: statusData.yearsOfSmoking,
        });
      }
      setValidationErrors({});
      setTouched({});
    }
    setIsEditMode(!isEditMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusData) return;

    // Mark all fields as touched for validation display
    const allFields = Object.keys(editFormData).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allFields);

    // Validate all fields
    if (!validateAllFields()) {
      return;
    }

    try {
      setIsUpdating(true);
      const updatedStatus = await smokeStatusService.updateStatusById(
        statusData.statusId,
        editFormData
      );
      setStatusData(updatedStatus);
      setIsEditMode(false);
      setValidationErrors({});
      setTouched({});
      window.location.reload();
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update smoking status");
    } finally {
      setIsUpdating(false);
      setIsLoadingAdditionalData(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency.toLowerCase()) {
      case "daily":
        return "bg-red-100 text-red-800";
      case "weekly":
        return "bg-orange-100 text-orange-800";
      case "occasionally":
        return "bg-yellow-100 text-yellow-800";
      case "socially":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const hasValidationErrors = Object.values(validationErrors).some(
    (error) => error !== undefined
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600">Loading smoking status details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !statusData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800">
              You haven't set your smoking status yet
            </h2>
            <p className="mt-2 text-gray-600">
              To help us support your journey, please let us know your smoking
              status.
            </p>
            <div className="mt-6 flex justify-center">
              <Link to={USER_ROUTES.SMOKE_STATUS}>
                <Button className="flex items-center gap-2 bg-green-500! hover:bg-green-600! text-white">
                  <ArrowLeft className="h-4 w-4" />
                  Create Smoking Status
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header Section */}
      <section className="py-12 lg:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center space-y-4 mb-12">
            <div className="flex items-center justify-center gap-4">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                {"📊 Smoking Status Details"}
              </Badge>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Smoking Status Report
            </h1>
            <p className="text-xl text-gray-600">
              Detailed analysis for {statusData.username}
            </p>
          </div>

          {isEditMode ? (
            // Edit Form
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                    <Edit className="h-6 w-6 text-blue-600" />
                    Edit Smoking Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {hasValidationErrors && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        Please fix the validation errors below before
                        submitting.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={editFormData.username}
                          onChange={(e) =>
                            handleInputChange("username", e.target.value)
                          }
                          required
                          disabled
                        />
                      </div>

                      <div>
                        <Label htmlFor="cigarettesPerDay">
                          Cigarettes Per Day *
                        </Label>
                        <Input
                          id="cigarettesPerDay"
                          type="number"
                          min="0"
                          max="100"
                          value={editFormData.cigarettesPerDay}
                          onChange={(e) =>
                            handleInputChange(
                              "cigarettesPerDay",
                              Number.parseInt(e.target.value) || 0
                            )
                          }
                          onBlur={() => handleFieldBlur("cigarettesPerDay")}
                          className={
                            validationErrors.cigarettesPerDay
                              ? "border-red-500 focus:border-red-500"
                              : ""
                          }
                          required
                        />
                        {validationErrors.cigarettesPerDay && (
                          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors.cigarettesPerDay}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="smokingFrequency">
                          Smoking Frequency *
                        </Label>
                        <Select
                          value={editFormData.smokingFrequency}
                          onValueChange={(value) => {
                            handleInputChange("smokingFrequency", value);
                            handleFieldBlur("smokingFrequency");
                          }}
                        >
                          <SelectTrigger
                            className={
                              validationErrors.smokingFrequency
                                ? "border-red-500 focus:border-red-500"
                                : ""
                            }
                          >
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="occasionally">
                              Occasionally
                            </SelectItem>
                            <SelectItem value="socially">Socially</SelectItem>
                          </SelectContent>
                        </Select>
                        {validationErrors.smokingFrequency && (
                          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors.smokingFrequency}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cigarettePricePerPack">
                          Price Per Pack (VNĐ) *
                        </Label>
                        <Input
                          id="cigarettePricePerPack"
                          type="number"
                          min="0"
                          max="1000000"
                          step="1000"
                          value={editFormData.cigarettePricePerPack}
                          onChange={(e) =>
                            handleInputChange(
                              "cigarettePricePerPack",
                              Number.parseFloat(e.target.value) || 0
                            )
                          }
                          onBlur={() =>
                            handleFieldBlur("cigarettePricePerPack")
                          }
                          className={
                            validationErrors.cigarettePricePerPack
                              ? "border-red-500 focus:border-red-500"
                              : ""
                          }
                          required
                        />
                        {validationErrors.cigarettePricePerPack && (
                          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors.cigarettePricePerPack}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="cigarettesPerPack">
                          Cigarettes Per Pack *
                        </Label>
                        <Input
                          id="cigarettesPerPack"
                          type="number"
                          min="1"
                          max="50"
                          value={editFormData.cigarettesPerPack}
                          onChange={(e) =>
                            handleInputChange(
                              "cigarettesPerPack",
                              Number.parseInt(e.target.value) || 0
                            )
                          }
                          onBlur={() => handleFieldBlur("cigarettesPerPack")}
                          className={
                            validationErrors.cigarettesPerPack
                              ? "border-red-500 focus:border-red-500"
                              : ""
                          }
                          required
                        />
                        {validationErrors.cigarettesPerPack && (
                          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors.cigarettesPerPack}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="yearsOfSmoking">
                          Years of Smoking *
                        </Label>
                        <Input
                          id="yearsOfSmoking"
                          type="number"
                          min="0"
                          max="80"
                          value={editFormData.yearsOfSmoking}
                          onChange={(e) =>
                            handleInputChange(
                              "yearsOfSmoking",
                              Number.parseInt(e.target.value) || 0
                            )
                          }
                          onBlur={() => handleFieldBlur("yearsOfSmoking")}
                          className={
                            validationErrors.yearsOfSmoking
                              ? "border-red-500 focus:border-red-500"
                              : ""
                          }
                          required
                        />
                        {validationErrors.yearsOfSmoking && (
                          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors.yearsOfSmoking}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleEditToggle}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isUpdating || hasValidationErrors}
                      className="flex items-center gap-2 bg-green-600! hover:bg-green-700! cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          ) : (
            // Display Mode
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Details Card */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                      <User className="h-6 w-6 text-blue-600" />
                      User Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <User className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="text-sm text-gray-600">Username</p>
                          <p className="font-semibold text-gray-900">
                            {statusData.username}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                      <Cigarette className="h-6 w-6 text-red-600" />
                      Smoking Habits
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-center gap-3">
                            <Cigarette className="h-5 w-5 text-red-600" />
                            <div>
                              <p className="text-sm text-gray-600">
                                Cigarettes Per Day
                              </p>
                              <p className="text-2xl font-bold text-red-600">
                                {statusData.cigarettesPerDay}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="text-sm text-gray-600">
                                Smoking Frequency
                              </p>
                              <Badge
                                className={getFrequencyColor(
                                  statusData.smokingFrequency
                                )}
                              >
                                {statusData.smokingFrequency}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-3">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="text-sm text-gray-600">
                                Price Per Pack
                              </p>
                              <p className="text-2xl font-bold text-green-600">
                                {statusData.cigarettePricePerPack} VNĐ
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-3">
                            <Package className="h-5 w-5 text-purple-600" />
                            <div>
                              <p className="text-sm text-gray-600">
                                Cigarettes Per Pack
                              </p>
                              <p className="text-2xl font-bold text-purple-600">
                                {statusData.cigarettesPerPack}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="text-sm text-gray-600">
                            Years of Smoking
                          </p>
                          <p className="text-2xl font-bold text-orange-600">
                            {statusData.yearsOfSmoking} years
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Cost Analysis */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-red-500 to-orange-600 text-white">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Cost Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                      <p className="text-sm text-red-100">
                        Total Yearly Cost Analysis
                      </p>
                      {isLoadingAdditionalData ? (
                        <div className="animate-pulse">
                          <div className="h-8 bg-white/20 rounded w-24 mx-auto"></div>
                        </div>
                      ) : costData !== null ? (
                        <p className="text-3xl font-bold">
                          {costData.toLocaleString()} VNĐ
                        </p>
                      ) : (
                        ""
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Timestamps */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-gray-600" />
                      Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(statusData.createdAt)}
                      </p>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(statusData.updatedAt)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Health Impact */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                      Health Impact Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingAdditionalData ? (
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ) : healthImpactData ? (
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-gray-800 font-medium">
                          {healthImpactData}
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-600">
                          Health impact data not available
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <Button
                    onClick={handleEditToggle}
                    variant={isEditMode ? "outline" : "default"}
                    size="sm"
                    className="flex items-center mx-4 p-5 gap-2 bg-green-600! hover:bg-green-700! cursor-pointer"
                    disabled={isUpdating}
                  >
                    {isEditMode ? (
                      <>
                        <X className="h-4 w-4" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4" />
                        Edit
                      </>
                    )}
                  </Button>
                </Card>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
