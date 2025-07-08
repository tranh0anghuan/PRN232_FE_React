"use client";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Bell,
  Mail,
  Smartphone,
  Clock,
  BarChart3,
  Trophy,
  Users,
  Settings,
  Save,
  RefreshCw,
  Plus,
  AlertCircle,
} from "lucide-react";
import { getUserFromToken } from "@/utils/token/auth";
import { toast } from "sonner";
import {
  userNotificationSettingsService,
  type NotificationSettings,
} from "@/services/user/notifcation/settings/service";

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] =
    useState<NotificationSettings | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [settingsNotFound, setSettingsNotFound] = useState(false);

  // Default settings for new users
  const defaultSettings = {
    emailNotifications: true,
    pushNotifications: true,
    dailyReminders: true,
    weeklyReports: true,
    achievementNotifications: true,
    communityNotifications: true,
    preferredTime: "09:00",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setSettingsNotFound(false);

        // Get user info
        const currentUser = getUserFromToken();
        setUser(currentUser);

        // Fetch notification settings if user exists
        if (currentUser?.username) {
          try {
            const settingsResponse =
              await userNotificationSettingsService.getByUsername(
                currentUser.username
              );

            if (settingsResponse.success && settingsResponse.data) {
              setSettings(settingsResponse.data);
              setOriginalSettings(settingsResponse.data);
            } else {
              // Settings not found, show create dialog
              setSettingsNotFound(true);
              setShowCreateDialog(true);
            }
          } catch (fetchError: any) {
            // Check if it's a "not found" error
            if (
              fetchError.response?.data?.message?.includes("not found") ||
              fetchError.response?.status === 404
            ) {
              setSettingsNotFound(true);
              setShowCreateDialog(true);
            } else {
              throw fetchError;
            }
          }
        }
      } catch (err) {
        setError(
          "Failed to load notification settings. Please try again later."
        );
        console.error("Error fetching notification settings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (settings && originalSettings) {
      const hasChanged =
        settings.emailNotifications !== originalSettings.emailNotifications ||
        settings.pushNotifications !== originalSettings.pushNotifications ||
        settings.dailyReminders !== originalSettings.dailyReminders ||
        settings.weeklyReports !== originalSettings.weeklyReports ||
        settings.achievementNotifications !==
          originalSettings.achievementNotifications ||
        settings.communityNotifications !==
          originalSettings.communityNotifications ||
        settings.preferredTime !== originalSettings.preferredTime;
      setHasChanges(hasChanged);
    }
  }, [settings, originalSettings]);

  const handleCreateSettings = async () => {
    if (!user?.username) {
      toast("Authentication Required");
      return;
    }

    setCreating(true);

    try {
      await userNotificationSettingsService.createSettings({
        username: user.username,
        ...defaultSettings,
      });

      // Create the settings object for local state
      const newSettings: NotificationSettings = {
        username: user.username,
        userFullName: user.fullName || user.username,
        ...defaultSettings,
        updatedAt: new Date().toISOString(),
      };

      setSettings(newSettings);
      setOriginalSettings(newSettings);
      setShowCreateDialog(false);
      setSettingsNotFound(false);
      toast("Notification settings created successfully!");
    } catch (error) {
      console.error("Error creating notification settings:", error);
      toast("Failed to create notification settings");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleChange = (
    field: keyof NotificationSettings,
    value: boolean
  ) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const handleTimeChange = (time: string) => {
    if (!settings) return;
    setSettings({ ...settings, preferredTime: time });
  };

  const handleSave = async () => {
    if (!settings || !user?.username) {
      toast("Authentication Required");
      return;
    }

    setSaving(true);

    try {
      await userNotificationSettingsService.updateSettings({
        username: user.username,
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
        dailyReminders: settings.dailyReminders,
        weeklyReports: settings.weeklyReports,
        achievementNotifications: settings.achievementNotifications,
        communityNotifications: settings.communityNotifications,
        preferredTime: settings.preferredTime,
      });

      setOriginalSettings(settings);
      setHasChanges(false);
      toast("Notification settings saved successfully!");
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast("Failed to save notification settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (originalSettings) {
      setSettings(originalSettings);
      setHasChanges(false);
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

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        const displayTime = new Date(
          `2000-01-01T${timeString}`
        ).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        times.push({ value: timeString, label: displayTime });
      }
    }
    return times;
  };

  // Helper function to get dynamic background classes
  const getBackgroundClass = (isEnabled: boolean, colorScheme: string) => {
    if (isEnabled) {
      switch (colorScheme) {
        case "blue":
          return "bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-200 shadow-blue-100/50";
        case "green":
          return "bg-gradient-to-r from-green-100 to-emerald-100 border-green-200 shadow-green-100/50";
        case "orange":
          return "bg-gradient-to-r from-orange-100 to-yellow-100 border-orange-200 shadow-orange-100/50";
        case "indigo":
          return "bg-gradient-to-r from-indigo-100 to-purple-100 border-indigo-200 shadow-indigo-100/50";
        case "teal":
          return "bg-gradient-to-r from-green-100 to-teal-100 border-green-200 shadow-green-100/50";
        case "pink":
          return "bg-gradient-to-r from-pink-100 to-rose-100 border-pink-200 shadow-pink-100/50";
        case "amber":
          return "bg-gradient-to-r from-amber-100 to-orange-100 border-amber-200 shadow-amber-100/50";
        default:
          return "bg-gradient-to-r from-gray-100 to-slate-100 border-gray-200 shadow-gray-100/50";
      }
    } else {
      return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 opacity-60";
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <Settings className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Unable to Load Settings
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Create Settings Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <DialogTitle className="text-xl">
                Setup Notification Settings
              </DialogTitle>
            </div>
            <DialogDescription className="text-gray-600">
              It looks like you haven't set up your notification preferences
              yet. We'll create your settings with our recommended defaults,
              which you can customize afterwards.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Default Settings Include:
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Email and push notifications enabled</li>
                    <li>• Daily reminders and weekly reports</li>
                    <li>• Achievement and community notifications</li>
                    <li>• Preferred time set to 9:00 AM</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSettings}
              disabled={creating}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              {creating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Settings
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header Section */}
      <section className="py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
              ⚙️ Customize Your Experience
            </Badge>
            <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Notification <span className="text-purple-600">Settings</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Customize how and when you receive notifications to stay informed
              about your quit journey without being overwhelmed.
            </p>
          </div>
        </div>
      </section>

      {/* Settings Content */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-white border-0 shadow-lg">
                  <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[...Array(3)].map((_, j) => (
                      <div
                        key={j}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <Skeleton className="h-5 w-32 mb-1" />
                          <Skeleton className="h-4 w-48" />
                        </div>
                        <Skeleton className="h-6 w-12" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : settingsNotFound ? (
            <div className="text-center py-16">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
                <div className="text-purple-500 mb-4">
                  <Settings className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Settings Not Found
                </h3>
                <p className="text-gray-600 mb-6">
                  You haven't set up your notification preferences yet. Click
                  the button above to create your settings with recommended
                  defaults.
                </p>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Settings
                </Button>
              </div>
            </div>
          ) : (
            settings && (
              <div className="space-y-8">
                {/* Delivery Methods */}
                <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                        <Bell className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900">
                          Delivery Methods
                        </CardTitle>
                        <CardDescription>
                          Choose how you want to receive notifications
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 shadow-sm ${getBackgroundClass(
                        settings.emailNotifications,
                        "blue"
                      )}`}
                    >
                      <div className="flex items-center gap-3">
                        <Mail
                          className={`h-5 w-5 transition-colors duration-300 ${
                            settings.emailNotifications
                              ? "text-blue-600"
                              : "text-gray-400"
                          }`}
                        />
                        <div>
                          <Label
                            htmlFor="email-notifications"
                            className="text-base font-medium text-gray-900"
                          >
                            Email Notifications
                          </Label>
                          <p
                            className={`text-sm transition-colors duration-300 ${
                              settings.emailNotifications
                                ? "text-gray-600"
                                : "text-gray-400"
                            }`}
                          >
                            Receive notifications via email
                          </p>
                        </div>
                      </div>
                      <Switch
                        className="bg-gray-300!"
                        id="email-notifications"
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) =>
                          handleToggleChange("emailNotifications", checked)
                        }
                      />
                    </div>

                    <div
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 shadow-sm ${getBackgroundClass(
                        settings.pushNotifications,
                        "green"
                      )}`}
                    >
                      <div className="flex items-center gap-3">
                        <Smartphone
                          className={`h-5 w-5 transition-colors duration-300 ${
                            settings.pushNotifications
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        />
                        <div>
                          <Label
                            htmlFor="push-notifications"
                            className="text-base font-medium text-gray-900"
                          >
                            Push Notifications
                          </Label>
                          <p
                            className={`text-sm transition-colors duration-300 ${
                              settings.pushNotifications
                                ? "text-gray-600"
                                : "text-gray-400"
                            }`}
                          >
                            Receive push notifications on your device
                          </p>
                        </div>
                      </div>
                      <Switch
                        className="bg-gray-300!"
                        id="push-notifications"
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) =>
                          handleToggleChange("pushNotifications", checked)
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Notification Types */}
                <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                        <Settings className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900">
                          Notification Types
                        </CardTitle>
                        <CardDescription>
                          Select which types of notifications you want to
                          receive
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 shadow-sm ${getBackgroundClass(
                        settings.dailyReminders,
                        "orange"
                      )}`}
                    >
                      <div className="flex items-center gap-3">
                        <Clock
                          className={`h-5 w-5 transition-colors duration-300 ${
                            settings.dailyReminders
                              ? "text-orange-600"
                              : "text-gray-400"
                          }`}
                        />
                        <div>
                          <Label
                            htmlFor="daily-reminders"
                            className="text-base font-medium text-gray-900"
                          >
                            Daily Reminders
                          </Label>
                          <p
                            className={`text-sm transition-colors duration-300 ${
                              settings.dailyReminders
                                ? "text-gray-600"
                                : "text-gray-400"
                            }`}
                          >
                            Get daily motivation and check-in reminders
                          </p>
                        </div>
                      </div>
                      <Switch
                        className="bg-gray-300!"
                        id="daily-reminders"
                        checked={settings.dailyReminders}
                        onCheckedChange={(checked) =>
                          handleToggleChange("dailyReminders", checked)
                        }
                      />
                    </div>

                    <div
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 shadow-sm ${getBackgroundClass(
                        settings.weeklyReports,
                        "indigo"
                      )}`}
                    >
                      <div className="flex items-center gap-3">
                        <BarChart3
                          className={`h-5 w-5 transition-colors duration-300 ${
                            settings.weeklyReports
                              ? "text-indigo-600"
                              : "text-gray-400"
                          }`}
                        />
                        <div>
                          <Label
                            htmlFor="weekly-reports"
                            className="text-base font-medium text-gray-900"
                          >
                            Weekly Reports
                          </Label>
                          <p
                            className={`text-sm transition-colors duration-300 ${
                              settings.weeklyReports
                                ? "text-gray-600"
                                : "text-gray-400"
                            }`}
                          >
                            Receive weekly progress summaries
                          </p>
                        </div>
                      </div>
                      <Switch
                        className="bg-gray-300!"
                        id="weekly-reports"
                        checked={settings.weeklyReports}
                        onCheckedChange={(checked) =>
                          handleToggleChange("weeklyReports", checked)
                        }
                      />
                    </div>

                    <div
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 shadow-sm ${getBackgroundClass(
                        settings.achievementNotifications,
                        "teal"
                      )}`}
                    >
                      <div className="flex items-center gap-3">
                        <Trophy
                          className={`h-5 w-5 transition-colors duration-300 ${
                            settings.achievementNotifications
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        />
                        <div>
                          <Label
                            htmlFor="achievement-notifications"
                            className="text-base font-medium text-gray-900"
                          >
                            Achievement Notifications
                          </Label>
                          <p
                            className={`text-sm transition-colors duration-300 ${
                              settings.achievementNotifications
                                ? "text-gray-600"
                                : "text-gray-400"
                            }`}
                          >
                            Get notified when you unlock new achievements
                          </p>
                        </div>
                      </div>
                      <Switch
                        className="bg-gray-300!"
                        id="achievement-notifications"
                        checked={settings.achievementNotifications}
                        onCheckedChange={(checked) =>
                          handleToggleChange(
                            "achievementNotifications",
                            checked
                          )
                        }
                      />
                    </div>

                    <div
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 shadow-sm ${getBackgroundClass(
                        settings.communityNotifications,
                        "pink"
                      )}`}
                    >
                      <div className="flex items-center gap-3">
                        <Users
                          className={`h-5 w-5 transition-colors duration-300 ${
                            settings.communityNotifications
                              ? "text-pink-600"
                              : "text-gray-400"
                          }`}
                        />
                        <div>
                          <Label
                            htmlFor="community-notifications"
                            className="text-base font-medium text-gray-900"
                          >
                            Community Notifications
                          </Label>
                          <p
                            className={`text-sm transition-colors duration-300 ${
                              settings.communityNotifications
                                ? "text-gray-600"
                                : "text-gray-400"
                            }`}
                          >
                            Stay updated on community activities and messages
                          </p>
                        </div>
                      </div>
                      <Switch
                        className="bg-gray-300!"
                        id="community-notifications"
                        checked={settings.communityNotifications}
                        onCheckedChange={(checked) =>
                          handleToggleChange("communityNotifications", checked)
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Timing Preferences */}
                <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900">
                          Timing Preferences
                        </CardTitle>
                        <CardDescription>
                          Set your preferred time for receiving notifications
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`p-4 rounded-lg border transition-all duration-300 shadow-sm ${getBackgroundClass(
                        true,
                        "amber"
                      )}`}
                    >
                      <Label
                        htmlFor="preferred-time"
                        className="text-base font-medium text-gray-900 mb-3 block"
                      >
                        Preferred Notification Time
                      </Label>
                      <Select
                        value={settings.preferredTime}
                        onValueChange={handleTimeChange}
                      >
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue placeholder="Select preferred time" />
                        </SelectTrigger>
                        <SelectContent>
                          {generateTimeOptions().map((time) => (
                            <SelectItem key={time.value} value={time.value}>
                              {time.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-600 mt-2">
                        Daily reminders and scheduled notifications will be sent
                        around this time
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center p-6 bg-white rounded-lg shadow-lg border">
                  <div className="text-sm text-gray-600">
                    Last updated: {formatDate(settings.updatedAt)}
                    {hasChanges && (
                      <span className="text-amber-600 ml-2">
                        • Unsaved changes
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    {hasChanges && (
                      <Button
                        variant="outline"
                        onClick={handleReset}
                        disabled={saving}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    )}
                    <Button
                      onClick={handleSave}
                      disabled={!hasChanges || saving}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                    >
                      {saving ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Settings
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}
