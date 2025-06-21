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
import CoachProfileForm from "./pages/user/coach-profile/CoachProfileForm";
import UserSessions from "./pages/user/session/UserSessions";
import SessionManagement from "./pages/user/session/SessionManagement";
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
        <Route path={AUTH_ROUTES.LOGIN} element={<LoginPage />} />

        <Route
          path={USER_ROUTES.PROFILE}
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
         <Route
          path={USER_ROUTES.COACH_PROFILE}
          element={
            <ProtectedRoute>
              <CoachProfileForm />
            </ProtectedRoute>
          }
        />
        <Route
          path={USER_ROUTES.USER_SESSIONS}
          element={
            <ProtectedRoute>
              <UserSessions />
            </ProtectedRoute>
          }
        />
        <Route
          path={USER_ROUTES.SESSION_MANAGEMENT}
          element={
            <ProtectedRoute>
              <SessionManagement />
            </ProtectedRoute>
          }
        />

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
