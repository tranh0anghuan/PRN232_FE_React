"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, Eye, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  blogPostService,
  type BlogPost,
} from "@/services/admin/blog-post/service";
import { USER_ROUTES } from "@/routes/user/user";

export default function BlogPostDetail() {
  const { id } = useParams<{ id: string }>();
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogPost = async () => {
      if (!id) {
        setError("Blog post ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await blogPostService.getById(Number.parseInt(id));
        setBlogPost(data);
      } catch (err) {
        setError("Failed to load blog post. Please try again later.");
        console.error("Error fetching blog post:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTags = (tags: string) => {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!blogPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="text-gray-400 text-6xl mb-4">📄</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Blog post not found
            </h2>
            <p className="text-gray-600 mb-4">
              The blog post you're looking for doesn't exist or has been
              removed.
            </p>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto p-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Articles
          </Button>

          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {blogPost.category}
            </Badge>
            <span>•</span>
            <span>Smoking Cessation Support</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
            {blogPost.title}
          </h1>

          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            {blogPost.summary}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>By {blogPost.authorUsername}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Published {formatDate(blogPost.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{blogPost.viewCount} views</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>5 min read</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 py-8">
        <Card className="overflow-hidden shadow-lg">
          {/* Featured Image */}
          {!blogPost.featuredImage ? (
            <div className="aspect-video bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
              <div className="text-white text-center p-8">
                <div className="text-6xl mb-4">🚭</div>
                <h2 className="text-2xl font-semibold">
                  Your Journey to Freedom Starts Here
                </h2>
                <p className="text-green-100 mt-2">
                  Every step counts towards a healthier you
                </p>
              </div>
            </div>
          ) : (
            <div className="text-white text-center p-8">
              <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
                <img
                  src={"/Smoking-Cessation.jpg"}
                  alt={blogPost.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          <CardContent className="p-8">
            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {blogPost.content}
              </div>
            </div>

            <Separator className="my-8" />

            {/* Tags */}
            {blogPost.tags && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Related Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {formatTags(blogPost.tags).map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Support Section */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <h3 className="text-xl font-semibold text-green-800 flex items-center gap-2">
                  <span className="text-2xl">💪</span>
                  Need Support on Your Journey?
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-green-700 mb-4">
                  Quitting smoking is challenging, but you don't have to do it
                  alone. Our support community is here to help you every step of
                  the way.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => navigate(USER_ROUTES.COMMUNITY.MAIN)}
                    className="bg-green-600! hover:bg-green-700 text-white"
                  >
                    Join Support Group
                  </Button>
                  <Button
                    onClick={() => navigate(USER_ROUTES.QUIT_PLANS)}
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
                  >
                    Get Personalized Plan
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Article Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500 space-y-1">
                <p>Article ID: {blogPost.blogId}</p>
                <p>Last updated: {formatDate(blogPost.updatedAt)}</p>
                <p>Created: {formatDate(blogPost.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
