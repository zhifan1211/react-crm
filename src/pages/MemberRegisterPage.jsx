import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { zhTW } from "date-fns/locale";
import { API_BASE } from "../config";
import { showAlert, showConfirm } from "../utils/alert";
import HomeNavbar from "./components/HomeNavbar";

function MemberRegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    lastName: "",
    firstName: "",
    phoneNumber: "",
    birthDate: "", 
    gender: "MALE",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/member/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const resData = await res.json();

      if (res.ok && resData.status === 200) {
        showAlert({ title: "註冊成功！", icon: "success" });
        navigate("/");
      } else {
        showAlert({ title: "註冊失敗", text: resData.message || "", icon: "error" });
      }
    } catch (err) {
      showAlert({ title: "錯誤", text: err.message, icon: "error" });
    }
  };

  return (
    <>
      <HomeNavbar />
      <div className="login-page d-flex align-items-center justify-content-center">
        <div className="login-card shadow p-4 rounded bg-white">
          <h2 className="mb-4 text-center brand-title">OTTER POINT</h2>
          <h5 className="mb-4 text-center">快速註冊會員</h5>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">性別</label>
              <div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="gender"
                    id="male"
                    value="MALE"
                    checked={form.gender === "MALE"}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="male">
                    男
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="gender"
                    id="female"
                    value="FEMALE"
                    checked={form.gender === "FEMALE"}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="female">
                    女
                  </label>
                </div>
              </div>
            </div>
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
              <label className="form-label">手機號碼</label>
              <input
                type="tel"
                name="phoneNumber"
                className="form-control"
                value={form.phoneNumber}
                onChange={handleChange}
                required
              />
              <div class="form-text text-muted">
                手機號碼10碼，例如：0911222333
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">出生日期</label>
              <div>
                <DatePicker
                  selected={form.birthDate ? new Date(form.birthDate) : null}
                  onChange={date => {
                    if (!date) {
                      setForm(prev => ({ ...prev, birthDate: "" }));
                      return;
                    }
                    // 這裡不要用 toISOString()，要自己拼 YYYY-MM-DD（local）
                    const yyyy = date.getFullYear();
                    const mm = String(date.getMonth() + 1).padStart(2, "0");
                    const dd = String(date.getDate()).padStart(2, "0");
                    const dateString = `${yyyy}-${mm}-${dd}`;
                    setForm(prev => ({ ...prev, birthDate: dateString }));
                  }}
                  locale={zhTW}
                  dateFormat="yyyy-MM-dd"
                  className="form-control"
                  placeholderText="選擇日期"
                  maxDate={new Date()}
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                />
              </div>
              <div class="form-text text-muted">
                出生日期不得更改，註冊前請核實內容
              </div>
            </div>
            <button type="submit" className="btn btn w-100 mt-3">註冊</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default MemberRegisterPage;
