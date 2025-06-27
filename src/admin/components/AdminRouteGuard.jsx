import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

function AdminRouteGuard({ children }) {
  const { adminLoggedIn, checking } = useAuth();

  if (checking) return <div>檢查登入中...</div>;
  if (!adminLoggedIn) return <Navigate to="/admin/login" replace />;

  return children;
}

export default AdminRouteGuard;
