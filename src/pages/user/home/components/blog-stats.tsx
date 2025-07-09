import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BlogStats } from "@/services/user/home/service";
import { BookOpen, Eye, Calendar, BarChart3 } from 'lucide-react';

interface BlogStatsProps {
  stats: BlogStats;
}

export function BlogStatsSection({ stats }: BlogStatsProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Knowledge Hub Statistics
          </h2>
          <p className="text-xl text-gray-600">
            Discover our growing library of helpful resources
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-0 shadow-lg text-center">
            <CardContent className="p-6">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stats.totalBlogs}
              </div>
              <p className="text-gray-600">Total Articles</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg text-center">
            <CardContent className="p-6">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stats.totalViews.toLocaleString()}
              </div>
              <p className="text-gray-600">Total Views</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg text-center">
            <CardContent className="p-6">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stats.blogsThisMonth}
              </div>
              <p className="text-gray-600">This Month</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg text-center">
            <CardContent className="p-6">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stats.categoryStats.length}
              </div>
              <p className="text-gray-600">Categories</p>
            </CardContent>
          </Card>
        </div>

        {stats.categoryStats.length > 0 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-center">Popular Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.categoryStats.map((category, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium text-gray-900 capitalize">
                      {category.category}
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {category.count} articles
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
