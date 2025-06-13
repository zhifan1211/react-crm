import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/MemberNavbar";

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
  const [originalEmail, setOriginalEmail] = useState(""); // 新增
  const [verificationCode, setVerificationCode] = useState("");
  const navigate = useNavigate();

  // 進入頁面時抓取會員原始資料
  useEffect(() => {
    fetch("http://localhost:8081/member/me", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.status === 200) {
          setForm(resData.data);
          setOriginalEmail(resData.data.email); // 新增
        } else {
          alert("無法取得會員資料");
        }
      })
      .catch((err) => alert("發生錯誤：" + err.message));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      // email 有變動時自動將 confirmEmail 設為 false
      if (name === "email" && value !== originalEmail) {
        return { ...prev, [name]: value, confirmEmail: false };
      }
      return { ...prev, [name]: type === "checkbox" ? checked : value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 若 email 被更改，強制要求驗證
    if (form.email !== originalEmail) {
      alert("請先完成新 Email 的驗證！");
      return;
    }

    // 其餘欄位檢查
    const requiredFields = ["lastName", "firstName", "phoneNumber", "email", "region"];
    for (let field of requiredFields) {
      if (!form[field]) {
        alert(`請填寫欄位：${field}`);
        return;
      }
    }

    // 只有通過驗證才能送出
    if (!form.confirmEmail) {
      alert("請先完成 Email 驗證！");
      return;
    }

    try {
      const res = await fetch("http://localhost:8081/member/edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const resData = await res.json();

      if (res.ok && resData.status === 200) {
        alert("修改成功！");
        navigate("/member");
      } else {
        alert("修改失敗：" + resData.message);
      }
    } catch (err) {
      alert("錯誤：" + err.message);
    }
  };

  const sendVerificationCode = async () => {
    try {
      const res = await fetch("http://localhost:8081/member/edit/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: form.email }),
      });
      const resData = await res.json();
      if (res.ok && resData.status === 200) {
        alert("驗證碼已寄出，請於 10 分鐘內完成驗證。");
      } else {
        alert("寄送失敗：" + (resData.message || "未知錯誤"));
      }
    } catch (err) {
      alert("錯誤：" + err.message);
    }
  };

  const verifyCode = async () => {
    try {
      const res = await fetch("http://localhost:8081/member/edit/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: form.email, code: verificationCode }),
      });
      const resData = await res.json();
      if (res.ok && resData.status === 200) {
        alert("驗證成功！");
        setForm(prev => ({ ...prev, confirmEmail: true })); // 驗證成功即設定
        setOriginalEmail(form.email); // 驗證成功就更新基準值
      } else {
        alert("驗證失敗：" + resData.message);
      }
    } catch (err) {
      alert("錯誤：" + err.message);
    }
  };

  // 驗證狀態顯示判斷
  let verificationStatus = "❌ 尚未驗證";
  if (form.email !== originalEmail) {
    verificationStatus = "⚠️需重新驗證";
  } else if (form.confirmEmail) {
    verificationStatus = "✅ 已驗證";
  }

  return (
    <div>
      <Navbar />
        <div>
        <h2>編輯會員資料</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>姓：</label>
            <input name="lastName" value={form.lastName} onChange={handleChange} required />
          </div>
          <div>
            <label>名：</label>
            <input name="firstName" value={form.firstName} onChange={handleChange} required />
          </div>
          <div>
            <label>性別：</label>
            <input value={form.gender === "MALE" ? "男" : "女"} disabled />
          </div>
          <div>
            <label>生日：</label>
            <input value={form.birthDate} disabled />
          </div>
          <div>
            <label>電話：</label>
            <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} required />
          </div>
          <div>
            <label>居住地：</label>
            <input name="region" value={form.region || ""} onChange={handleChange} />
          </div>
          <div>
            <label>Email：</label>
            <input name="email" value={form.email || ""} onChange={handleChange} />
          </div>
          <div>
            <button type="button" onClick={sendVerificationCode}>
              寄送驗證碼
            </button>
          </div>
          <div>
            <label>驗證碼：</label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <button type="button" onClick={verifyCode}>
              確認驗證
            </button>
          </div>
          <div>目前驗證狀態：{verificationStatus}</div>
          <button type="submit" style={{ marginTop: "10px" }}>
            儲存變更
          </button>
          <button
            type="button"
            onClick={() => navigate("/member/edit/change-password")}
            style={{ marginTop: "10px" }}
          >
            更改密碼
          </button>
        </form>
      </div>
    </div>
  );
}

export default MemberEditPage;
