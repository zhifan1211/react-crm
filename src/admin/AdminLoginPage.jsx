import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLoginPage() {
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value.trim() }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8081/admin/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(loginForm),
      });

      const resData = await res.json();
      if (res.ok && resData.status === 200) {
        alert("登入成功");
        navigate("/admin"); // 登入成功後導向會員列表
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
          <button type="submit" className="btn btn w-100 mt-3">
            登入
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLoginPage;
