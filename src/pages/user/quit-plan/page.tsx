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
  Users,
  AlertTriangle,
  Heart,
  Lightbulb,
  TrendingUp,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { quitPLanService } from "@/services/quit-plan/service";
import { getUserFromToken } from "@/utils/token/auth";
import { toast } from "sonner";
import { USER_ROUTES } from "@/routes/user/user";
import { useNavigate } from "react-router-dom";

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

export interface QuitPlan {
  planId: number;
  username: string;
  quitDate: string;
  quitMethod: string;
  triggers: string;
  strategies: string;
  supportNetwork: string;
  status: "active" | "completed" | "paused";
  createdAt: string;
  updatedAt: string;
  phases: QuitPlanPhase[];
}

export interface GetQuitPlansResponse {
  data: QuitPlan[];
  success: boolean;
  message?: string;
}

export default function QuitPlansPage() {
  const user = getUserFromToken();
  const username = user?.username || "";
  const navigate = useNavigate();

  const [quitPlans, setQuitPlans] = useState<QuitPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add after existing state declarations
  const [phasePagination, setPhasePagination] = useState<{
    [planId: number]: number;
  }>({});
  const PHASES_PER_PAGE = 2;

  useEffect(() => {
    const fetchQuitPlans = async () => {
      if (!username) {
        setError("Username not found");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const plans = await quitPLanService.getByUsername(username);
        setQuitPlans(plans);
        setError(null);
      } catch (err) {
        console.error("Error fetching quit plans:", err);
        setError("Failed to load quit plans");
        toast.error("Failed to load quit plans");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuitPlans();
  }, [username]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "paused":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPhaseIcon = (status: string, phaseOrder: number) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "active":
        return <Play className="w-5 h-5 text-blue-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getMethodDisplayName = (method: string) => {
    const methodMap: { [key: string]: string } = {
      cold_turkey: "Cold Turkey",
      gradual_reduction: "Gradual Reduction",
      nicotine_replacement: "Nicotine Replacement Therapy",
      medication: "Prescription Medication",
      behavioral_therapy: "Behavioral Therapy",
      support_groups: "Support Groups",
      alternative_methods: "Alternative Methods",
    };
    return methodMap[method] || method;
  };

  // Add these helper functions before the return statement
  const getCurrentPagePhases = (phases: QuitPlanPhase[], planId: number) => {
    const currentPage = phasePagination[planId] || 1;
    const startIndex = (currentPage - 1) * PHASES_PER_PAGE;
    const endIndex = startIndex + PHASES_PER_PAGE;
    return phases.slice(startIndex, endIndex);
  };

  const getTotalPages = (phases: QuitPlanPhase[]) => {
    return Math.ceil(phases.length / PHASES_PER_PAGE);
  };

  const handlePageChange = (planId: number, page: number) => {
    setPhasePagination((prev) => ({
      ...prev,
      [planId]: page,
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-600">Loading your quit plans...</p>
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
                Error Loading Plans
              </h2>
              <p className="text-gray-600">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quitPlans.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8 pt-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6">
              <Target className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              No Quit Plans Found
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              You haven't created any quit plans yet. Start your journey to quit
              smoking by creating your first personalized plan.
            </p>
            <Button
              onClick={() => navigate(USER_ROUTES.SMOKE_STATUS)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 text-lg"
            >
              Create Your Smoke Status
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Quit Plans
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Track your progress and stay motivated on your journey to quit
            smoking
          </p>
        </div>

        {/* Quit Plans */}
        <div className="space-y-8">
          {quitPlans.map((plan) => (
            <Card
              key={plan.planId}
              className="shadow-xl border-0 bg-white/80 backdrop-blur-sm"
            >
              <CardHeader className="pb-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-2xl text-gray-800">
                        Quit Plan
                      </CardTitle>
                      <Badge
                        className={`${getStatusColor(plan.status)} font-medium`}
                      >
                        {plan.status.charAt(0).toUpperCase() +
                          plan.status.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription className="text-base">
                      Method: {getMethodDisplayName(plan.quitMethod)} • Created{" "}
                      {formatDate(plan.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Calendar className="w-4 h-4" />
                      Quit Date
                    </div>
                    <div className="text-lg font-semibold text-gray-800">
                      {formatDate(plan.quitDate)}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Plan Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Triggers */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <h4 className="font-semibold text-gray-800">Triggers</h4>
                    </div>
                    <p className="text-sm text-gray-600 bg-orange-50 p-3 rounded-lg">
                      {plan.triggers}
                    </p>
                  </div>

                  {/* Strategies */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-600" />
                      <h4 className="font-semibold text-gray-800">
                        Strategies
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                      {plan.strategies}
                    </p>
                  </div>

                  {/* Support Network */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-600" />
                      <h4 className="font-semibold text-gray-800">
                        Support Network
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                      {plan.supportNetwork}
                    </p>
                  </div>
                </div>

                {/* Phases - Replace the existing phases section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-800">
                        Plan Phases
                      </h3>
                    </div>
                    {plan.phases.length > PHASES_PER_PAGE && (
                      <div className="text-sm text-gray-500">
                        Showing{" "}
                        {((phasePagination[plan.planId] || 1) - 1) *
                          PHASES_PER_PAGE +
                          1}{" "}
                        -{" "}
                        {Math.min(
                          (phasePagination[plan.planId] || 1) * PHASES_PER_PAGE,
                          plan.phases.length
                        )}{" "}
                        of {plan.phases.length} phases
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {getCurrentPagePhases(
                      plan.phases.sort((a, b) => a.phaseOrder - b.phaseOrder),
                      plan.planId
                    ).map((phase) => (
                      <Card
                        key={phase.phaseId}
                        className="border border-gray-200"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {getPhaseIcon(phase.status, phase.phaseOrder)}
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-gray-800">
                                  {phase.phaseName}
                                </h4>
                                <Badge
                                  className={`text-xs ${getStatusColor(
                                    phase.status
                                  )}`}
                                >
                                  {phase.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                {phase.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {phase.durationDays} days
                                </div>
                                <div className="flex items-center gap-1">
                                  <Target className="w-3 h-3" />
                                  {phase.targetCigarettesPerDay} cigs/day
                                </div>
                              </div>
                              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                <strong>Activities:</strong> {phase.activities}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {getTotalPages(plan.phases) > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handlePageChange(
                            plan.planId,
                            (phasePagination[plan.planId] || 1) - 1
                          )
                        }
                        disabled={(phasePagination[plan.planId] || 1) === 1}
                        className="px-3 py-1"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: getTotalPages(plan.phases) },
                          (_, i) => i + 1
                        ).map((page) => (
                          <Button
                            key={page}
                            variant={
                              (phasePagination[plan.planId] || 1) === page
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(plan.planId, page)}
                            className={`w-8 h-8 p-0 ${
                              (phasePagination[plan.planId] || 1) === page
                                ? "bg-blue-600! hover:bg-blue-700! text-white"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handlePageChange(
                            plan.planId,
                            (phasePagination[plan.planId] || 1) + 1
                          )
                        }
                        disabled={
                          (phasePagination[plan.planId] || 1) ===
                          getTotalPages(plan.phases)
                        }
                        className="px-3 py-1"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    className="cursor-pointer bg-blue-600! hover:bg-blue-700! text-white"
                    onClick={() =>
                      navigate(
                        USER_ROUTES.QUIT_PLAN_PHASES.replace(
                          ":id",
                          plan.planId.toString()
                        )
                      )
                    }
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Continue Plan
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-300 bg-transparent"
                  >
                    <Award className="w-4 h-4 mr-2" />
                    View Progress
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-300 bg-transparent"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Update Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
