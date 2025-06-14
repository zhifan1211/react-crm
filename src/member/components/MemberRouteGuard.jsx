import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// 這是一個高階元件：包住所有需要登入的 member 頁面
function MemberRouteGuard({ children }) {
  const [checking, setChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch("http://localhost:8081/member/check-login", {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.status === 200 && data.data === true) {
          setIsLoggedIn(true);
        } else {
          navigate("/member/login"); // 沒登入就導去登入頁
        }
      } catch (err) {
        console.error("檢查登入錯誤", err);
        navigate("/member/login");
      } finally {
        setChecking(false);
      }
    };

    checkLogin();
  }, []);

  if (checking) return <div>檢查登入中...</div>;
  return isLoggedIn ? children : null;
}

export default MemberRouteGuard;