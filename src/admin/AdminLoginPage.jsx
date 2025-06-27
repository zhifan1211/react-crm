import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import { showAlert } from "../utils/alert";
import { useAuth } from "../context/AuthContext";

function AdminLoginPage() {
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [captcha, setCaptcha] = useState("");
  const [captchaUrl, setCaptchaUrl] = useState("");

  const { setAdminLoggedIn } = useAuth();
  const navigate = useNavigate();

  // 頁面一載入就抓一次 captcha
  useEffect(() => {
    refreshCaptcha();
  }, []);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value.trim() }));
  };

  const handleCaptchaChange = (e) => setCaptcha(e.target.value);

  // 重新載入驗證碼（解決 session 問題）
  const refreshCaptcha = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/captcha?t=${Date.now()}`, {
        credentials: "include",
      });
      const blob = await res.blob();
      setCaptchaUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("載入驗證碼失敗", err);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...loginForm,
        captcha,
      };
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data),
      });

      const resData = await res.json();
      if (res.ok && resData.status === 200) {
        showAlert({ title: "登入成功", icon: "success" });
        setAdminLoggedIn(true); // 同步更新 context
        navigate("/admin");
      } else {
        showAlert({ title: "登入失敗", text: resData.message || "", icon: "error" });
        refreshCaptcha();
      }
    } catch (err) {
      showAlert({ title: "登入錯誤", text: err.message, icon: "error" });
      refreshCaptcha();
    }
  };

  return (
    <div className="login-page d-flex align-items-center justify-content-center">
      <div className="login-card shadow p-4 rounded bg-white">
        <h2 className="mb-4 text-center brand-title">OTTER POINT</h2>
        <h5 className="mb-4 text-center">管理後台登入</h5>
        <form onSubmit={handleLoginSubmit}>
          <div className="mb-3">
            <label className="form-label">管理員帳號</label>
            <input
              type="text"
              name="username"
              className="form-control"
              value={loginForm.username}
              onChange={handleLoginChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">密碼</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={loginForm.password}
              onChange={handleLoginChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">驗證碼</label>
            <div className="d-flex align-items-center">
              <input
                type="text"
                name="captcha"
                className="form-control"
                value={captcha}
                onChange={handleCaptchaChange}
                required
                maxLength={4}
                autoComplete="off"
                style={{ flex: 1, marginRight: 10 }}
              />
              {captchaUrl && (
                <img
                  src={captchaUrl}
                  alt="驗證碼"
                  onClick={refreshCaptcha}
                  style={{
                    height: "38px",
                    cursor: "pointer",
                    borderRadius: "4px",
                    border: "1px solid #ced4da",
                  }}
                  title="點擊刷新"
                />
              )}
            </div>
          </div>
          <button type="submit" className="btn btn w-100 mt-3">
            登入
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLoginPage;
