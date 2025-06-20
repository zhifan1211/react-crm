import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MemberLoginModal from "../../member/components/MemberLoginModal";

function HomeNavbar() {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <nav className="navbar navbar-expand bg-white sticky-top shadow-sm py-3">
        <div className="container-fluid align-items-center">
          {/* 左側 Logo */}
          <Link className="brand-title text-brand ms-5 fs-4" to="/">
            OTTER RESTAURANT
          </Link>
          {/* 中間導覽列 */}
          <div className="d-flex flex-grow-1 justify-content-center">
            <Link className="nav-link text-brand mx-3" to="/">
              最新消息
            </Link>
            <Link className="nav-link text-brand mx-3">
              品牌理念
            </Link>
            <Link className="nav-link text-brand mx-3">
              分店一覽
            </Link>
            <Link className="nav-link text-brand mx-3">
              菜單介紹
            </Link>
          </div>
          {/* 右側登入/註冊 */}
          <div className="d-flex align-items-center me-5">
            <button
              className="btn btn-brand me-3"
              onClick={() => setShowLogin(true)}
            >
              會員登入
            </button>
            <button
              className="btn btn-brand"
              onClick={() => navigate("/member/register")}
            >
              註冊會員
            </button>
          </div>
        </div>
      </nav>
      {/* 登入 Modal */}
      <MemberLoginModal show={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}

export default HomeNavbar;
