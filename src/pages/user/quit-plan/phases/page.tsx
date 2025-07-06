"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Target,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Play,
  AlertTriangle,
  TrendingUp,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { quitPLanService } from "@/services/quit-plan/service";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { USER_ROUTES } from "@/routes/user/user";

// Using the same interfaces from your existing code
export interface QuitPlanPhase {
  phaseId: number;
  planId: number;
  phaseName: string;
  description: string;
  durationDays: number;
  targetCigarettesPerDay: number;
  activities: string;
  phaseOrder: number;
  status: "pending" | "active" | "completed";
  startDate: string | null;
  endDate: string | null;
}

export default function QuitPlanPhasesPage() {
  const navigate = useNavigate();
  const planId = useParams().id;
  const [phases, setPhases] = useState<QuitPlanPhase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingPhases, setLoadingPhases] = useState<{
    [phaseId: number]: "starting" | "completing" | null;
  }>({});

  const PHASES_PER_PAGE = 3;

  useEffect(() => {
    const fetchPhases = async () => {
      if (!planId) {
        setError("Plan ID not provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const phasesData = await quitPLanService.phases.getByPlanId(
          Number(planId)
        );
        setPhases(
          phasesData.sort((a: any, b: any) => a.phaseOrder - b.phaseOrder)
        );
        setError(null);
      } catch (err) {
        console.error("Error fetching phases:", err);
        setError("Failed to load phases");
        toast.error("Failed to load phases");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhases();
  }, [planId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPhaseIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      case "active":
        return <Play className="w-6 h-6 text-blue-600" />;
      default:
        return <Circle className="w-6 h-6 text-gray-400" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not started";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCurrentPagePhases = () => {
    const startIndex = (currentPage - 1) * PHASES_PER_PAGE;
    const endIndex = startIndex + PHASES_PER_PAGE;
    return phases.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(phases.length / PHASES_PER_PAGE);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPhaseProgress = () => {
    const completed = phases.filter((p) => p.status === "completed").length;
    const active = phases.filter((p) => p.status === "active").length;
    const total = phases.length;
    return { completed, active, total, percentage: (completed / total) * 100 };
  };

  const handleStartPhase = async (phaseId: number) => {
    if (!planId) return;

    try {
      setLoadingPhases((prev) => ({ ...prev, [phaseId]: "starting" }));

      const response = await quitPLanService.phases.startPhase(
        Number(planId),
        phaseId
      );

      // Update the phase status locally
      setPhases((prevPhases) =>
        prevPhases.map((phase) =>
          phase.phaseId === phaseId
            ? {
                ...phase,
                status: "active" as const,
                startDate: new Date().toISOString(),
              }
            : phase
        )
      );

      toast.success(response.message || "Phase started successfully!");
    } catch (err) {
      console.error("Error starting phase:", err);
      toast.error("Failed to start phase. Please try again.");
    } finally {
      setLoadingPhases((prev) => ({ ...prev, [phaseId]: null }));
    }
  };

  const handleCompletePhase = async (phaseId: number) => {
    if (!planId) return;

    try {
      setLoadingPhases((prev) => ({ ...prev, [phaseId]: "completing" }));

      const response = await quitPLanService.phases.completePhase(
        Number(planId),
        phaseId
      );

      // Update the phase status locally
      setPhases((prevPhases) =>
        prevPhases.map((phase) =>
          phase.phaseId === phaseId
            ? {
                ...phase,
                status: "completed" as const,
                endDate: new Date().toISOString(),
              }
            : phase
        )
      );

      toast.success(response.message || "Phase completed successfully!");
    } catch (err) {
      console.error("Error completing phase:", err);
      toast.error("Failed to complete phase. Please try again.");
    } finally {
      setLoadingPhases((prev) => ({ ...prev, [phaseId]: null }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-600">Loading phases...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-800">
                Error Loading Phases
              </h2>
              <p className="text-gray-600">{error}</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(USER_ROUTES.QUIT_PLANS)}
                >
                  Go Back
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phases.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8 pt-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6">
              <Target className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              No Phases Found
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              This quit plan doesn't have any phases yet.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate(USER_ROUTES.QUIT_PLANS)}
              className="px-8 py-3 text-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Plans
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const progress = getPhaseProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-6 pt-8">
          <Button
            variant="ghost"
            onClick={() => navigate(USER_ROUTES.QUIT_PLANS)}
            className="mb-4 hover:bg-white/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quit Plans
          </Button>

          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Plan Phases
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Track your progress through each phase of your quit smoking
              journey
            </p>
          </div>

          {/* Progress Overview */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {progress.total}
                  </div>
                  <div className="text-sm text-gray-600">Total Phases</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {progress.completed}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {progress.active}
                  </div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {Math.round(progress.percentage)}%
                  </div>
                  <div className="text-sm text-gray-600">Progress</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Phases List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Phase Details</h2>
            {getTotalPages() > 1 && (
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * PHASES_PER_PAGE + 1} -{" "}
                {Math.min(currentPage * PHASES_PER_PAGE, phases.length)} of{" "}
                {phases.length} phases
              </div>
            )}
          </div>

          <div className="space-y-6">
            {getCurrentPagePhases().map((phase, index) => (
              <Card
                key={phase.phaseId}
                className="shadow-xl border-0 bg-white/80 backdrop-blur-sm"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {getPhaseIcon(phase.status)}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-xl text-gray-800">
                            Phase {phase.phaseOrder}: {phase.phaseName}
                          </CardTitle>
                          <Badge
                            className={`${getStatusColor(
                              phase.status
                            )} font-medium`}
                          >
                            {phase.status.charAt(0).toUpperCase() +
                              phase.status.slice(1)}
                          </Badge>
                        </div>
                        <CardDescription className="text-base">
                          {phase.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Phase Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <h4 className="font-semibold text-gray-800">
                          Duration
                        </h4>
                      </div>
                      <p className="text-lg font-medium text-blue-600 bg-blue-50 p-3 rounded-lg">
                        {phase.durationDays}{" "}
                        {phase.durationDays === 1 ? "day" : "days"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-600" />
                        <h4 className="font-semibold text-gray-800">Target</h4>
                      </div>
                      <p className="text-lg font-medium text-green-600 bg-green-50 p-3 rounded-lg">
                        {phase.targetCigarettesPerDay} cigarettes/day
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <h4 className="font-semibold text-gray-800">
                          Timeline
                        </h4>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg space-y-1">
                        <p className="text-sm text-purple-600">
                          <strong>Start:</strong> {formatDate(phase.startDate)}
                        </p>
                        <p className="text-sm text-purple-600">
                          <strong>End:</strong> {formatDate(phase.endDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Activities */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-orange-600" />
                      Activities & Goals
                    </h4>
                    <p className="text-gray-600 bg-orange-50 p-4 rounded-lg leading-relaxed">
                      {phase.activities}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    {phase.status === "pending" && (
                      <Button
                        onClick={() => handleStartPhase(phase.phaseId)}
                        disabled={loadingPhases[phase.phaseId] === "starting"}
                        className="bg-green-600! hover:bg-green-700! text-white"
                      >
                        {loadingPhases[phase.phaseId] === "starting" ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Starting...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Start Phase
                          </>
                        )}
                      </Button>
                    )}

                    {phase.status === "active" && (
                      <>
                        <Button
                          onClick={() => handleCompletePhase(phase.phaseId)}
                          disabled={
                            loadingPhases[phase.phaseId] === "completing"
                          }
                          className="bg-blue-600! hover:bg-blue-700! text-white"
                        >
                          {loadingPhases[phase.phaseId] === "completing" ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Completing...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Complete Phase
                            </>
                          )}
                        </Button>
                      </>
                    )}

                    {phase.status === "completed" && (
                      <Button
                        variant="outline"
                        disabled
                        className="text-gray-500"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Phase Completed
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {getTotalPages() > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 p-0 ${
                        currentPage === page
                          ? "bg-blue-600! hover:bg-blue-700! text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </Button>
                  )
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === getTotalPages()}
                className="px-4 py-2"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
