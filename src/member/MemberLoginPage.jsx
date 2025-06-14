import { useState } from "react";
import { useNavigate } from "react-router-dom";

function MemberLoginPage() {
  const [loginForm, setLoginForm] = useState({ phoneNumber: "", password: "" });
  const navigate = useNavigate();

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value.trim() }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8081/member/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(loginForm),
      });

      const resData = await res.json();
      if (res.ok && resData.status === 200) {
        alert("登入成功！");
        navigate("/member");
      } else {
        alert("登入失敗：" + resData.message);
      }
    } catch (err) {
      alert("登入錯誤：" + err.message);
    }
  };

  return (
    <div className="login-page d-flex align-items-center justify-content-center">
      <div className="login-card shadow p-4 rounded bg-white">
        <h2 className="mb-4 text-center brand-title">OTTER POINT</h2>
        <h5 className="mb-4 text-center">會員登入</h5>
        <form onSubmit={handleLoginSubmit}>
          <div className="mb-3">
            <label className="form-label">手機號碼</label>
            <input
              name="phoneNumber"
              className="form-control"
              value={loginForm.phoneNumber}
              onChange={handleLoginChange}
              required
            />
            <div class="form-text text-muted">
              手機號碼10碼，例如：0911222333
            </div>
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
            <div class="form-text text-muted">
              預設為出生日期8碼，例如：20040506
            </div>
          </div>
          <button type="submit" className="btn btn w-100">登入</button>
          <div class="form-text text-brand link-like text-center mt-3" onClick={() => navigate("/member/reset-password")}>
            忘記密碼
          </div>
        </form>
        <div className="mb-3 mt-5">
          <div class="form-text text-muted text-center mb-2">
            30秒不到，即可成為Otter Point會員
          </div>
          <button type="button" onClick={() => navigate("/member/register")} className="btn btn w-100">
            快速註冊
          </button>
        </div>
      </div>
    </div>
  );
}

export default MemberLoginPage;
