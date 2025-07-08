"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trophy,
  Award,
  Star,
  Search,
  Filter,
  Calendar,
  Target,
  CheckCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  userAchievementService,
  type Achievement,
  type UserAchievement,
} from "@/services/user/achievement/service";
import { getUserFromToken } from "@/utils/token/auth";
import { toast } from "sonner";

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>(
    []
  );
  const [user, setUser] = useState<any>(null);
  const [claimingAchievements, setClaimingAchievements] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get user info
        const currentUser = getUserFromToken();
        setUser(currentUser);

        // Fetch achievements
        const achievementsResponse =
          await userAchievementService.getAllAchievements();
        setAchievements(achievementsResponse.data || []);

        // Fetch user achievements if user exists
        if (currentUser?.username) {
          try {
            const userAchievementsResponse =
              await userAchievementService.getUserAchievements(
                currentUser.username
              );
            setUserAchievements(userAchievementsResponse.data || []);
          } catch (userAchievementError) {
            console.error(
              "Error fetching user achievements:",
              userAchievementError
            );
            // Don't set error state for user achievements fetch failure
          }
        }
      } catch (err) {
        setError("Failed to load achievements. Please try again later.");
        console.error("Error fetching achievements:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredAchievements = achievements.filter((achievement) => {
    const matchesSearch =
      achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || achievement.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(achievements.map((a) => a.category)));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isUserAchieved = (achievementId: number) => {
    return userAchievements.some(
      (userAchievement) => userAchievement.achievementId === achievementId
    );
  };

  const handleClaimAchievement = async (
    achievementId: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    if (!user?.username) {
      toast("Authentication Required");
      return;
    }

    if (isUserAchieved(achievementId)) {
      toast("Achievement already claimed");
      return;
    }

    setClaimingAchievements((prev) => new Set(prev).add(achievementId));

    try {
      await userAchievementService.awardAchievement(
        achievementId,
        user.username,
        "Manual claim"
      );

      // Update local state
      const achievement = achievements.find(
        (a) => a.achievementId === achievementId
      );
      if (achievement) {
        const newUserAchievement: UserAchievement = {
          userAchievementId: 0, // Will be set by backend
          achievementId,
          achievementName: achievement.name,
          username: user.username,
          userFullName: user.fullName || user.username,
          awardedAt: new Date().toISOString(),
          reason: "Manual claim",
        };
        setUserAchievements((prev) => [...prev, newUserAchievement]);
      }

      toast("Achievement claimed successfully!");
    } catch (error) {
      console.error("Error claiming achievement:", error);
      toast("Failed to claim achievement");
    } finally {
      setClaimingAchievements((prev) => {
        const newSet = new Set(prev);
        newSet.delete(achievementId);
        return newSet;
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <Trophy className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Unable to Load Achievements
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      {/* Header Section */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
              🏆 Unlock Your Potential
            </Badge>
            <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Your <span className="text-yellow-600">Achievement</span> Journey
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Track your progress, celebrate milestones, and unlock rewards as
              you work towards your goals. Every step forward is worth
              celebrating!
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search achievements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-200 focus:border-yellow-500 focus:ring-yellow-500"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full sm:w-48 bg-white border-gray-200">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Achievements Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-white border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <Skeleton className="h-32 w-32 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3 mx-auto" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredAchievements.length === 0 ? (
            <div className="text-center py-16">
              <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Achievements Found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedCategory !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No achievements are currently available."}
              </p>
              {(searchTerm || selectedCategory !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  className="border-yellow-600 text-yellow-600 hover:bg-yellow-50"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAchievements.map((achievement) => {
                const isAchieved = isUserAchieved(achievement.achievementId);
                const isClaiming = claimingAchievements.has(
                  achievement.achievementId
                );

                return (
                  <Card
                    key={achievement.achievementId}
                    className={`bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group ${
                      isAchieved ? "ring-2 ring-yellow-400" : ""
                    }`}
                  >
                    <CardHeader className="pb-4 text-center">
                      <div className="relative mx-auto mb-4">
                        <div
                          className={`w-32 h-32 rounded-full overflow-hidden mx-auto ${
                            isAchieved
                              ? "ring-4 ring-yellow-400"
                              : "grayscale opacity-60"
                          }`}
                        >
                          <img
                            src={achievement.badgeImage || "/placeholder.svg"}
                            alt={achievement.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {isAchieved && (
                          <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-2">
                            <CheckCircle className="h-6 w-6 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <CardTitle
                            className={`text-lg text-center ${
                              isAchieved ? "text-yellow-600" : "text-gray-700"
                            }`}
                          >
                            {achievement.name}
                          </CardTitle>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {achievement.category}
                        </Badge>
                        <CardDescription className="text-gray-600 text-center">
                          {achievement.description}
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="flex items-center justify-center text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 mr-1 text-yellow-500" />
                              <span>{achievement.pointsAwarded} points</span>
                            </div>
                            <div className="flex items-center">
                              <Target className="h-4 w-4 mr-1" />
                              <span>{achievement.criteria}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-xs text-gray-400 text-center">
                          <div className="flex items-center justify-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>
                              Created {formatDate(achievement.createdAt)}
                            </span>
                          </div>
                        </div>

                        {isAchieved ? (
                          <div className="w-full text-center py-2 bg-yellow-100 text-yellow-800 rounded-md font-medium">
                            <CheckCircle className="h-4 w-4 inline mr-2" />
                            Completed
                          </div>
                        ) : (
                          <Button
                            className="w-full bg-yellow-600! hover:bg-yellow-700! text-white"
                            size="sm"
                            disabled={isClaiming || !user?.username}
                            onClick={(e) =>
                              handleClaimAchievement(
                                achievement.achievementId,
                                e
                              )
                            }
                          >
                            {isClaiming ? (
                              "Claiming..."
                            ) : (
                              <>
                                <Award className="h-4 w-4 mr-2" />
                                Take Achievement
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      {!loading && achievements.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-yellow-50 to-orange-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-yellow-600">
                  {achievements.length}
                </div>
                <div className="text-sm text-gray-600">Total Achievements</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {userAchievements.length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {achievements.reduce((sum, a) => sum + a.pointsAwarded, 0)}
                </div>
                <div className="text-sm text-gray-600">
                  Total Points Available
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {categories.length}
                </div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
