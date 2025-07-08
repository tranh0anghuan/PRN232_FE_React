"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Calendar,
  User,
  AlertCircle,
  Info,
  CheckCheck,
  Trash2,
  MoreVertical,
  Settings,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getUserFromToken } from "@/utils/token/auth";
import { toast } from "sonner";
import { useNotification } from "@/context/notifaction-context";
import {
  userNotificationService,
  type Notification,
} from "@/services/user/notifcation/service";
import { useNavigate } from "react-router-dom";
import { USER_ROUTES } from "@/routes/user/user";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [user, setUser] = useState<any>(null);
  const [markingAsRead, setMarkingAsRead] = useState<Set<number>>(new Set());
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
  const [deletingNotifications, setDeletingNotifications] = useState<
    Set<number>
  >(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<
    number | null
  >(null);
  const navigate = useNavigate();
  const { decrementUnreadCount, setUnreadCount, refreshUnreadCount } =
    useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get user info
        const currentUser = getUserFromToken();
        setUser(currentUser);

        // Fetch notifications if user exists
        if (currentUser?.username) {
          const notificationsResponse =
            await userNotificationService.getByUsername(currentUser.username);
          setNotifications(notificationsResponse.data || []);
        }
      } catch (err) {
        setError("Failed to load notifications. Please try again later.");
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      selectedType === "all" || notification.notificationType === selectedType;
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "read" && notification.isRead) ||
      (selectedStatus === "unread" && !notification.isRead);
    return matchesSearch && matchesType && matchesStatus;
  });

  const notificationTypes = Array.from(
    new Set(notifications.map((n) => n.notificationType))
  );
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );
      return diffInMinutes < 1 ? "Just now" : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const getNotificationIcon = (type: string, isRead: boolean) => {
    const iconClass = `h-5 w-5 ${isRead ? "text-gray-400" : "text-blue-500"}`;

    switch (type.toLowerCase()) {
      case "achievement":
        return <CheckCircle className={iconClass} />;
      case "reminder":
        return <Clock className={iconClass} />;
      case "alert":
        return <AlertCircle className={iconClass} />;
      case "info":
        return <Info className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      achievement: "bg-green-100 text-green-800",
      reminder: "bg-blue-100 text-blue-800",
      alert: "bg-red-100 text-red-800",
      info: "bg-purple-100 text-purple-800",
      default: "bg-gray-100 text-gray-800",
    };
    return colors[type.toLowerCase() as keyof typeof colors] || colors.default;
  };

  const handleMarkAsRead = async (
    notificationId: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    if (!user?.username) {
      toast("Authentication Required");
      return;
    }

    // Check if notification is already read
    const notification = notifications.find(
      (n) => n.notificationId === notificationId
    );
    if (notification?.isRead) {
      toast("Notification already marked as read");
      return;
    }

    setMarkingAsRead((prev) => new Set(prev).add(notificationId));

    try {
      await userNotificationService.markAsRead(notificationId);

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.notificationId === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      toast("Notification marked as read");
      decrementUnreadCount();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast("Failed to mark notification as read");
    } finally {
      setMarkingAsRead((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.username) {
      toast("Authentication Required");
      return;
    }

    setMarkingAllAsRead(true);

    try {
      await userNotificationService.markAllAsRead(user.username);

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );

      toast("All notifications marked as read");
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast("Failed to mark all notifications as read");
    } finally {
      setMarkingAllAsRead(false);
    }
  };

  const handleDeleteClick = (notificationId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotificationToDelete(notificationId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!notificationToDelete) return;

    setDeletingNotifications((prev) => new Set(prev).add(notificationToDelete));

    try {
      // Before removing from local state, check if it was unread:
      const notificationToDeleteObj = notifications.find(
        (n) => n.notificationId === notificationToDelete
      );
      if (notificationToDeleteObj && !notificationToDeleteObj.isRead) {
        decrementUnreadCount();
      }

      await userNotificationService.deleteNotification(notificationToDelete);

      // Remove from local state
      setNotifications((prev) =>
        prev.filter(
          (notification) => notification.notificationId !== notificationToDelete
        )
      );

      toast("Notification deleted successfully");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast("Failed to delete notification");
    } finally {
      setDeletingNotifications((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notificationToDelete);
        return newSet;
      });
      setDeleteDialogOpen(false);
      setNotificationToDelete(null);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // If already read, do nothing
    if (notification.isRead) return;

    // Mark as read when clicked
    await handleMarkAsRead(notification.notificationId, {} as React.MouseEvent);
  };

  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <Bell className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Unable to Load Notifications
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header Section */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
              🔔 Stay Updated
            </Badge>
            <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Your <span className="text-blue-600">Notifications</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay informed about your progress, achievements, and important
              updates on your quit journey.
            </p>
            {unreadCount > 0 && (
              <div className="flex justify-center">
                <Badge className="bg-red-100 text-red-800 px-4 py-2">
                  {unreadCount} unread notification
                  {unreadCount !== 1 ? "s" : ""}
                </Badge>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8 max-w-4xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full lg:w-48 bg-white border-gray-200">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {notificationTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full lg:w-48 bg-white border-gray-200">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => navigate(USER_ROUTES.NOTIFICATION.SETTINGS)}
              className="bg-green-600! hover:bg-green-700! text-white"
            >
              <Settings className="h-4 w-4 mr-2" />
              Notification Settings
            </Button>
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                disabled={markingAllAsRead}
                className="bg-blue-600! hover:bg-blue-700! text-white"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                {markingAllAsRead ? "Marking..." : "Mark All Read"}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Notifications List */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="bg-white border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Notifications Found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ||
                selectedType !== "all" ||
                selectedStatus !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "You're all caught up! No notifications at the moment."}
              </p>
              {(searchTerm ||
                selectedType !== "all" ||
                selectedStatus !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedType("all");
                    setSelectedStatus("all");
                  }}
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => {
                const isMarkingThisAsRead = markingAsRead.has(
                  notification.notificationId
                );
                const isDeletingThis = deletingNotifications.has(
                  notification.notificationId
                );

                return (
                  <Card
                    key={notification.notificationId}
                    className={`bg-white border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
                      !notification.isRead
                        ? "ring-2 ring-blue-100 bg-blue-50/30"
                        : ""
                    } ${isDeletingThis ? "opacity-50" : ""}`}
                    onClick={() =>
                      !isDeletingThis && handleNotificationClick(notification)
                    }
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="shrink-0 mt-1">
                          {getNotificationIcon(
                            notification.notificationType,
                            notification.isRead
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3
                              className={`font-semibold ${
                                notification.isRead
                                  ? "text-gray-700"
                                  : "text-gray-900"
                              }`}
                            >
                              {notification.title}
                              {!notification.isRead && (
                                <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                            </h3>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge
                                className={getTypeColor(
                                  notification.notificationType
                                )}
                              >
                                {notification.notificationType}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {!notification.isRead && (
                                    <DropdownMenuItem
                                      onClick={(e) =>
                                        handleMarkAsRead(
                                          notification.notificationId,
                                          e
                                        )
                                      }
                                      disabled={isMarkingThisAsRead}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      {isMarkingThisAsRead
                                        ? "Marking..."
                                        : "Mark as Read"}
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={(e) =>
                                      handleDeleteClick(
                                        notification.notificationId,
                                        e
                                      )
                                    }
                                    disabled={isDeletingThis}
                                    className="text-red-600! focus:text-red-600!"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {isDeletingThis ? "Deleting..." : "Delete"}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          <p
                            className={`mb-3 ${
                              notification.isRead
                                ? "text-gray-600"
                                : "text-gray-800"
                            }`}
                          >
                            {notification.message}
                          </p>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{notification.userFullName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(notification.createdAt)}</span>
                            </div>
                            {notification.relatedEntityType && (
                              <div className="flex items-center gap-1">
                                <span>
                                  Related to: {notification.relatedEntityType}
                                </span>
                              </div>
                            )}
                          </div>

                          {!notification.isRead && !isDeletingThis && (
                            <div className="mt-2 text-xs text-blue-600 font-medium">
                              Click to mark as read
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notification? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600! hover:bg-red-700! focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stats Section */}
      {!loading && notifications.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {notifications.length}
                </div>
                <div className="text-sm text-gray-600">Total Notifications</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-600">
                  {unreadCount}
                </div>
                <div className="text-sm text-gray-600">Unread</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {notifications.length - unreadCount}
                </div>
                <div className="text-sm text-gray-600">Read</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {notificationTypes.length}
                </div>
                <div className="text-sm text-gray-600">Types</div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
