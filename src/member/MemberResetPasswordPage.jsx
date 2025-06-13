import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function MemberResetPasswordPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [verified, setVerified] = useState(false);
  const [step, setStep] = useState(1); // 1:輸入電話, 2:驗證碼, 3:重設密碼
  const [countdown, setCountdown] = useState(0);

  const navigate = useNavigate();
  
  useEffect(() => {
    if (countdown === 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // 寄送驗證碼
  const handleSendCode = async () => {
    if (countdown > 0) return; // 倒數期間禁止再次點擊

    if (!phoneNumber) {
      alert("請輸入手機號碼！");
      return;
    }
    try {
      const res = await fetch("http://localhost:8081/member/reset-password/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      const resData = await res.json();
      if (res.ok && resData.status === 200) {
        alert("驗證碼已寄出，請查收信箱");
        setStep(2);
        setCountdown(60); // 啟動倒數 60 秒
      } else {
        alert("寄送失敗：" + (resData.message || "未知錯誤"));
      }
    } catch (err) {
      alert("錯誤：" + err.message);
    }
  };

  // 驗證驗證碼
  const handleVerifyCode = async () => {
    if (!code) {
      alert("請輸入驗證碼！");
      return;
    }
    try {
      const res = await fetch("http://localhost:8081/member/reset-password/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, code }), // email 不用再前端送出
      });
      const resData = await res.json();
      if (res.ok && resData.status === 200) {
        alert("驗證成功，請設定新密碼！");
        setResetToken(resData.data); 
        setVerified(true);
        setStep(3);
      } else {
        alert("驗證失敗：" + (resData.message || "未知錯誤"));
      }
    } catch (err) {
      alert("錯誤：" + err.message);
    }
  };

  // 重設密碼
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!verified) {
      alert("請先完成驗證！");
      return;
    }
    if (!newPassword || !confirmNewPassword) {
      alert("請填寫所有欄位！");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      alert("新密碼與再次輸入不一致！");
      return;
    }
    try {
      const res = await fetch("http://localhost:8081/member/reset-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, newPassword, token: resetToken }),
      });
      const resData = await res.json();
      if (res.ok && resData.status === 200) {
        alert("密碼重設成功，請重新登入！");
        navigate("/member/login");
      } else {
        alert("密碼重設失敗：" + (resData.message || "未知錯誤"));
      }
    } catch (err) {
      alert("錯誤：" + err.message);
    }
  };

  return (
    <div className="login-page d-flex align-items-center justify-content-center">
      <div className="login-card shadow p-4 rounded bg-white">
        <h2 className="mb-4 text-center brand-title">OTTER POINT</h2>
        <h5 className="mb-4 text-center">忘記密碼</h5>

        {/* 步驟 1：輸入電話號碼 */}
        {step === 1 && (
          <>
            <div className="form-text text-muted text-center mb-3">
              此功能僅限正式會員（已驗證信箱）使用
            </div>
            <div className="mb-3">
              <label className="form-label">手機號碼</label>
              <input
                type="text"
                className="form-control"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
              <div className="form-text text-muted">
                請輸入註冊時使用的手機號碼，例如：0911222333
              </div>
            </div>
            <button
              type="button"
              className="btn btn w-100"
              onClick={handleSendCode}
              disabled={!phoneNumber}
            >
              寄送郵件驗證碼
            </button>
          </>
        )}

        {/* 步驟 2：輸入驗證碼 */}
        {step === 2 && (
          <>
            <div className="mb-3">
              <label className="form-label">驗證碼</label>
              <input
                type="text"
                className="form-control"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
              <div className="form-text text-muted">
               請至電郵信箱查看驗證碼
              </div>
            </div>
            <button
              type="button"
              className="btn btn w-100 mt-3"
              onClick={handleVerifyCode}
            >
              驗證信箱
            </button>
            <div
              className={`form-text ${countdown > 0 ? "text-secondary" : "text-brand link-like"} mt-2 text-center`}
              onClick={countdown === 0 ? handleSendCode : null}
              style={{ cursor: countdown === 0 ? "pointer" : "default" }}
            >
              {countdown > 0 ? `若未收到驗證信，請稍候 ${countdown} 秒後重試` : "重新寄送驗證碼"}
            </div>
          </>
        )}

        {/* 步驟 3：重設密碼 */}
        {step === 3 && verified && (
          <form onSubmit={handleResetPassword}>
            <div className="mb-3">
              <label className="form-label">新密碼</label>
              <input
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">再次輸入新密碼</label>
              <input
                type="password"
                className="form-control"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <button type="submit" className="btn btn w-100">
              送出
            </button>
          </form>
        )}

        <div className="form-text text-brand link-like text-center mt-4" onClick={() => navigate("/member/login")}>
          返回登入頁
        </div>
      </div>
    </div>
  );

}

export default MemberResetPasswordPage;
