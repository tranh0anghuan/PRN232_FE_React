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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Users,
  MessageSquare,
  Lock,
  Globe,
  Calendar,
  User,
  ArrowLeft,
  Heart,
  Pin,
  ImageIcon,
  Video,
  FileText,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";
import {
  userCommunityService,
  type Community,
  type CommunityMember,
  type CommunityPost,
} from "@/services/user/community/service";
import { postService } from "@/services/admin/post/service";
import { getUserFromToken } from "@/utils/token/auth";
import { useNavigate, useParams } from "react-router-dom";
import { USER_ROUTES } from "@/routes/user/user";
import { toast } from "sonner";
import CommentSection from "./components/comment-section";
import { useNotification } from "@/context/notifaction-context";
import { userNotificationSettingsService } from "@/services/user/notifcation/settings/service";
import { userNotificationService } from "@/services/user/notifcation/service";

export default function CommunityDetailPage() {
  const username = getUserFromToken()?.username;
  const params = useParams();
  const navigate = useNavigate();
  const communityId = Number.parseInt(params.id as string);
  const { incrementUnreadCount } = useNotification();

  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userMemberships, setUserMemberships] = useState<CommunityMember[]>([]);
  const [isJoining, setIsJoining] = useState(false);
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>(
    {}
  );

  // Create post states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    mediaFile: null as File | null,
    postType: "text",
  });

  // Edit post states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editPost, setEditPost] = useState({
    postId: 0,
    title: "",
    content: "",
    mediaFile: null as File | null,
    mediaUrl: "",
    postType: "text",
    isPinned: false,
    isActive: true,
  });

  // Delete loading state
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch community details and posts in parallel
        const [communityResponse, postsResponse] = await Promise.all([
          userCommunityService.getById(communityId),
          userCommunityService.getPostsByCommunityId(communityId),
        ]);

        setCommunity(communityResponse.data);
        setPosts(postsResponse.data || []);

        // Fetch user memberships if user exists
        if (username) {
          try {
            const membershipsResponse =
              await userCommunityService.getUserMemberships(username);
            setUserMemberships(membershipsResponse.data || []);
          } catch (membershipError) {
            console.error("Error fetching user memberships:", membershipError);
          }
        }
      } catch (err) {
        setError("Failed to load community details. Please try again later.");
        console.error("Error fetching community data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (communityId) {
      fetchData();
    }
  }, [communityId, username]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isUserMember = () => {
    return userMemberships.some(
      (membership) =>
        membership.communityId === communityId && membership.isActive
    );
  };

  const isPostOwner = (postUsername: string) => {
    return username === postUsername;
  };

  const handleCommunityClick = (communityId: number) => {
    const path = USER_ROUTES.COMMUNITY.DETAIL.replace(
      ":id",
      communityId.toString()
    );
    navigate(path);
  };

  const handleJoinLeave = async () => {
    if (!username) {
      toast("Authentication Required");
      return;
    }

    setIsJoining(true);

    try {
      const isMember = isUserMember();

      if (isMember) {
        // Leave community
        await userCommunityService.leaveCommunity(communityId, username);

        // Update local state
        setUserMemberships((prev) =>
          prev.filter(
            (membership) =>
              !(membership.communityId === communityId && membership.isActive)
          )
        );

        // Update community member count
        setCommunity((prev) =>
          prev
            ? {
                ...prev,
                memberCount: prev.memberCount - 1,
              }
            : null
        );

        // Check notification settings and create notification if enabled
        try {
          const settingsResponse =
            await userNotificationSettingsService.getByUsername(username);

          if (settingsResponse.success && settingsResponse.data) {
            // If community notifications are enabled, create a notification
            if (settingsResponse.data.communityNotifications && community) {
              await userNotificationService.createNotification({
                username: username,
                title: "Left Community",
                message: `You have successfully left the "${community.name}" community.`,
                notificationType: "Info",
                relatedEntityType: "Community",
                relatedEntityId: communityId,
              });

              // Increment the unread count in the header
              incrementUnreadCount();
            }
          } else {
            // If settings not found, navigate to settings page
            toast.info(
              "Notification settings not found. Please set up your notification preferences."
            );
            navigate(USER_ROUTES.NOTIFICATION.SETTINGS);
          }
        } catch (settingsError: any) {
          // Check if it's a "not found" error
          if (
            settingsError.response?.data?.message?.includes("not found") ||
            settingsError.response?.status === 404
          ) {
            toast.info(
              "Notification settings not found. Please set up your notification preferences."
            );
            navigate(USER_ROUTES.NOTIFICATION.SETTINGS);
          }
          // For other errors, just log them but don't interrupt the flow
          console.error("Error checking notification settings:", settingsError);
        }

        navigate(USER_ROUTES.COMMUNITY.MAIN);
        toast("Left Community Successfully");
      } else {
        // Join community
        await userCommunityService.joinCommunity(communityId, username);

        // Update local state
        const newMembership: CommunityMember = {
          communityId,
          username,
          isActive: true,
          joinedAt: new Date().toISOString(),
          role: "Member",
          memberId: 0,
          communityName: "",
          userFullName: "",
        };
        setUserMemberships((prev) => [...prev, newMembership]);

        // Update community member count
        setCommunity((prev) =>
          prev
            ? {
                ...prev,
                memberCount: prev.memberCount + 1,
              }
            : null
        );

        // Check notification settings and create notification if enabled
        try {
          const settingsResponse =
            await userNotificationSettingsService.getByUsername(username);

          if (settingsResponse.success && settingsResponse.data) {
            // If community notifications are enabled, create a notification
            if (settingsResponse.data.communityNotifications && community) {
              await userNotificationService.createNotification({
                username: username,
                title: "Welcome to the Community!",
                message: `You have successfully joined the "${community.name}" community. Start connecting with other members!`,
                notificationType: "Info",
                relatedEntityType: "Community",
                relatedEntityId: communityId,
              });

              // Increment the unread count in the header
              incrementUnreadCount();
            }
          } else {
            // If settings not found, navigate to settings page
            toast.info(
              "Notification settings not found. Please set up your notification preferences."
            );
            navigate(USER_ROUTES.NOTIFICATION.SETTINGS);
          }
        } catch (settingsError: any) {
          // Check if it's a "not found" error
          if (
            settingsError.response?.data?.message?.includes("not found") ||
            settingsError.response?.status === 404
          ) {
            toast.info(
              "Notification settings not found. Please set up your notification preferences."
            );
            navigate(USER_ROUTES.NOTIFICATION.SETTINGS);
          }
          // For other errors, just log them but don't interrupt the flow
          console.error("Error checking notification settings:", settingsError);
        }

        handleCommunityClick(communityId);
        toast("Joined Community Successfully");
      }
    } catch (error) {
      console.error("Error joining/leaving community:", error);
      toast("Failed to process request. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreatePost = async () => {
    if (!username) {
      toast("Authentication Required");
      return;
    }

    try {
      setCreateLoading(true);
      const response = await postService.createPost({
        communityId,
        username,
        title: newPost.title,
        content: newPost.content,
        mediaFile: newPost.mediaFile,
        postType: newPost.postType,
      });

      // Refresh posts
      const postsResponse = await userCommunityService.getPostsByCommunityId(
        communityId
      );
      setPosts(postsResponse.data || []);

      // Update community post count
      setCommunity((prev) =>
        prev
          ? {
              ...prev,
              postCount: prev.postCount + 1,
            }
          : null
      );

      setCreateDialogOpen(false);
      setNewPost({
        title: "",
        content: "",
        mediaFile: null,
        postType: "text",
      });
      toast("Post created successfully!");
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast("Failed to create post");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditPost = async () => {
    try {
      setEditLoading(true);
      await postService.updatePost({
        postId: editPost.postId,
        title: editPost.title,
        content: editPost.content,
        mediaFile: editPost.mediaFile,
        postType: editPost.postType,
        isPinned: editPost.isPinned,
        isActive: editPost.isActive,
      });

      // Refresh posts
      const postsResponse = await userCommunityService.getPostsByCommunityId(
        communityId
      );
      setPosts(postsResponse.data || []);

      setEditDialogOpen(false);
      toast("Post updated successfully!");
    } catch (error: any) {
      console.error("Error updating post:", error);
      toast("Failed to update post");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      setDeleteLoading(postId);
      await postService.deletePost(postId);

      // Remove post from local state
      setPosts((prev) => prev.filter((post) => post.postId !== postId));

      // Update community post count
      setCommunity((prev) =>
        prev
          ? {
              ...prev,
              postCount: prev.postCount - 1,
            }
          : null
      );

      toast("Post deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting post:", error);
      toast("Failed to delete post");
    } finally {
      setDeleteLoading(null);
    }
  };

  const openEditDialog = (post: CommunityPost) => {
    setEditPost({
      postId: post.postId,
      title: post.title,
      content: post.content,
      mediaFile: null,
      mediaUrl: post.mediaUrl || "",
      postType: post.postType,
      isPinned: post.isPinned,
      isActive: post.isActive,
    });
    setEditDialogOpen(true);
  };

  const getPostTypeIcon = (postType: string) => {
    switch (postType.toLowerCase()) {
      case "image":
        return <ImageIcon className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleCommentCountChange = (postId: number, count: number) => {
    setCommentCounts((prev) => ({ ...prev, [postId]: count }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Card className="mb-8">
            <CardHeader>
              <Skeleton className="h-48 w-full rounded-lg mb-4" />
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
          </Card>
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="mb-6">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <MessageSquare className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Unable to Load Community
            </h3>
            <p className="text-gray-600 mb-4">
              {error || "Community not found"}
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => navigate(USER_ROUTES.COMMUNITY.MAIN)}
                variant="outline"
              >
                Go Back
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="bg-green-600 hover:bg-green-700"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          onClick={() => navigate(USER_ROUTES.COMMUNITY.MAIN)}
          variant="ghost"
          className="mb-6 hover:bg-white/50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Communities
        </Button>

        {/* Community Header */}
        <Card className="mb-8 bg-white shadow-lg">
          <CardHeader className="pb-4">
            <div className="relative overflow-hidden rounded-lg mb-6">
              <img
                src={community.communityImage || "/placeholder.svg"}
                alt={community.name}
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-4 right-4">
                {community.isPrivate ? (
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                    <Lock className="h-3 w-3 mr-1" />
                    Private
                  </Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    <Globe className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-2xl text-gray-900">
                      {community.name}
                    </CardTitle>
                    <Badge variant="outline">{community.category}</Badge>
                  </div>
                  <CardDescription className="text-gray-600 text-base leading-relaxed">
                    {community.description}
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{community.memberCount} members</span>
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span>{community.postCount} posts</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>By {community.creatorFullName}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Created {formatDate(community.createdAt)}</span>
                  </div>
                </div>
                <Button
                  onClick={handleJoinLeave}
                  disabled={isJoining || !username}
                  className={`${
                    isUserMember()
                      ? "bg-red-600! hover:bg-red-700!"
                      : "bg-green-600! hover:bg-green-700!"
                  } text-white`}
                >
                  {isJoining
                    ? "Processing..."
                    : isUserMember()
                    ? "Leave Community"
                    : "Join Community"}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Posts Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Community Posts
            </h2>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm">
                {posts.length} {posts.length === 1 ? "post" : "posts"}
              </Badge>
              {isUserMember() && (
                <Dialog
                  open={createDialogOpen}
                  onOpenChange={setCreateDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-green-600! hover:bg-green-700! text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Post</DialogTitle>
                      <DialogDescription>
                        Share something with the community
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={newPost.title}
                          onChange={(e) =>
                            setNewPost({ ...newPost, title: e.target.value })
                          }
                          placeholder="Enter post title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                          id="content"
                          value={newPost.content}
                          onChange={(e) =>
                            setNewPost({ ...newPost, content: e.target.value })
                          }
                          placeholder="What's on your mind?"
                          className="min-h-[100px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postType">Post Type</Label>
                        <Select
                          value={newPost.postType}
                          onValueChange={(value) =>
                            setNewPost({ ...newPost, postType: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mediaFile">Media File (Optional)</Label>
                        <Input
                          id="mediaFile"
                          type="file"
                          accept="image/*,video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setNewPost({ ...newPost, mediaFile: file });
                          }}
                        />
                        {newPost.mediaFile && (
                          <div className="mt-2">
                            {newPost.mediaFile.type.startsWith("image/") ? (
                              <img
                                src={
                                  URL.createObjectURL(newPost.mediaFile) ||
                                  "/placeholder.svg"
                                }
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-lg border"
                              />
                            ) : (
                              <div className="w-32 h-32 bg-gray-100 rounded-lg border flex items-center justify-center">
                                <Video className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCreateDialogOpen(false);
                          setNewPost({
                            title: "",
                            content: "",
                            mediaFile: null,
                            postType: "text",
                          });
                        }}
                        disabled={createLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreatePost}
                        disabled={
                          createLoading || !newPost.title || !newPost.content
                        }
                        className="bg-green-600! hover:bg-green-700! text-white"
                      >
                        {createLoading ? "Creating..." : "Create Post"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {posts.length === 0 ? (
            <Card className="bg-white">
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Posts Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Be the first to start a conversation in this community!
                </p>
                {isUserMember() && (
                  <Button
                    onClick={() => setCreateDialogOpen(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Create First Post
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card
                key={post.postId}
                className="bg-white shadow-lg hover:shadow-xl transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={`/placeholder.svg?height=40&width=40`}
                        />
                        <AvatarFallback className="bg-green-100 text-green-600">
                          {getInitials(post.userFullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-gray-900">
                            {post.userFullName}
                          </p>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-500">
                            @{post.username}
                          </span>
                          {post.isPinned && (
                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                              <Pin className="h-3 w-3 mr-1" />
                              Pinned
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(post.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center text-gray-400">
                        {getPostTypeIcon(post.postType)}
                      </div>
                      {isPostOwner(post.username) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openEditDialog(post)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Post
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeletePost(post.postId)}
                              className="text-red-600"
                              disabled={deleteLoading === post.postId}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {deleteLoading === post.postId
                                ? "Deleting..."
                                : "Delete Post"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  {post.mediaUrl && (
                    <div className="rounded-lg overflow-hidden">
                      <img
                        src={post.mediaUrl || "/placeholder.svg"}
                        alt="Post media"
                        className="w-full max-h-96 object-cover"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center space-x-6">
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors">
                        <Heart className="h-4 w-4" />
                        <span className="text-sm">{post.likesCount}</span>
                      </button>
                    </div>
                    <span className="text-xs text-gray-400">
                      {post.createdAt !== post.updatedAt &&
                        `Edited ${formatDateTime(post.updatedAt)}`}
                    </span>
                  </div>
                </CardContent>

                <div className="border-t pt-4">
                  <CommentSection
                    postId={post.postId}
                    username={username}
                    onCommentCountChange={(count) =>
                      handleCommentCountChange(post.postId, count)
                    }
                  />
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Edit Post Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Post</DialogTitle>
              <DialogDescription>Update your post content</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editTitle">Title</Label>
                <Input
                  id="editTitle"
                  value={editPost.title}
                  onChange={(e) =>
                    setEditPost({ ...editPost, title: e.target.value })
                  }
                  placeholder="Enter post title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editContent">Content</Label>
                <Textarea
                  id="editContent"
                  value={editPost.content}
                  onChange={(e) =>
                    setEditPost({ ...editPost, content: e.target.value })
                  }
                  placeholder="What's on your mind?"
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPostType">Post Type</Label>
                <Select
                  value={editPost.postType}
                  onValueChange={(value) =>
                    setEditPost({ ...editPost, postType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editMediaFile">Media File (Optional)</Label>
                <Input
                  id="editMediaFile"
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setEditPost({ ...editPost, mediaFile: file });
                  }}
                />
                <div className="mt-2">
                  {editPost.mediaFile ? (
                    editPost.mediaFile.type.startsWith("image/") ? (
                      <img
                        src={
                          URL.createObjectURL(editPost.mediaFile) ||
                          "/placeholder.svg"
                        }
                        alt="New Preview"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gray-100 rounded-lg border flex items-center justify-center">
                        <Video className="w-8 h-8 text-gray-400" />
                      </div>
                    )
                  ) : editPost.mediaUrl ? (
                    <img
                      src={editPost.mediaUrl || "/placeholder.svg"}
                      alt="Current Media"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 rounded-lg border flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="editIsPinned"
                  checked={editPost.isPinned}
                  onChange={(e) =>
                    setEditPost({ ...editPost, isPinned: e.target.checked })
                  }
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <Label htmlFor="editIsPinned">Pin this post</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editPost.isActive}
                  onChange={(e) =>
                    setEditPost({ ...editPost, isActive: e.target.checked })
                  }
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <Label htmlFor="editIsActive">Keep post active</Label>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={editLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditPost}
                disabled={editLoading || !editPost.title || !editPost.content}
                className="bg-green-600! hover:bg-green-700! text-white"
              >
                {editLoading ? "Updating..." : "Update Post"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
