"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  RefreshCw,
  Quote,
  User,
  Calendar,
  Heart,
  Star,
  Zap,
} from "lucide-react";
import {
  userMotivationalService,
  type MotivationalMessage,
} from "@/services/user/motivation-messages/service";

export function MotivationalBanner() {
  const [currentMessage, setCurrentMessage] =
    useState<MotivationalMessage | null>(null);
  const [allMessages, setAllMessages] = useState<MotivationalMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const fetchMessages = async () => {
    try {
      const response = await userMotivationalService.getAllMessages();
      if (response.success && response.data) {
        setAllMessages(response.data);
        // Select a random message
        const randomIndex = Math.floor(Math.random() * response.data.length);
        setCurrentMessage(response.data[randomIndex]);
      }
    } catch (error) {
      console.error("Error fetching motivational messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Auto-rotation effect
  useEffect(() => {
    if (allMessages.length === 0) return;

    const messageInterval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * allMessages.length);
        setCurrentMessage(allMessages[randomIndex]);
        setIsTransitioning(false);
        setTimeLeft(10); // Reset timer
      }, 300);
    }, 10000); // 10 seconds

    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 10));
    }, 1000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(timerInterval);
    };
  }, [allMessages]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Motivation:
        "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25",
      "Daily Boost":
        "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25",
      Progress:
        "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25",
      Encouragement:
        "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/25",
      "Tough Love":
        "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25",
      default:
        "bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-lg shadow-gray-500/25",
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  const getPhaseColor = (phase: string) => {
    const colors = {
      Preparation: "bg-orange-50 text-orange-700 border border-orange-200",
      Withdrawal: "bg-red-50 text-red-700 border border-red-200",
      "Early Recovery": "bg-blue-50 text-blue-700 border border-blue-200",
      Ongoing: "bg-green-50 text-green-700 border border-green-200",
      "Trigger Moments":
        "bg-purple-50 text-purple-700 border border-purple-200",
      default: "bg-gray-50 text-gray-700 border border-gray-200",
    };
    return colors[phase as keyof typeof colors] || colors.default;
  };

  if (loading || !currentMessage) {
    return (
      <div className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl shadow-indigo-500/10 animate-pulse">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/4 mb-4"></div>
                  <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4 mb-3"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
                </div>
                <div className="h-12 w-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Animated background with floating elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>

        {/* Floating decorative elements */}
        <div className="absolute top-4 left-1/4 w-2 h-2 bg-purple-400/30 rounded-full animate-pulse"></div>
        <div className="absolute top-8 right-1/3 w-1 h-1 bg-pink-400/40 rounded-full animate-ping"></div>
        <div className="absolute bottom-6 left-1/3 w-3 h-3 bg-indigo-400/20 rounded-full animate-bounce"></div>
        <div className="absolute bottom-4 right-1/4 w-1.5 h-1.5 bg-cyan-400/30 rounded-full animate-pulse"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-6">
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl shadow-indigo-500/10 hover:shadow-3xl hover:shadow-indigo-500/20 transition-all duration-500 group">
          <div className="relative overflow-hidden rounded-lg">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/50 opacity-60"></div>

            <div className="relative p-8">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  {/* Header with enhanced styling */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-sm opacity-30 animate-pulse"></div>
                      <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Daily Motivation
                      </h3>
                      <p className="text-sm text-gray-500">
                        Your daily dose of inspiration
                      </p>
                    </div>
                  </div>

                  {/* Enhanced quote section */}
                  <div
                    className={`relative mb-6 transition-all duration-300 ${
                      isTransitioning
                        ? "opacity-50 scale-95"
                        : "opacity-100 scale-100"
                    }`}
                  >
                    <div className="absolute -top-4 -left-4 text-6xl text-purple-200/30 font-serif">
                      "
                    </div>
                    <div className="absolute -bottom-4 -right-4 text-6xl text-pink-200/30 font-serif rotate-180">
                      "
                    </div>

                    <blockquote className="relative text-xl md:text-2xl font-semibold text-gray-800 leading-relaxed px-8 py-4">
                      <span className="bg-gradient-to-r from-gray-800 via-purple-800 to-pink-800 bg-clip-text text-transparent">
                        {currentMessage.content}
                      </span>
                    </blockquote>
                  </div>

                  {/* Enhanced author info */}
                  <div
                    className={`flex items-center gap-6 mb-6 text-sm transition-all duration-300 ${
                      isTransitioning ? "opacity-50" : "opacity-100"
                    }`}
                  >
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full border border-indigo-100">
                      <User className="h-4 w-4 text-indigo-600" />
                      <span className="font-medium text-indigo-700">
                        {currentMessage.author}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-pink-50 to-rose-50 rounded-full border border-pink-100">
                      <Calendar className="h-4 w-4 text-pink-600" />
                      <span className="font-medium text-pink-700">
                        {formatDate(currentMessage.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Enhanced badges */}
                  <div
                    className={`flex items-center gap-3 flex-wrap transition-all duration-300 ${
                      isTransitioning ? "opacity-50" : "opacity-100"
                    }`}
                  >
                    <Badge
                      className={`${getCategoryColor(
                        currentMessage.category
                      )} px-4 py-2 text-sm font-semibold rounded-full border-0 hover:scale-105 transition-transform duration-200`}
                    >
                      <Star className="h-3 w-3 mr-1.5" />
                      {currentMessage.category}
                    </Badge>
                    <Badge
                      className={`${getPhaseColor(
                        currentMessage.quitPhase
                      )} px-4 py-2 text-sm font-medium rounded-full hover:scale-105 transition-transform duration-200`}
                    >
                      <Zap className="h-3 w-3 mr-1.5" />
                      {currentMessage.quitPhase}
                    </Badge>
                  </div>
                </div>

                {/* Enhanced refresh button */}
                <div className="shrink-0 flex flex-col items-center gap-2">
                  {/* Timer progress indicator */}
                  <div className="relative w-16 h-16">
                    <svg
                      className="w-16 h-16 transform -rotate-90"
                      viewBox="0 0 64 64"
                    >
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-purple-200"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${
                          2 * Math.PI * 28 * (1 - (10 - timeLeft) / 10)
                        }`}
                        className="text-purple-500 transition-all duration-1000 ease-linear"
                        strokeLinecap="round"
                      />
                    </svg>
                    <Button
                      variant="ghost"
                      size="lg"
                      disabled={refreshing}
                      className="absolute inset-0 h-14 w-14 m-1 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border-2 border-purple-200/50 hover:border-purple-300/70 transition-all duration-300 group/btn"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300"></div>
                      <RefreshCw
                        className={`h-6 w-6 text-purple-600 transition-all duration-300 group-hover/btn:text-purple-700 ${
                          refreshing
                            ? "animate-spin"
                            : "group-hover/btn:rotate-180"
                        }`}
                      />
                    </Button>
                  </div>
                  <span className="text-xs text-purple-600 font-medium">
                    {timeLeft}s
                  </span>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-4 right-4 opacity-20">
                <Heart className="h-8 w-8 text-pink-400 fill-current animate-pulse" />
              </div>
              <div className="absolute bottom-4 left-4 opacity-10">
                <Quote className="h-12 w-12 text-indigo-400" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
