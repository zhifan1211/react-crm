import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function MemberNavbar() {
  const navigate = useNavigate();
  const [memberName, setMemberName] = useState("");

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:8081/member/logout", {
        method: "GET",
        credentials: "include",
      });

      const resData = await res.json();
      if (res.ok && resData.status === 200) {
        alert("登出成功");
        navigate("/member/login");
      } else {
        alert("登出失敗：" + resData.message);
      }
    } catch (err) {
      alert("登出錯誤：" + err.message);
    }
  };

  useEffect(() => {
    fetch("http://localhost:8081/member/me", {
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
            點數紀錄
          </Link>
          <Link className="nav-link text-brand mx-3" to="/member/rewards">
            兌換專區
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
