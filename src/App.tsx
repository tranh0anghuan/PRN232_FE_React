import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import HomePage from "./pages/user/home/page";
import ProfilePage from "./pages/user/profile/ProfilePage";
import LoginPage from "./pages/auth/LoginPage";
import AdminPage from "./pages/admin/main/AdminPage";
import { USER_ROUTES } from "./routes/user/user";
import { AUTH_ROUTES } from "./routes/auth/auth";
import { ADMIN_ROUTES } from "./routes/admin/admin";
import NotFoundPage from "./pages/not-found/NotFoundPage";
import UserLayout from "./layouts/user/layout";
import CoachProfilePage from "./pages/user/coach-profile/CoachProfilePage";
import UserSessionsPage from "./pages/user/session/UserSessionsPage";
import CoachSessionsPage from "./pages/user/session/CoachSessionsPage";
import SessionDetailPage from "./pages/user/session/SessionDetailPage";
import RegisterPage from "./pages/auth/RegisterPage";
import { AdminLayout } from "./layouts/admin/layout";
import SmokeStatusPage from "./pages/user/smoke-status/page";
import SmokeStatusDetailPage from "./pages/user/smoke-status/detail/page";
import QuitPlansPage from "./pages/user/quit-plan/page";
import QuitPlanPhasesPage from "./pages/user/quit-plan/phases/page";
import UserProgressTrackingDashboard from "./pages/user/progress-tracking/dashboard/page";
import UserProgressTrackingDailyLog from "./pages/user/progress-tracking/daily-log/page";
import UserProgressTrackingHistory from "./pages/user/progress-tracking/history/page";
import UserProgressTrackingImprovements from "./pages/user/progress-tracking/improvements/page";
import CoachProfileManagePage from "./pages/admin/coach-profile/coach-management";
import BlogPostManagement from "./pages/admin/blog-post/page";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<NotFoundPage />} />
        <Route
          path={USER_ROUTES.HOME}
          element={
            <UserLayout>
              <HomePage />
            </UserLayout>
          }
        />
        <Route
          path={AUTH_ROUTES.LOGIN}
          element={
            <UserLayout>
              <LoginPage />
            </UserLayout>
          }
        />
        <Route
          path={AUTH_ROUTES.REGISTER}
          element={
            <UserLayout>
              <RegisterPage />
            </UserLayout>
          }
        />

        <Route
          path={USER_ROUTES.PROFILE}
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path={USER_ROUTES.SMOKE_STATUS}
          element={
            <UserLayout>
              <ProtectedRoute>
                <SmokeStatusPage />
              </ProtectedRoute>
            </UserLayout>
          }
        />
        <Route
          path={USER_ROUTES.SMOKE_STATUS_DETAIL}
          element={
            <UserLayout>
              <ProtectedRoute>
                <SmokeStatusDetailPage />
              </ProtectedRoute>
            </UserLayout>
          }
        />
        <Route
          path={USER_ROUTES.QUIT_PLANS}
          element={
            <UserLayout>
              <ProtectedRoute>
                <QuitPlansPage />
              </ProtectedRoute>
            </UserLayout>
          }
        />
        <Route
          path={USER_ROUTES.QUIT_PLAN_PHASES}
          element={
            <UserLayout>
              <ProtectedRoute>
                <QuitPlanPhasesPage />
              </ProtectedRoute>
            </UserLayout>
          }
        />
        <Route
          path={USER_ROUTES.PROGRESS_TRACKING.DASHBOARD}
          element={
            <UserLayout>
              <ProtectedRoute>
                <UserProgressTrackingDashboard />
              </ProtectedRoute>
            </UserLayout>
          }
        />
        <Route
          path={USER_ROUTES.PROGRESS_TRACKING.DAILY_LOG}
          element={
            <UserLayout>
              <ProtectedRoute>
                <UserProgressTrackingDailyLog />
              </ProtectedRoute>
            </UserLayout>
          }
        />
        <Route
          path={USER_ROUTES.PROGRESS_TRACKING.HISTORY}
          element={
            <UserLayout>
              <ProtectedRoute>
                <UserProgressTrackingHistory />
              </ProtectedRoute>
            </UserLayout>
          }
        />
        <Route
          path={USER_ROUTES.PROGRESS_TRACKING.IMPROVEMENTS}
          element={
            <UserLayout>
              <ProtectedRoute>
                <UserProgressTrackingImprovements />
              </ProtectedRoute>
            </UserLayout>
          }
        />

        {/* Tung Zone */}

        <Route
          path={USER_ROUTES.COACH_PROFILE}
          element={
            <UserLayout>
              <ProtectedRoute>
                <CoachProfilePage />
              </ProtectedRoute>
            </UserLayout>
          }
        />
        <Route
          path={USER_ROUTES.SESSION_DETAIL}
          element={
            <UserLayout>
              <ProtectedRoute>
                <SessionDetailPage />
              </ProtectedRoute>
            </UserLayout>
          }
        />

        <Route
          path={USER_ROUTES.USER_SESSION}
          element={
            <UserLayout>
              <ProtectedRoute>
                <UserSessionsPage />
              </ProtectedRoute>
            </UserLayout>
          }
        />
        <Route
          path={USER_ROUTES.SESSION_MANAGEMENT}
          element={
            <UserLayout>
              <ProtectedRoute>
                <CoachSessionsPage />
              </ProtectedRoute>
            </UserLayout>
          }
        />

        <Route
          path={ADMIN_ROUTES.COACH_PROFILE.MANAGE}
          element={
            <AdminLayout>
              <AdminRoute>
                <CoachProfileManagePage />
              </AdminRoute>
            </AdminLayout>
          }
        />
        {/*   END Tung Zone */}
        <Route
          path={ADMIN_ROUTES.MAIN}
          element={
            <AdminLayout>
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            </AdminLayout>
          }
        />
        <Route
          path={ADMIN_ROUTES.BLOG_POST.MANAGE}
          element={
            <AdminLayout>
              <AdminRoute>
                <BlogPostManagement />
              </AdminRoute>
            </AdminLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
