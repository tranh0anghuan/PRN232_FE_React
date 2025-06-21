import { Navigate } from "react-router-dom";
import { isAdmin } from "../utils/token/auth";

import type { ReactNode } from "react";
import { USER_ROUTES } from "../routes/user/user";

const AdminRoute = ({ children }: { children: ReactNode }) => {
  return isAdmin() ? children : <Navigate to={USER_ROUTES.HOME} replace />;
};

export default AdminRoute;
