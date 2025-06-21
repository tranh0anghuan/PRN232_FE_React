import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import HomePage from "./pages/user/home/HomePage";
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

        {/*   END Tung Zone */}
        <Route
          path={ADMIN_ROUTES.MAIN}
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
