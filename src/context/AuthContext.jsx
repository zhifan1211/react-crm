import { createContext, useContext, useEffect, useState } from "react";
import { API_BASE } from "../config";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [memberLoggedIn, setMemberLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const [adminRes, memberRes] = await Promise.all([
          fetch(`${API_BASE}/admin/check-login`, { credentials: "include" }),
          fetch(`${API_BASE}/member/check-login`, { credentials: "include" }),
        ]);

        const adminData = await adminRes.json();
        const memberData = await memberRes.json();

        setAdminLoggedIn(adminData.data === true);
        setMemberLoggedIn(memberData.data === true);
      } catch (err) {
        console.error("檢查登入狀態失敗", err);
      } finally {
        setChecking(false);
      }
    };

    checkLogin();
  }, []);

  const logoutAdmin = async () => {
    await fetch(`${API_BASE}/admin/logout`, { credentials: "include" });
    setAdminLoggedIn(false);
  };

  const logoutMember = async () => {
    await fetch(`${API_BASE}/member/logout`, { credentials: "include" });
    setMemberLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        adminLoggedIn,
        memberLoggedIn,
        setAdminLoggedIn,
        setMemberLoggedIn,
        logoutAdmin,
        logoutMember,
        checking,
      }}
    >
      {checking ? <div>檢查登入中...</div> : children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
