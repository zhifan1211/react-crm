import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/AdminNavbar";

function AdminChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      alert("請填寫所有欄位");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      alert("新密碼與確認密碼不一致");
      return;
    }

    try {
      const res = await fetch("http://localhost:8081/admin/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const resData = await res.json();

      if (res.ok && resData.status === 200) {
        alert("密碼修改成功，請重新登入");
        navigate("/admin/login");
      } else {
        alert("密碼修改失敗：" + resData.message);
      }
    } catch (err) {
      alert("請求失敗：" + err.message);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ padding: "20px", fontFamily: "Arial" }}>
        <h2>修改密碼</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>舊密碼：</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label>新密碼：</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label>確認新密碼：</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">送出修改</button>
        </form>
      </div>
    </div>
  );
}

export default AdminChangePasswordPage;
