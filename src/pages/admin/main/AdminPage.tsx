"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  Trophy,
  TrendingUp,
  Heart,
  Phone,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";

const stats = [
  {
    title: "Active Users",
    value: "12,847",
    change: "+12.5%",
    trend: "up",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Success Rate",
    value: "85.2%",
    change: "+2.1%",
    trend: "up",
    icon: Trophy,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Support Sessions",
    value: "3,421",
    change: "+8.3%",
    trend: "up",
    icon: MessageSquare,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    title: "Crisis Calls",
    value: "127",
    change: "-15.2%",
    trend: "down",
    icon: Phone,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
];

const recentActivities = [
  {
    id: 1,
    type: "success",
    message: "Sarah M. completed 6 months smoke-free milestone",
    time: "2 hours ago",
    icon: Trophy,
  },
  {
    id: 2,
    type: "support",
    message: "New crisis support request from User #4521",
    time: "4 hours ago",
    icon: AlertTriangle,
  },
  {
    id: 3,
    type: "user",
    message: "25 new users registered today",
    time: "6 hours ago",
    icon: Users,
  },
  {
    id: 4,
    type: "program",
    message: "Weekly group session completed with 18 participants",
    time: "8 hours ago",
    icon: Calendar,
  },
];

export default function AdminPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your smoking cessation
            platform.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Export Report</Button>
          <Button className="bg-green-600 hover:bg-green-700">
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
                      vs last month
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
                <TrendingUp className="h-5 w-5 text-green-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest updates from your platform
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
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-green-600 hover:bg-green-700">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                Support Queue
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Programs
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Heart className="mr-2 h-4 w-4" />
                Health Resources
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-red-600">Urgent Alerts</CardTitle>
              <CardDescription>
                Items requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-800">
                    3 crisis calls pending
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    System maintenance due
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Success Stories</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">1,247</div>
            <p className="text-gray-600">People successfully quit this month</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>Health Impact</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">$2.1M</div>
            <p className="text-gray-600">Healthcare costs saved</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle>Community</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">98%</div>
            <p className="text-gray-600">User satisfaction rate</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
