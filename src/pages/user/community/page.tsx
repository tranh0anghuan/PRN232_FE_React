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
  Users,
  MessageSquare,
  Lock,
  Globe,
  Calendar,
  User,
  Search,
  Filter,
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
  userCommunityService,
  type Community,
  type CommunityMember,
} from "@/services/user/community/service";
import { getUserFromToken } from "@/utils/token/auth";
import { useNavigate } from "react-router-dom";
import { USER_ROUTES } from "@/routes/user/user";
import { toast } from "sonner";

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [userMemberships, setUserMemberships] = useState<CommunityMember[]>([]);
  const [user, setUser] = useState<any>(null);
  const [joiningCommunities, setJoiningCommunities] = useState<Set<number>>(
    new Set()
  );

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get user info
        const currentUser = getUserFromToken();
        setUser(currentUser);

        // Fetch communities
        const communitiesResponse =
          await userCommunityService.getAllCommunities();
        setCommunities(communitiesResponse.data || []);

        // Fetch user memberships if user exists
        if (currentUser?.username) {
          try {
            const membershipsResponse =
              await userCommunityService.getUserMemberships(
                currentUser.username
              );
            setUserMemberships(membershipsResponse.data || []);
          } catch (membershipError) {
            console.error("Error fetching user memberships:", membershipError);
            // Don't set error state for membership fetch failure
          }
        }
      } catch (err) {
        setError("Failed to load communities. Please try again later.");
        console.error("Error fetching communities:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCommunities = communities.filter((community) => {
    const matchesSearch =
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || community.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(communities.map((c) => c.category)));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isUserMember = (communityId: number) => {
    return userMemberships.some(
      (membership) =>
        membership.communityId === communityId && membership.isActive
    );
  };

  const handleJoinLeave = async (communityId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user?.username) {
      toast("Authentication Required");
      return;
    }

    setJoiningCommunities((prev) => new Set(prev).add(communityId));

    try {
      const isMember = isUserMember(communityId);

      if (isMember) {
        // Leave community
        await userCommunityService.leaveCommunity(communityId, user.username);

        // Update local state
        setUserMemberships((prev) =>
          prev.filter(
            (membership) =>
              !(membership.communityId === communityId && membership.isActive)
          )
        );

        // Update community member count
        setCommunities((prev) =>
          prev.map((community) =>
            community.communityId === communityId
              ? { ...community, memberCount: community.memberCount - 1 }
              : community
          )
        );
        navigate(USER_ROUTES.COMMUNITY.MAIN);
        toast("Left Community");
      } else {
        // Join community
        await userCommunityService.joinCommunity(communityId, user.username);

        // Update local state
        const newMembership: CommunityMember = {
          communityId,
          username: user.username,
          isActive: true,
          joinedAt: new Date().toISOString(),
          role: "Member",
          memberId: 0,
          communityName: "",
          userFullName: "",
        };
        setUserMemberships((prev) => [...prev, newMembership]);

        // Update community member count
        setCommunities((prev) =>
          prev.map((community) =>
            community.communityId === communityId
              ? { ...community, memberCount: community.memberCount + 1 }
              : community
          )
        );
        handleCommunityClick(communityId);

        toast("Joined Community");
      }
    } catch (error) {
      console.error("Error joining/leaving community:", error);
      toast("Error");
    } finally {
      setJoiningCommunities((prev) => {
        const newSet = new Set(prev);
        newSet.delete(communityId);
        return newSet;
      });
    }
  };

  const handleCommunityClick = (communityId: number) => {
    const path = USER_ROUTES.COMMUNITY.DETAIL.replace(
      ":id",
      communityId.toString()
    );
    navigate(path);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <MessageSquare className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Unable to Load Communities
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-green-600 hover:bg-green-700"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header Section */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              🤝 Connect with Your Community
            </Badge>
            <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Join Our{" "}
              <span className="text-green-600">Support Communities</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect with others on the same journey. Share experiences, get
              encouragement, and celebrate milestones together in our supportive
              communities.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search communities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-200 focus:border-green-500 focus:ring-green-500"
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

      {/* Communities Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-white border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <Skeleton className="h-48 w-full rounded-lg mb-4" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
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
          ) : filteredCommunities.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Communities Found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedCategory !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No communities are currently available."}
              </p>
              {(searchTerm || selectedCategory !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCommunities.map((community) => (
                <Card
                  key={community.communityId}
                  className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  onClick={() => handleCommunityClick(community.communityId)}
                >
                  <CardHeader className="pb-4">
                    <div className="relative overflow-hidden rounded-lg mb-4">
                      <img
                        src={community.communityImage || "/placeholder.svg"}
                        alt={community.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
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
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg group-hover:text-green-600 transition-colors">
                          {community.name}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {community.category}
                        </Badge>
                      </div>
                      <CardDescription className="text-gray-600 line-clamp-2">
                        {community.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{community.memberCount} members</span>
                          </div>
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            <span>{community.postCount} posts</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          <span>By {community.creatorFullName}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{formatDate(community.createdAt)}</span>
                        </div>
                      </div>
                      <Button
                        className={`w-full text-white ${
                          isUserMember(community.communityId)
                            ? "bg-red-600! hover:bg-red-700!"
                            : "bg-green-600! hover:bg-green-700!"
                        }`}
                        size="sm"
                        disabled={
                          joiningCommunities.has(community.communityId) ||
                          !user?.username
                        }
                        onClick={(e) =>
                          handleJoinLeave(community.communityId, e)
                        }
                      >
                        {joiningCommunities.has(community.communityId)
                          ? "Processing..."
                          : isUserMember(community.communityId)
                          ? "Leave Community"
                          : "Join Community"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      {!loading && communities.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {communities.length}
                </div>
                <div className="text-sm text-gray-600">Active Communities</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {communities.reduce((sum, c) => sum + c.memberCount, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Members</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {communities.reduce((sum, c) => sum + c.postCount, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Posts</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600">
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
