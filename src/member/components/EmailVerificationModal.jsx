import { useEffect, useState } from "react";
import { API_BASE } from "../../config";
import { showAlert } from "../../utils/alert";

export default function EmailVerificationModal({ show, onClose, email, onVerified }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Modal 開啟/換信箱時，自動寄信、倒數計時
  useEffect(() => {
    if (show && email) {
      setCode("");
      sendVerificationCode();
    }
    // eslint-disable-next-line
  }, [show, email]);

  // 倒數計時
  useEffect(() => {
    if (countdown === 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // 寄送驗證信
  const sendVerificationCode = async () => {
    if (!email) return;
    setResending(true);
    setCountdown(60); // **這行最重要！**
    try {
      const res = await fetch(`${API_BASE}/member/edit/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      const resData = await res.json();
      if (!(res.ok && resData.status === 200)) {
        showAlert({ title: "寄送驗證信失敗", text: resData.message || "", icon: "error" });
        setCountdown(0); // 如果寄送失敗，倒數重置
      }
    } catch (err) {
      showAlert({ title: "寄送驗證信失敗", text: err.message, icon: "error" });
      setCountdown(0); // 失敗倒數重置
    }
    setResending(false);
  };

  // 點擊"重新寄送驗證碼"
  const handleSendCode = () => {
    if (countdown === 0) {
      sendVerificationCode();
    }
  };

  // 驗證
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
        onVerified();
        onClose();
      } else {
        showAlert({ title: "驗證失敗", text: resData.message || "", icon: "error" });
      }
    } catch (err) {
      showAlert({ title: "錯誤", text: err.message, icon: "error" });
    }
    setLoading(false);
  };

  if (!show) return null;

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
            <div
              className={`form-text ${countdown > 0 ? "text-secondary" : "text-brand link-like"} mt-2`}
              onClick={countdown === 0 ? handleSendCode : undefined}
              style={{ cursor: countdown === 0 ? "pointer" : "default" }}
            >
              {countdown > 0 ? `若未收到驗證信，請稍候 ${countdown} 秒後重試` : "重新寄送驗證碼"}
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline-brand" onClick={onClose} disabled={loading}>取消</button>
            <button className="btn btn" onClick={handleVerify} disabled={loading}>
              {loading ? "驗證中..." : "確認驗證"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
