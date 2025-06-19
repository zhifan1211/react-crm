import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/MemberNavbar";
import MemberChangePasswordModal from "./components/MemberChangePasswordModal";
import EmailVerificationModal from "./components/EmailVerificationModal";
import { API_BASE } from "../config";
import { showAlert, showConfirm } from "../utils/alert";

function MemberEditPage() {
  const [form, setForm] = useState({
    memberId: "",
    lastName: "",
    firstName: "",
    gender: "",
    phoneNumber: "",
    newPassword: "",
    level: "",
    email: "",
    region: "",
    birthDate: "",
    confirmEmail: false,
  });
  const [originalEmail, setOriginalEmail] = useState("");
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const navigate = useNavigate();

  // 載入會員原始資料
  useEffect(() => {
    fetch(`${API_BASE}/member/me`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.status === 200) {
          setForm(resData.data);
          setOriginalEmail(resData.data.email);
        } else {
          showAlert({ title: "無法取得會員資料", icon: "error" });
        }
      })
      .catch((err) => showAlert({ title: "發生錯誤", text: err.message, icon: "error" }));
  }, []);

  // input 控制
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      // Email 變動時將驗證狀態歸零
      if (name === "email" && value !== originalEmail) {
        return { ...prev, [name]: value, confirmEmail: false };
      }
      return { ...prev, [name]: type === "checkbox" ? checked : value };
    });
  };

  // 完成驗證 callback（給驗證碼 Modal 用）
  const handleVerified = () => {
    setForm(prev => ({ ...prev, confirmEmail: true }));
    setOriginalEmail(form.email); // 驗證成功後更新 email 基準
  };

  // 送出修改
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Email 更動未驗證禁止送出
    if (form.email !== originalEmail) {
      showAlert({ title: "請先完成新 Email 的驗證！", icon: "warning" });
      return;
    }
    // 必填欄位檢查
    const requiredFields = ["lastName", "firstName", "phoneNumber", "email", "region"];
    for (let field of requiredFields) {
      if (!form[field]) {
        showAlert({ title: `請填寫欄位：${field}`, icon: "warning" });
        return;
      }
    }
    // 必須驗證
    if (!form.confirmEmail) {
      showAlert({ title: "請先完成 Email 驗證！", icon: "warning" });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/member/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const resData = await res.json();

      if (res.ok && resData.status === 200) {
        showAlert({ title: "修改成功！", icon: "success" });
        navigate("/member");
      } else {
        showAlert({ title: "修改失敗", text: resData.message || "", icon: "error" });
      }
    } catch (err) {
      showAlert({ title: "錯誤", text: err.message, icon: "error" });
    }
  };

  // 寄送驗證碼（打開 modal）
  const sendVerificationCode = async () => {
    if (!form.email) {
      showAlert({ title: "請輸入 email", icon: "warning" });
      return;
    }
    setShowVerifyModal(true);
  };

  // 驗證狀態
  const verificationStatus = form.email !== originalEmail
    ? { text: "需重新驗證", color: "#736029" }
    : form.confirmEmail
      ? { text: "已驗證", color: "#3D6E73" }
      : { text: "尚未驗證", color: "#90484C" };

  // 版面設計：置中卡片
  return (
    <div>
      <Navbar />
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "90vh" }}>
        <div className="shadow mt-5 mb-5 p-4 bg-white rounded" style={{ minWidth: 350, maxWidth: 430, width: "100%" }}>
          <h4 className="mb-4 text-center brand-title">會員資料修改</h4>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">姓氏</label>
                <input
                  type="text"
                  name="lastName"
                  className="form-control"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">名字</label>
                <input
                  type="text"
                  name="firstName"
                  className="form-control"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">性別</label>
              <input value={form.gender === "MALE" ? "男" : "女"} disabled className="form-control" />
            </div>
            <div className="mb-3">
              <label className="form-label">生日</label>
              <input value={form.birthDate} disabled className="form-control" />
            </div>
            <div className="mb-3">
              <label className="form-label">電話</label>
              <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} required className="form-control" />
            </div>
            <div className="mb-3">
              <label className="form-label">居住地</label>
              <input name="region" value={form.region || ""} onChange={handleChange} className="form-control" />
            </div>
            <div className="row mb-2 align-items-center">
              <div className="col-8">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={form.email || ""}
                  onChange={handleChange}
                  required
                />
                <div className="mt-1">
                  <span className="form-text" style={{fontSize: 13 }}>
                    驗證狀態：
                  </span>
                  <span className="form-text" style={{ color: verificationStatus.color, fontWeight: "bold", fontSize: 13 }}>
                    {verificationStatus.text}
                  </span>
                </div>
              </div>
              <div className="col-4 d-flex align-items-end">
                <button
                  type="button"
                  className="btn"
                  onClick={sendVerificationCode}
                  disabled={form.email === originalEmail && form.confirmEmail}
                >
                  寄送驗證碼
                </button>
              </div>
            </div>
            <div className="d-grid gap-3 mt-4 mb-2">
              <button
                type="button"
                className="btn btn-outline-brand"
                onClick={() => setShowPwdModal(true)}
              >
                變更密碼
              </button>
              <button type="submit" className="btn btn-brand">
                儲存變更
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* 密碼修改 Modal */}
      <MemberChangePasswordModal
        show={showPwdModal}
        onClose={() => setShowPwdModal(false)}
      />
      {/* Email驗證碼 Modal */}
      <EmailVerificationModal
        show={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        email={form.email}
        onVerified={handleVerified}
      />
    </div>
  );
}

export default MemberEditPage;
