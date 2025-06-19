import { useState, useEffect } from "react";
import { API_BASE } from "../../config";
import { showAlert, showConfirm } from "../../utils/alert";

export default function AdminItemManageModal({ show, onClose, item, mode = "add" }) {
  const [itemName, setItemName] = useState("");
  const [imageFile, setImageFile] = useState(null); // 檔案物件
  const [imagePreview, setImagePreview] = useState(""); // 預覽圖
  const [imageURL, setImageURL] = useState(""); // 舊圖網址
  const [points, setPoints] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);

  // 幫助你產生正確的預覽網址
  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("//")) return url;
    if (url.startsWith("/images/")) return `${API_BASE}${url}`;
    return `${API_BASE}/images/${url}`;
  };

  useEffect(() => {
    if (item && mode === "edit") {
      setItemName(item.itemName || "");
      setImageURL(item.imageURL || "");
      setImagePreview(item.imageURL ? getImageUrl(item.imageURL) : ""); // 確保帶正確的圖
      setPoints(item.points || "");
      setDescription(item.description || "");
      setActive(item.active ?? true);
      setImageFile(null);
    } else {
      setItemName("");
      setImageFile(null);
      setImagePreview("");
      setImageURL("");
      setPoints("");
      setDescription("");
      setActive(true);
    }
  }, [item, mode, show]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // 用本地暫存
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let uploadedImageUrl = imageURL;

    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      try {
        const res = await fetch(`${API_BASE}/admin/item-list/upload-image`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        const resData = await res.json();
        if (res.ok && resData.status === 200) {
          uploadedImageUrl = resData.data; // 要保證是路徑字串
        } else {
          showAlert({
            title: "圖片上傳失敗",
            text: resData.message || "",
            icon: "error",
          });
          setLoading(false);
          return;
        }
      } catch (err) {
        showAlert({
          title: "圖片上傳失敗",
          text: err.message,
          icon: "error",
        });
        setLoading(false);
        return;
      }
    }

    // 準備送出的資料
    const data = {
      itemName,
      imageURL: uploadedImageUrl,
      points: Number(points),
      description,
      active,
    };
    // 只有編輯時才要帶 itemId
    if (mode === "edit" && item && item.itemId) {
      data.itemId = item.itemId;
    }

    try {
      const url =
        mode === "add"
          ? `${API_BASE}/admin/item-list`
          : `${API_BASE}/admin/item-list/${item.itemId}`;
      const method = mode === "add" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (res.ok && resData.status === 200) {
        showAlert({
          title: `${mode === "add" ? "新增" : "修改"}成功！`,
          icon: "success",
        });
        onClose(true);
      } else {
        showAlert({
          title: `${mode === "add" ? "新增" : "修改"}失敗`,
          text: resData.message || "",
          icon: "error",
        });
      }
    } catch (err) {
      showAlert({
        title: "請求失敗",
        text: err.message,
        icon: "error",
      });
    }
    setLoading(false);
  };

  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
      <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.02)", zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content p-2">
            <div className="modal-header">
              <h5 className="modal-title">{mode === "add" ? "新增商品" : "編輯商品"}</h5>
              <button type="button" className="btn-close" onClick={() => onClose()}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">商品名稱</label>
                  <input className="form-control" value={itemName} onChange={e => setItemName(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">商品圖片上傳（寬高比建議3:2）</label>
                  <input type="file" accept="image/*" className="form-control" onChange={handleImageChange} />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="預覽圖"
                        style={{ maxHeight: "120px", borderRadius: "8px", border: "1px solid #eee" }}
                        onError={e => (e.target.style.display = "none")}
                      />
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">所需點數</label>
                  <input type="number" className="form-control" value={points} onChange={e => setPoints(e.target.value)} required min={1} />
                </div>
                <div className="mb-3">
                  <label className="form-label">描述</label>
                  <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
                </div>
                {/* 狀態下拉選單 */}
                <div className="mb-3">
                  <label className="form-label">商品狀態</label>
                  <select
                    className="form-select"
                    value={active ? "ACTIVE" : "INACTIVE"}
                    onChange={e => setActive(e.target.value === "ACTIVE")}
                  >
                    <option value="ACTIVE">啟用</option>
                    <option value="INACTIVE">停用</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer justify-content-center">
                <button type="submit" className="btn" disabled={loading}>
                  {loading ? "處理中..." : mode === "add" ? "新增" : "修改"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
