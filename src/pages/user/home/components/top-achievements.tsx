import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Calendar } from "lucide-react";
import type { TopAchievement } from "@/services/user/home/service";

interface TopAchievementsProps {
  achievements: TopAchievement[];
}

export function TopAchievements({ achievements }: TopAchievementsProps) {
  if (achievements.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Community Champions
          </h2>
          <p className="text-xl text-gray-600">
            Celebrating our members' incredible achievements
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {achievements.slice(0, 2).map((user, index) => (
            <Card key={user.username} className="border-0 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full w-12 h-12 flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{user.username}</CardTitle>
                      <p className="text-gray-600">
                        {user.totalAchievements} achievements earned
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    #{index + 1} Top Achiever
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <Award className="h-4 w-4 mr-2" />
                    Recent Achievements
                  </h4>
                  <div className="space-y-3">
                    {user.recentAchievements.slice(0, 3).map((achievement) => (
                      <div
                        key={achievement.achievementId}
                        className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="bg-green-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                          <Trophy className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">
                            {achievement.achievementName}
                          </p>
                          <p className="text-gray-600 text-xs">
                            {achievement.description}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(
                              achievement.awardedDate
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
