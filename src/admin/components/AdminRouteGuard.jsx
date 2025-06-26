import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../../config";

// 這是一個高階元件：包住所有需要登入的 admin 頁面
function AdminRouteGuard({ children }) {
  const [checking, setChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/check-login`, {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.status === 200 && data.data === true) {
          setIsLoggedIn(true);
        } else {
          navigate("/admin/login"); // 沒登入就導去登入頁
        }
      } catch (err) {
        console.error("檢查登入錯誤", err);
        navigate("/admin/login");
      } finally {
        setChecking(false);
      }
    };

    checkLogin();
  }, [navigate]);

  if (checking) return <div>檢查登入中...</div>;
  return isLoggedIn ? children : null;
}

export default AdminRouteGuard;