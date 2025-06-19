import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_BASE } from "../../config";
import { showAlert, showConfirm } from "../../utils/alert";

function MemberNavbar() {
  const navigate = useNavigate();
  const [memberName, setMemberName] = useState("");

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_BASE}/member/logout`, {
        method: "GET",
        credentials: "include",
      });

      const resData = await res.json();
      if (res.ok && resData.status === 200) {
        showAlert({ title: "登出成功", icon: "success" });
        navigate("/member/login");
      } else {
        showAlert({ title: "登出失敗", text: resData.message || "", icon: "error" });
      }
    } catch (err) {
      showAlert({ title: "登出錯誤", text: err.message, icon: "error" });
    }
  };

  useEffect(() => {
    fetch(`${API_BASE}/member/me`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.status === 200) {
          setMemberName(resData.data.firstName);
        }
      })
      .catch((err) => console.error("會員資訊讀取失敗", err));
  }, []);

  return (
    <nav className="navbar navbar-expand bg-white sticky-top shadow-sm py-3">
      <div className="container-fluid align-items-center">
        {/* 左側 Logo*/}
        <Link className="brand-title text-brand ms-5 fs-4" to="/member">
          OTTER POINT
        </Link>

        {/* 中間導覽列 */}
        <div className="d-flex flex-grow-1 justify-content-center">
          <Link className="nav-link text-brand mx-3" to="/member/">
            會員卡
          </Link>
          <Link className="nav-link text-brand mx-3" to="/member/point">
            點數明細
          </Link>
          <Link className="nav-link text-brand mx-3" to="/member/item-list">
            兌換品一覽
          </Link>
        </div>

        {/* 右側登出與修改按鈕 */}
        <div className="d-flex align-items-center me-5">
          <span className="me-3 text-muted">{memberName} 你好！</span>
          <button
            className="btn btn-light me-3"
            onClick={() => navigate("/member/edit")}
          >
            修改資料
          </button>
          <button className="btn btn-light" onClick={handleLogout}>
            登出
          </button>
        </div>
      </div>
    </nav>
  );
}

export default MemberNavbar;
