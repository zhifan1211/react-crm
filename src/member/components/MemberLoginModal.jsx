import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import { API_BASE } from "../../config";
import { showAlert } from "../../utils/alert";
import { useAuth } from "../../context/AuthContext";

function MemberLoginModal({ show, onClose }) {
  const [loginForm, setLoginForm] = useState({ phoneNumber: "", password: "" });
  const navigate = useNavigate();
  const { setMemberLoggedIn } = useAuth();

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value.trim() }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/member/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(loginForm),
      });

      const resData = await res.json();
      if (res.ok && resData.status === 200) {
        showAlert({ title: "登入成功！", icon: "success" });
        setMemberLoggedIn(true); // 關鍵
        onClose();
        navigate("/member");
      } else {
        showAlert({ title: "登入失敗", text: resData.message || "", icon: "error" });
      }
    } catch (err) {
      showAlert({ title: "登入錯誤", text: err.message, icon: "error" });
    }
  };

  return (
    <Modal show={show} onClose={onClose} width={400}>
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
          <div className="form-text text-muted">
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
          <div className="form-text text-muted">
            預設為出生日期8碼，例如：20040506
          </div>
        </div>
        <button type="submit" className="btn btn-brand w-100">登入</button>
        <div className="form-text text-brand link-like text-center mt-3" style={{ cursor: "pointer" }}
          onClick={() => {
            onClose();
            navigate("/member/reset-password");
          }}>
          忘記密碼
        </div>
      </form>
      <div className="mb-3 mt-5">
        <div className="form-text text-muted text-center mb-2">
          30秒不到，即可成為Otter Point會員
        </div>
        <button type="button" onClick={() => {
          onClose();
          navigate("/member/register");
        }} className="btn btn-brand w-100">
          快速註冊
        </button>
      </div>
    </Modal>
  );
}

export default MemberLoginModal;
