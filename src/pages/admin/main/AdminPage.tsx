"use client";

import { useEffect, useState } from "react";
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
  Users,
  Trophy,
  TrendingUp,
  Heart,
  AlertTriangle,
  BookOpen,
  Eye,
  Tag,
  Award,
} from "lucide-react";
import {
  userHomePageService,
  type HomePageApiResponse,
} from "@/services/user/home/service";

export default function AdminPage() {
  const [data, setData] = useState<HomePageApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await userHomePageService.getAll();
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <AdminPageSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Error loading dashboard data: {error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      title: "Total Blogs",
      value: data.blogStats.totalBlogs.toLocaleString(),
      change: `+${data.blogStats.blogsThisMonth}`,
      trend: "up" as const,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      subtitle: "this month",
    },
    {
      title: "Total Views",
      value: data.blogStats.totalViews.toLocaleString(),
      change: "+12.5%",
      trend: "up" as const,
      icon: Eye,
      color: "text-green-600",
      bgColor: "bg-green-100",
      subtitle: "vs last month",
    },
    {
      title: "Featured Blogs",
      value: data.featuredBlogs.length.toString(),
      change: "+3",
      trend: "up" as const,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      subtitle: "currently featured",
    },
    {
      title: "Top Achievers",
      value: data.topAchievements.length.toString(),
      change: "+2",
      trend: "up" as const,
      icon: Trophy,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      subtitle: "this period",
    },
  ];

  const recentActivities = [
    ...data.featuredBlogs.slice(0, 2).map((blog, index) => ({
      id: `blog-${blog.blogId}`,
      type: "blog" as const,
      message: `New featured blog: "${blog.title}" by ${blog.authorUsername}`,
      time: new Date(blog.publishedAt).toLocaleDateString(),
      icon: BookOpen,
      metadata: `${blog.viewCount} views • ${blog.category}`,
    })),
    ...data.topAchievements.slice(0, 2).map((achievement, index) => ({
      id: `achievement-${achievement.username}`,
      type: "achievement" as const,
      message: `${achievement.username} earned ${achievement.totalAchievements} achievements`,
      time: new Date(achievement.lastAchievementDate).toLocaleDateString(),
      icon: Award,
      metadata: `Latest: ${
        achievement.recentAchievements[0]?.achievementName || "N/A"
      }`,
    })),
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your platform.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Export Report</Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            View Analytics
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <Badge
                      variant={stat.trend === "up" ? "default" : "secondary"}
                      className={`text-xs ${
                        stat.trend === "up"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-red-100 text-red-800 hover:bg-red-100"
                      }`}
                    >
                      {stat.change}
                    </Badge>
                    <span className="text-xs text-gray-500 ml-2">
                      {stat.subtitle}
                    </span>
                  </div>
                </div>
                <div className={`${stat.bgColor} rounded-full p-3`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest updates from your blog platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                  >
                    <div className="bg-white rounded-full p-2 shadow-sm">
                      <activity.icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.time}
                      </p>
                      {activity.metadata && (
                        <p className="text-xs text-blue-600 mt-1">
                          {activity.metadata}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Category Stats */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
                <BookOpen className="mr-2 h-4 w-4" />
                Manage Blogs
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <Users className="mr-2 h-4 w-4" />
                User Management
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <Trophy className="mr-2 h-4 w-4" />
                Achievements
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <Tag className="mr-2 h-4 w-4" />
                Categories
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
              <CardDescription>Blog posts by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.blogStats.categoryStats.map((category) => (
                  <div
                    key={category.category}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium">
                      {category.category}
                    </span>
                    <Badge variant="secondary">{category.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Featured Blogs */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Featured Blogs
          </CardTitle>
          <CardDescription>Currently featured blog posts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.featuredBlogs.slice(0, 6).map((blog) => (
              <Card key={blog.blogId} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
                    <img
                      src={"/Smoking-Cessation.jpg"}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {blog.summary}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>by {blog.authorUsername}</span>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {blog.viewCount}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {blog.category}
                    </Badge>
                    {blog.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Achievements */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Top Achievers
          </CardTitle>
          <CardDescription>Users with the most achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.topAchievements.map((achiever) => (
              <Card key={achiever.username} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-yellow-100 rounded-full p-2">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">
                        {achiever.username}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {achiever.totalAchievements} achievements
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {achiever.recentAchievements
                      .slice(0, 3)
                      .map((achievement) => (
                        <div
                          key={achievement.achievementId}
                          className="flex items-center gap-2 text-xs"
                        >
                          {achievement.iconUrl ? (
                            <img
                              src={achievement.iconUrl || "/placeholder.svg"}
                              alt={achievement.achievementName}
                              className="w-4 h-4"
                            />
                          ) : (
                            <Award className="h-3 w-3 text-gray-400" />
                          )}
                          <span className="flex-1 truncate">
                            {achievement.achievementName}
                          </span>
                        </div>
                      ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Last achievement:{" "}
                    {new Date(
                      achiever.lastAchievementDate
                    ).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Membership Plans */}
      {data.membershipPlans.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-green-600" />
              Membership Plans
            </CardTitle>
            <CardDescription>Available subscription plans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.membershipPlans.map((plan) => (
                <Card
                  key={plan.planId}
                  className={`border ${
                    plan.isActive
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{plan.planName}</h3>
                      {plan.isActive && (
                        <Badge className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {plan.description}
                    </p>
                    <div className="text-2xl font-bold mb-2">
                      ${plan.price}
                      <span className="text-sm font-normal text-gray-500">
                        /{plan.durationDays} days
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <li
                          key={index}
                          className="text-xs text-gray-600 flex items-center gap-1"
                        >
                          <div className="w-1 h-1 bg-gray-400 rounded-full" />
                          {feature}
                        </li>
                      ))}
                      {plan.features.length > 3 && (
                        <li className="text-xs text-gray-500">
                          +{plan.features.length - 3} more features
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AdminPageSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                  >
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
