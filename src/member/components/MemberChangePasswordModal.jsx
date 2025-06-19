import { useState } from "react";
import { API_BASE } from "../../config";
import { showAlert, showConfirm } from "../../utils/alert";

export default function MemberChangePasswordModal({ show, onClose }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      showAlert({ title: "請填寫所有欄位", icon: "warning" });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showAlert({ title: "新密碼與確認密碼不一致", icon: "warning" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/member/edit/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const resData = await res.json();

      if (res.ok && resData.status === 200) {
        showAlert({ title: "密碼修改成功", icon: "success" });
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        onClose(true);
      } else {
        showAlert({ title: "密碼修改失敗", text: resData.message || "", icon: "error" });
      }
    } catch (err) {
      showAlert({ title: "請求失敗", text: err.message, icon: "error" });
    }
    setLoading(false);
  };

  if (!show) return null;

  return (
    <>
      {/* Backdrop 遮罩 */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040 }}
      ></div>
      {/* Modal 內容 */}
      <div
        className="modal d-block"
        tabIndex="-1"
        style={{
          background: "rgba(0,0,0,0.02)",
          zIndex: 1050,
        }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content p-2">
            <div className="modal-header">
              <h5 className="modal-title">變更密碼</h5>
              <button type="button" className="btn-close" onClick={() => onClose()}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">舊密碼</label>
                  <input
                    type="password"
                    className="form-control"
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">新密碼</label>
                  <input
                    type="password"
                    className="form-control"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">確認新密碼</label>
                  <input
                    type="password"
                    className="form-control"
                    value={confirmNewPassword}
                    onChange={e => setConfirmNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer justify-content-center">
                <button type="submit" className="btn" disabled={loading}>
                  {loading ? "處理中..." : "送出變更"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}