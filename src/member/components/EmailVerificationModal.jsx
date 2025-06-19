import { useState } from "react";
import { API_BASE } from "../../config";
import { showAlert, showConfirm } from "../../utils/alert";

export default function EmailVerificationModal({ show, onClose, email, onVerified }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleVerify = async () => {
    if (!code) {
      showAlert({ title: "請輸入驗證碼", icon: "warning" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/member/edit/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code }),
      });
      const resData = await res.json();
      if (res.ok && resData.status === 200) {
        showAlert({ title: "驗證成功！", icon: "success" });
        onVerified(); // 通知父元件驗證成功
        onClose();
      } else {
        showAlert({ title: "驗證失敗", text: resData.message || "", icon: "error" });
      }
    } catch (err) {
      showAlert({ title: "錯誤", text: err.message, icon: "error" });
    }
    setLoading(false);
  };

  return (
    <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,.2)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-3">
          <div className="modal-header">
            <h5 className="modal-title">輸入驗證碼</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <label className="form-label">請輸入寄送到信箱的驗證碼</label>
            <input
              className="form-control"
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              autoFocus
            />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose} disabled={loading}>取消</button>
            <button className="btn btn-primary" onClick={handleVerify} disabled={loading}>
              {loading ? "驗證中..." : "確認驗證"}
            </button>
          </div>
        </div>
      </div>
      {/* backdrop */}
      <div className="modal-backdrop fade show"></div>
    </div>
  );
}