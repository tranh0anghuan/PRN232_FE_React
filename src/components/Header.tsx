import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { AUTH_ROUTES } from "@/routes/auth/auth";
import { USER_ROUTES } from "@/routes/user/user";
import { logout } from "@/services/auth/auth";
import { getUserFromToken, isLoggedIn } from "@/utils/token/auth";
import {
  Heart,
  User,
  LogOut,
  Sparkles,
  Settings,
  UserCircle,
  ChevronDown,
  Cigarette,
  NotebookPen,
  ChartNoAxesCombined,
} from "lucide-react";
import { Link } from "react-router-dom";

export function Header() {
  const userLoggedIn = isLoggedIn();
  const currentUser = getUserFromToken();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="relative bg-gradient-to-r from-white via-green-50/30 to-blue-50/30 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.05)_1px,transparent_0)] [background-size:20px_20px]"></div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 group">
            <div className="relative">
              <Heart className="h-8 w-8 text-green-500 fill-current transition-all duration-300 group-hover:scale-110 group-hover:text-green-600 drop-shadow-sm" />
              <div className="absolute -inset-1 bg-green-500/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-green-700 to-blue-700 bg-clip-text text-transparent">
              QuitWell
            </span>
            <Sparkles className="h-4 w-4 text-green-400 opacity-60 animate-pulse" />
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-600! hover:text-blue-600 font-medium transition-colors duration-200 relative group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link
              to="#"
              className="text-gray-600! hover:text-blue-600 font-medium transition-colors duration-200 relative group"
            >
              Programs
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link
              to="#"
              className="text-gray-600! hover:text-blue-600 font-medium transition-colors duration-200 relative group"
            >
              Resources
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link
              to="#"
              className="text-gray-600! hover:text-blue-600 font-medium transition-colors duration-200 relative group"
            >
              Community
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            {currentUser && (
              <>
                <Link
                  to={USER_ROUTES.COACH_PROFILE}
                  className="text-gray-600! hover:text-blue-600 font-medium transition-colors duration-200 relative group"
                >
                  Coach
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
                </Link>
                <Link
                  to={USER_ROUTES.USER_SESSION}
                  className="text-gray-600! hover:text-blue-600 font-medium transition-colors duration-200 relative group"
                >
                  Sessions
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
                </Link>
              </>
            )}
            <Link
              to="#"
              className="text-gray-600! hover:text-blue-600 font-medium transition-colors duration-200 relative group"
            >
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-3">
            {userLoggedIn ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 group"
                    >
                      <User className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                      Profile
                      <ChevronDown className="h-3 w-3 ml-1 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-lg"
                  >
                    <DropdownMenuLabel className="text-gray-700">
                      My Account
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        to="/dashboard"
                        className="flex items-center cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                      >
                        <UserCircle className="h-4 w-4 mr-2" />
                        View Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to={USER_ROUTES.SMOKE_STATUS}
                        className="flex items-center cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                      >
                        <Cigarette className="h-4 w-4 mr-2" />
                        Smoke Status
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to={USER_ROUTES.QUIT_PLANS}
                        className="flex items-center cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                      >
                        <NotebookPen className="h-4 w-4 mr-2" />
                        Quit Plans
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to={USER_ROUTES.PROGRESS_TRACKING.DASHBOARD}
                        className="flex items-center cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                      >
                        <ChartNoAxesCombined  className="h-4 w-4 mr-2" />
                        Progress Tracking
                      </Link>
                    </DropdownMenuItem>
                   
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="relative text-red-600 border-red-200 hover:border-red-300 font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:shadow-md group overflow-hidden bg-transparent"
                >
                  <LogOut className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                  Sign Out
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </>
            ) : (
              <>
                <Link to={AUTH_ROUTES.REGISTER}>
                  <Button
                    variant="ghost"
                    className="relative text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 group"
                  >
                    Sign Up
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Button>
                </Link>
                <Link to={AUTH_ROUTES.LOGIN}>
                  <Button
                    variant="outline"
                    className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700 font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 group overflow-hidden"
                  >
                    <span className="relative z-10">Sign In</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-700 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
