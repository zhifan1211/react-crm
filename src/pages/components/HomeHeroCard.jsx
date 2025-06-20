import { useNavigate } from "react-router-dom";

export default function HomeHeroCard() {
  const navigate = useNavigate();

  return (
    <div className="container my-5">
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
        <div className="row g-0">
          {/* 左側圖片區（暫用灰底，可換成 <img>） */}
          <div className="col-md-5 d-flex align-items-center justify-content-center bg-light" style={{ minHeight: 300 }}>
            {/* 圖片請換掉 src 或放孩子圖檔 */}
            <img src="../otter-wine.webp" alt="OTTER" className="img-fluid" />
            <div style={{ width: "90%", height: "80%", background: "#eee", borderRadius: "2rem" }}></div>
          </div>
          {/* 右側文字+按鈕 */}
          <div className="col-md-7 d-flex align-items-center">
            <div className="p-5">
              <h2 className="fw-bold mb-3 text-brand">OTTER POINT 會員上線啦！</h2>
              <p className="mb-2">只要30秒，加入 OTTER 餐飲會員</p>
              <p className="mb-3">兌換限定好禮，享受專屬優惠，回饋歡樂送</p>
              <p className="mb-3 fw-bold text-notice">暑期限定！6/1-8/31與「蟹堡王」聯名商品，熱烈兌換中</p>
              <button
                className="btn btn-brand px-4 py-2"
                onClick={() => navigate("/member/register")}
              >
                立即註冊
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
