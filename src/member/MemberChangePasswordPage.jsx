import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/MemberNavbar";

function MemberChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 基本前端驗證
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      alert("請填寫所有欄位！");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      alert("新密碼與再次輸入不一致");
      return;
    }

    try {
      const res = await fetch("http://localhost:8081/member/edit/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          oldPassword,
          newPassword
        }),
      });
      const resData = await res.json();
      if (res.ok && resData.status === 200) {
        alert("密碼修改成功");
        navigate("/member"); // 或者導回登入頁面
      } else {
        alert("密碼修改失敗：" + (resData.message || "未知錯誤"));
      }
    } catch (err) {
      alert("錯誤：" + err.message);
    }
  };

  return (
    <div>
      <Navbar />
      <div>
        <h2>修改密碼</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>舊密碼：</label>
            <input
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <div>
            <label>新密碼：</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <div>
            <label>再次輸入新密碼：</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={e => setConfirmNewPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <button type="submit" style={{ marginTop: "10px" }}>
            送出
          </button>
          <button
            type="button"
            style={{ marginLeft: "10px", marginTop: "10px" }}
            onClick={() => navigate("/member")}
          >
            返回會員中心
          </button>
        </form>
      </div>
    </div>
  );
}

export default MemberChangePasswordPage;
