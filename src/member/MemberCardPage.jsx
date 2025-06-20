import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/MemberNavbar";
import { API_BASE } from "../config";
import { QRCodeSVG } from "qrcode.react";

function MemberCardPage() {
  const [info, setInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/member/info`, { credentials: "include" })
      .then(res => res.json())
      .then(resData => {
        if (resData.status === 200) setInfo(resData.data);
      });
  }, []);

  // 根據等級選顏色
  const cardColor = info?.level === "FORMAL"
    ? "#1F5673" // 品牌藍
    : "#505050";   // passer 灰

  const genderLabel =
    info?.gender === "MALE" ? "先生"
    : info?.gender === "FEMALE" ? "女士"
    : "";

  return (
    <div>
      <Navbar />
      <div className="container px-0 py-4 d-flex flex-column align-items-center">
        <div
          className="shadow d-flex flex-column align-items-start"
          style={{
            width: 360,
            height: 480,
            borderRadius: "1.5rem",
            padding: "2rem 1.5rem",
            margin: "2rem 0",
            background: cardColor,
            color: "white",
            position: "relative",
            boxSizing: "border-box"
          }}
        >
          {!info ? (
            <div className="text-center text-light w-100">載入中...</div>
          ) : (
            <>
              <div style={{ fontSize: 15, opacity: 0.85, marginBottom: 12 }}>
                會員ID：{info.memberId}
              </div>
              <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>
                {info.lastName}{info.firstName} {genderLabel}
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>
                {info.totalPoints ?? 0} <span style={{ fontSize: 16, fontWeight: 400 }}>點</span>
              </div>
              <div style={{ fontSize: 15, opacity: 0.8, marginBottom: 18 }}>
                等級：
                {info.level === "FORMAL" ? (
                  "正式會員"
                ) : (
                  <>
                      訪客會員
                    <button
                      type="button"
                      className="btn btn-upgrade btn-sm ms-2"
                      onClick={() => navigate("/member/edit")}
                    >
                      立即升級
                    </button>
                  </>
                )}
              </div>
              {/* 讓QRcode永遠貼齊下方 */}
              <div style={{ flex: 1 }}></div>
              <div className="w-100 d-flex justify-content-center mb-3">
                <QRCodeSVG value={info.memberId || ""} bgColor="transparent" fgColor="#fff"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MemberCardPage;
