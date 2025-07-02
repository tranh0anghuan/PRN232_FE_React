import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ADMIN_ROUTES } from "@/routes/admin/admin";
import { Home, Search, ArrowLeft, Heart, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* 404 Illustration */}
        <div className="relative">
          <div className="text-8xl md:text-9xl font-bold text-green-200 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-green-600 rounded-full p-4">
              <Heart className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            We couldn't find the page you're looking for. Don't worry, your
            journey to a smoke-free life continues!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
            <Link className="text-black!" to="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            <Link className="text-black!" to={ADMIN_ROUTES.MAIN}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Admin Dashboard
            </Link>
          </Button>
        </div>

        {/* Help Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Looking for Support?
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Access our resources and community support to help with your
                quit journey.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link className="text-black!" to="/support">
                  Get Support
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="bg-red-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Need Immediate Help?
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Our crisis support line is available 24/7 for urgent assistance.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link className="text-black!" to="/crisis-support">
                  Crisis Support
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Popular Links */}
        <div className="pt-8 border-t border-green-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Popular Pages
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/programs"
              className="text-green-600! hover:text-green-700 hover:underline text-sm "
            >
              Quit Programs
            </Link>
            <Link
              to="/community"
              className="text-green-600! hover:text-green-700 hover:underline text-sm "
            >
              Community
            </Link>
            <Link
              to="/resources"
              className="text-green-600! hover:text-green-700 hover:underline text-sm "
            >
              Resources
            </Link>
            <Link
              to="/success-stories"
              className="text-green-600! hover:text-green-700 hover:underline text-sm "
            >
              Success Stories
            </Link>
            <Link
              to="/contact"
              className="text-green-600! hover:text-green-700 hover:underline text-sm "
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-green-100 rounded-full p-2">
              <Heart className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-gray-700 font-medium">
            "Every page you visit is a step forward in your journey. Keep
            going!"
          </p>
          <p className="text-sm text-gray-500 mt-2">- SmokeFree Support Team</p>
        </div>
      </div>
    </div>
  );
}
