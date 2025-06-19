import { useEffect, useState } from "react";
import Navbar from "./components/MemberNavbar";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import { showAlert, showConfirm } from "../utils/alert";

function MemberItemListPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [memberInfo, setMemberInfo] = useState(null);

  // 取得啟用中商品
  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/member/item-list?active=true`, {
        credentials: "include", // 如果需要帶cookie
      });
      const resData = await res.json();
      if (res.ok && resData.status === 200) {
        setItems(resData.data || []);
      } else {
        showAlert({ title: "兌換品載入失敗", text: resData.message || "未知錯誤", icon: "error" });
      }
    } catch (err) {
      showAlert({ title: "錯誤", text: err.message, icon: "error" });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // 圖片網址處理
  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("//")) return url;
    if (url.startsWith("/images/")) return `${API_BASE}${url}`;
    return `${API_BASE}/images/${url}`;
  };

  useEffect(() => {
    const fetchMemberInfo = async () => {
      try {
        const res = await fetch(`${API_BASE}/member/info`, { credentials: "include" });
        const data = await res.json();
        if (res.ok && data.status === 200) {
          setMemberInfo(data.data);
        }
      } catch (err) {
        // 可以略過錯誤提示，讓會員照常看商品
      }
    };
    fetchMemberInfo();
  }, []);

  return (
    <div>
      <Navbar/>
      <div className="container py-4">
        <h5 className="mb-3">兌換品一覽</h5>
        {memberInfo && memberInfo.level === "PASSER" && (
          <div className="alert alert-warning d-flex align-items-center mb-4" style={{ borderRadius: "10px" }}>
            <button className="btn btn-warn-solid me-4" onClick={() => navigate("/member/edit")}>
              立即填寫
            </button>
            <div>
              <strong>您目前尚未成為正式會員</strong><br />填完會員資料後，即可至門市使用點數兌換
            </div>
          </div>
        )}
        {loading ? (
          <p>載入中...</p>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
            {items.length === 0 ? (
              <div className="col text-center text-secondary">暫無商品</div>
            ) : (
              items.map((item) => (
                <div className="col" key={item.itemId}>
                  <div className="card h-100 shadow-sm border-0">
                    {/* 圖片 */}
                    <div
                      style={{
                        width: "100%",
                        aspectRatio: "3 / 2",
                        background: "#f6f6f6",
                        position: "relative",
                        overflow: "hidden",
                        borderRadius: "8px 8px 0 0",
                      }}
                    >
                      {item.imageURL && (
                        <img
                          src={getImageUrl(item.imageURL)}
                          alt={item.itemName}
                          style={{
                            position: "absolute",
                            left: 0, top: 0, width: "100%", height: "100%",
                            objectFit: "cover"
                          }}
                          onError={e => (e.target.style.display = "none")}
                        />
                      )}
                    </div>
                    <div className="card-body d-flex flex-column">
                      {/* 點數 */}
                      <div className="mb-1">
                        <span className="text-brand fs-4 fw-semibold">{item.points}</span>
                        <span className="text-secondary ms-1" style={{ fontSize: "15px" }}>點</span>
                      </div>
                      {/* 產品名稱 */}
                      <h6 className="card-title mb-1" style={{ fontWeight: 500 }}>{item.itemName}</h6>
                      {/* 產品描述 */}
                      <div className="card-text mb-4 text-secondary" style={{ fontSize: "13px" }}>
                        {item.description || <span className="text-muted">（無描述）</span>}
                      </div>
                      {/* 如果之後要加"立即兌換"可以放這裡 */}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MemberItemListPage;
