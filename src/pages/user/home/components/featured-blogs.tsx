import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Eye } from "lucide-react";
import type { FeaturedBlog } from "@/services/user/home/service";
import { USER_ROUTES } from "@/routes/user/user";
import { useNavigate } from "react-router-dom";

interface FeaturedBlogsProps {
  blogs: FeaturedBlog[];
}

export function FeaturedBlogs({ blogs }: FeaturedBlogsProps) {
  const navigate = useNavigate();
  if (blogs.length === 0) return null;
  const handleOnClick = (id: number) => {
    const path = USER_ROUTES.BLOG_POST.replace(":id", id.toString());
    navigate(path);
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Featured Articles
          </h2>
          <p className="text-xl text-gray-600">
            Expert insights and tips to support your quit journey
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.slice(0, 3).map((blog) => (
            <Card
              onClick={() => handleOnClick(blog.blogId)}
              key={blog.blogId}
              className="border-0 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 rounded-t-lg flex items-center justify-center">
                {blog.featuredImage ? (
                  <img
                    src={"/Smoking-Cessation.jpg"}
                    alt={blog.title}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-2" />
                    <span>Featured Image</span>
                  </div>
                )}
              </div>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    {blog.category}
                  </Badge>
                  <div className="flex items-center text-sm text-gray-500">
                    <Eye className="h-4 w-4 mr-1" />
                    {blog.viewCount}
                  </div>
                </div>
                <CardTitle className="text-xl line-clamp-2">
                  {blog.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 line-clamp-3 mb-4">
                  {blog.summary}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {blog.authorUsername}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(blog.publishedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {blog.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
