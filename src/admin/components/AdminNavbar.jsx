import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminChangePasswordModal from "./AdminChangePasswordModal";

function AdminNavbar() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("");
  const [unit, setUnit] = useState("");
  const [showPwdModal, setShowPwdModal] = useState(false); // 控制 Modal

  // 處理登出按鈕點擊事件
  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:8081/admin/logout", {
        method: "GET",
        credentials: "include",
      });

      const resData = await res.json();
      if (res.ok && resData.status === 200) {
        alert("登出成功");
        navigate("/admin/login");
      } else {
        alert("登出失敗：" + resData.message);
      }
    } catch (err) {
      alert("登出錯誤：" + err.message);
    }
  };

  useEffect(() => {
    fetch("http://localhost:8081/admin/me", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.status === 200) {
          setAdminName(resData.data.adminName);
          setUnit(resData.data.unit); // 取得部門
        }
      })
      .catch((err) => console.error("管理者資訊讀取失敗", err));
  }, []);

  // 密碼改完要登出
  const handleClosePwdModal = (forceLogout = false) => {
    setShowPwdModal(false);
    if (forceLogout) {
      setTimeout(() => handleLogout(), 500); // 密碼改完自動登出
    }
  };

  return (
    <nav className="navbar navbar-expand bg-white sticky-top shadow-sm py-3">
      <div className="container-fluid align-items-center">
        {/* 左側 Logo*/}
        <Link className="brand-title text-brand ms-5 fs-4" to="/admin">
          OTTER POINT
        </Link>

        {/* 中間導覽列 */}
        <div className="d-flex flex-grow-1 justify-content-center">
          <Link className="nav-link text-brand mx-3" to="/admin/member">
            會員列表
          </Link>
          <Link className="nav-link text-brand mx-3" to="/admin/point-types">
            點數類型列表
          </Link>
          <Link className="nav-link text-brand mx-3" to="/admin/point-list">
            點數紀錄列表
          </Link>
        </div>

        {/* 右側登出與權限按鈕 */}
        <div className="d-flex align-items-center me-5">
          <span className="me-3 text-muted">{adminName} 你好！</span>
          {unit === "資訊部" && (
            <button
              className="btn btn-light me-3"
              onClick={() => navigate("/admin/manage-admins")}
            >
              管理後台
            </button>
          )}
          <button
            className="btn btn-light me-3"
            onClick={() => setShowPwdModal(true)}
          >
            修改密碼
          </button>
          <button className="btn btn-light" onClick={handleLogout}>
            登出
          </button>
        </div>
      </div>
      {/* Modal元件掛在Navbar最外層 */}
      <AdminChangePasswordModal show={showPwdModal} onClose={handleClosePwdModal} />
    </nav>
  );
}

export default AdminNavbar;