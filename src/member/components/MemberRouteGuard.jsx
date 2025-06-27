import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

function MemberRouteGuard({ children }) {
  const { memberLoggedIn, checking } = useAuth();

  if (checking) return <div>檢查登入中...</div>;
  if (!memberLoggedIn) return <Navigate to="/" replace />;

  return children;
}

export default MemberRouteGuard;
