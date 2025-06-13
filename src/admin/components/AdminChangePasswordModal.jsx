import { useState } from "react";

export default function AdminChangePasswordModal({ show, onClose }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      alert("請填寫所有欄位");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      alert("新密碼與確認密碼不一致");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8081/admin/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const resData = await res.json();

      if (res.ok && resData.status === 200) {
        alert("密碼修改成功，請重新登入");
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        onClose(true);
      } else {
        alert("密碼修改失敗：" + resData.message);
      }
    } catch (err) {
      alert("請求失敗：" + err.message);
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
              <h5 className="modal-title">修改密碼</h5>
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
                  {loading ? "處理中..." : "送出修改"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}