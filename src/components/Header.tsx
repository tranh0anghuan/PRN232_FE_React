import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-gray-900">QuitWell</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link
              to="#"
              className="text-gray-700 hover:text-green-600 font-medium"
            >
              Home
            </Link>
            <Link
              to="#"
              className="text-gray-700 hover:text-green-600 font-medium"
            >
              Programs
            </Link>
            <Link
              to="#"
              className="text-gray-700 hover:text-green-600 font-medium"
            >
              Resources
            </Link>
            <Link
              to="#"
              className="text-gray-700 hover:text-green-600 font-medium"
            >
              Community
            </Link>
            <Link
              to="#"
              className="text-gray-700 hover:text-green-600 font-medium"
            >
              About
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              className="bg-white text-green-600 border-green-600 hover:bg-green-50"
            >
              Sign In
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
