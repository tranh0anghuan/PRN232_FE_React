import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../utils/token/auth";

import type { ReactNode } from "react";
import { AUTH_ROUTES } from "../routes/auth/auth";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  return isLoggedIn() ? children : <Navigate to={AUTH_ROUTES.LOGIN} replace />;
};

export default ProtectedRoute;
