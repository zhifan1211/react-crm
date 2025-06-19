import { useEffect, useMemo, useState } from "react";
import AdminNavbar from "./components/AdminNavbar";
import AdminItemManageModal from "./components/AdminItemManageModal";
import StatusFilter from "./components/StatusFilter";
import { API_BASE } from "../config";
import { showAlert, showConfirm } from "../utils/alert";

function AdminItemListPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showManageModal, setShowManageModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingItem, setEditingItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ACTIVE");

  // 載入商品
  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/item-list`, {
        method: "GET",
        credentials: "include",
      });
      const resData = await res.json();
      if (res.ok && resData.status === 200) {
        setItems(resData.data);
      } else {
        showAlert({ title: "載入商品失敗", text: resData.message || "", icon: "error" });
      }
    } catch (err) {
      showAlert({ title: "錯誤", text: err.message, icon: "error" });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // 狀態過濾
  const filteredItems = useMemo(() => {
    if (filterStatus === "ALL") return items;
    return items.filter(i => filterStatus === "ACTIVE" ? i.active : !i.active);
  }, [items, filterStatus]);

  // 新增商品
  const handleAdd = () => {
    setModalMode("add");
    setEditingItem(null);
    setShowManageModal(true);
  };

  // 編輯商品
  const handleEdit = (item) => {
    setModalMode("edit");
    setEditingItem(item);
    setShowManageModal(true);
  };

  // 刪除商品
  const handleDelete = async (itemId) => {
    const result = await showConfirm({
      title: "確定要刪除此商品？",
      text: "此動作無法復原",
      confirmText: "確定刪除",
      cancelText: "取消",
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API_BASE}/admin/item-list/${itemId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const resData = await res.json();
      if (res.ok && resData.status === 200) {
        showAlert({ title: "刪除成功！", icon: "success" });
        fetchItems();
      } else {
        showAlert({ title: "刪除失敗", text: resData.message || "", icon: "error" });
      }
    } catch (err) {
      showAlert({ title: "錯誤", text: err.message, icon: "error" });
    }
  };

  // modal 關閉時的 callback
  const handleModalClose = (needRefresh) => {
    setShowManageModal(false);
    setEditingItem(null);
    if (needRefresh) fetchItems();
  };

  // 圖片網址處理
  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("//")) return url;
    if (url.startsWith("/images/")) return `${API_BASE}${url}`;
    return `${API_BASE}/images/${url}`;
  };

  return (
    <div>
      <AdminNavbar />
      <div className="container py-4">
        <h5 className="mb-2">兌換品管理列表</h5>
        {/* 新增按鈕 */}
        <div className="mt-3 mb-3">
          <button className="btn btn-brand" onClick={handleAdd}>
            新增兌換品
          </button>
        </div>
        {/* 篩選器 */}
        <div className="mb-3 mt-4 d-flex flex-wrap gap-2 align-items-center">
          <StatusFilter filterStatus={filterStatus} setFilterStatus={setFilterStatus} />
        </div>
        {loading ? (
          <p>載入中...</p>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
            {filteredItems.length === 0 ? (
              <div className="col text-center text-secondary">尚無商品</div>
            ) : (
              filteredItems.map((item) => (
                <div className="col" key={item.itemId}>
                  <div className="card h-100 shadow-sm position-relative border-0">
                    {/* 3:2 圖片區塊（以 div 寬高比+img鋪滿法） */}
                    <div
                      style={{
                        width: "100%",
                        aspectRatio: "3 / 2",
                        background: "#f6f6f6",
                        position: "relative",
                        overflow: "hidden",
                        borderRadius: "8px 8px 0 0"
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

                      {/* 狀態標籤（右上角浮動，色塊小巧明顯） */}
                      <span
                        className={`badge position-absolute top-0 end-0 mt-2 me-2 
                          ${item.active ? "bg-enable" : "bg-disable"}`}
                        style={{ fontSize: "0.85rem", zIndex: 2 }}
                      >
                        {item.active ? "啟用中" : "已停用"}
                      </span>
                    </div>
                    <div className="card-body d-flex flex-column">
                      {/* 點數 */}
                      <div className="mb-1">
                        <span className="text-brand fs-4 fw-semibold">{item.points}</span>
                        <span className="text-secondary ms-1"  style={{ fontSize: "15px" }}>點</span>
                      </div>
                      {/* 產品名稱 */}
                      <h6 className="card-title mb-1" style={{ fontWeight: 500 }}>{item.itemName}</h6>
                      {/* 產品描述 */}
                      <div className="card-text mb-4 text-secondary" style={{ fontSize: "13px" }}>
                        {item.description || <span className="text-muted">（無描述）</span>}
                      </div>
                      {/* 按鈕 */}
                      <div className="d-flex gap-2 mt-auto ms-auto">
                        <button
                          className="btn btn-sm"
                          onClick={() => handleEdit(item)}
                        >
                          編輯
                        </button>
                        <button
                          className="btn btn-sm btn-outline-brand "
                          onClick={() => handleDelete(item.itemId)}
                        >
                          刪除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 商品新增/編輯 Modal */}
        <AdminItemManageModal
          show={showManageModal}
          onClose={handleModalClose}
          item={editingItem}
          mode={modalMode}
        />
      </div>
    </div>
  );
}

export default AdminItemListPage;
