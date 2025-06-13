import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./components/AdminNavbar";
import DateRangeFilter from "./components/DateRangeFilter";
import GlobalFilter from "./components/GlobalFilter";
import "bootstrap/dist/css/bootstrap.min.css";

function AdminPointManagePage() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [memberName, setMemberName] = useState("");
  const [memberLevel, setMemberLevel] = useState("PASSER");
  const [category, setCategory] = useState("ADD");
  const [pointTypes, setPointTypes] = useState([]);
  const [form, setForm] = useState({ typeId: "", points: "", note: "" });
  const [logs, setLogs] = useState([]);
  const [totalRemainPoints, setTotalRemainPoints] = useState(0);

  // 搜尋 & 日期篩選
  const [globalFilter, setGlobalFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 取得會員資訊
  const fetchMember = async () => {
    try {
      const res = await fetch(`http://localhost:8081/admin/member/${memberId}`, { credentials: "include" });
      const resData = await res.json();
      if (res.ok && resData.status === 200) {
        setMemberName(resData.data.lastName + resData.data.firstName);
        setMemberLevel(resData.data.level);
      } else {
        alert("載入會員資訊失敗：" + (resData.message ?? "未知錯誤"));
      }
    } catch (err) {
      alert("會員資訊錯誤：" + err.message);
    }
  };

  // 取得點數紀錄
  const fetchLogs = async () => {
    try {
      const res = await fetch(`http://localhost:8081/admin/member/${memberId}/point`, { credentials: "include" });
      const resData = await res.json();
      if (res.ok && resData.status === 200) {
        const logs = resData.data;
        setLogs(logs);
        const total = logs.filter(log => log.category === "ADD" && typeof log.remainPoints === "number")
          .reduce((sum, log) => sum + log.remainPoints, 0);
        setTotalRemainPoints(total);
      } else {
        alert("載入歷程失敗：" + (resData.message ?? "未知錯誤"));
      }
    } catch (err) {
      alert("歷程錯誤：" + err.message);
    }
  };

  // 取得點數類型
  const fetchPointTypes = async () => {
    try {
      const res = await fetch(`http://localhost:8081/admin/point-types?active=true&category=${category}`, {
        credentials: "include",
      });
      const resData = await res.json();
      if (res.ok && resData.status === 200) {
        setPointTypes(resData.data);
        setForm({ typeId: "", points: "", note: "" });
      } else {
        alert("載入點數類型失敗：" + (resData.message ?? "未知錯誤"));
      }
    } catch (err) {
      alert("載入點數類型錯誤：" + err.message);
    }
  };

  useEffect(() => { fetchMember(); fetchLogs(); }, [memberId]);
  useEffect(() => { fetchPointTypes(); }, [category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "typeId") {
      const selected = pointTypes.find((pt) => pt.typeId === value);
      setForm((prev) => ({
        ...prev,
        typeId: value,
        points: selected ? selected.defaultValue.toString() : "",
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const pointValue = parseInt(form.points, 10);
    if (!Number.isInteger(pointValue) || pointValue <= 0) {
      alert("點數必須為正整數");
      return;
    }
    if (category === "CONSUME" && memberLevel === "PASSER") {
      const confirmMsg = "此會員尚未驗證為正式會員，確定要執行扣點嗎？\n建議請客戶完成認證後再執行，如屬回扣或特殊情況請再三確認。";
      if (!window.confirm(confirmMsg)) return;
    } else {
      const normalMsg = `請確認本次操作資訊無誤：\n操作類別：${category === "ADD" ? "派發" : "消耗"}\n點數：${form.points}\n確定要執行嗎？`;
      if (!window.confirm(normalMsg)) return;
    }
    const payload = { ...form, points: pointValue, memberId };
    try {
      const res = await fetch(`http://localhost:8081/admin/member/${memberId}/point`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const resData = await res.json();
      if (res.ok && resData.status === 200) {
        alert("操作成功！");
        setForm({ typeId: "", points: "", note: "" });
        setCategory("ADD");
        fetchLogs();
      } else {
        alert("操作失敗：" + (resData.message ?? "未知錯誤"));
      }
    } catch (err) {
      alert("提交錯誤：" + err.message);
    }
  };

  // 找到目前選中的點數類型描述
  const selectedType = pointTypes.find((pt) => pt.typeId === form.typeId);

  // 歷程篩選（日期+搜尋）
  const filteredLogs = useMemo(() => {
    let data = logs;
    // 日期篩選
    if (startDate || endDate) {
      data = data.filter((log) => {
        const createdAt = log.createdAt ? log.createdAt.slice(0, 19).replace("T", " ") : "";
        if (!createdAt) return false;
        const t = new Date(createdAt.replace(/-/g, '/'));
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (start && end) return t >= start && t <= end;
        if (start) return t >= start;
        if (end) return t <= end;
        return true;
      });
    }
    // 全欄位搜尋
    if (globalFilter.trim()) {
      const keyword = globalFilter.trim().toLowerCase();
      data = data.filter((log) =>
        (log.logId?.toLowerCase().includes(keyword) ||
          log.typeName?.toLowerCase().includes(keyword) ||
          log.adminName?.toLowerCase().includes(keyword) ||
          (log.note || "").toLowerCase().includes(keyword) ||
          (log.unit || "").toLowerCase().includes(keyword) ||
          (log.memberName || "").toLowerCase().includes(keyword)
        )
      );
    }
    return data;
  }, [logs, startDate, endDate, globalFilter]);

  return (
    <div>
      <Navbar />
      <div className="container py-4">
        <button type="button" className="btn mb-3" onClick={() => navigate("/admin/member")}>返回</button>
        <h5 className="mb-3">點數管理 - 會員 {memberName} ({memberId})</h5>
        <div className="mb-2">
          <span>會員等級：</span>
          <span style={{ color: memberLevel === "PASSER" ? "#90484C" : "#3D6E73", fontWeight: "bold"}}>
            {memberLevel === "PASSER" ? "非正式會員" : "正式會員"}
          </span>
        </div>
        <div>
          <span className="mb-2">有效點數總計：{totalRemainPoints}</span>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 mb-4">
          <fieldset className="border rounded p-3">
            <legend className="float-none w-auto px-2 fs-6">
              {category === "ADD" ? "派發點數" : "扣除點數"}
            </legend>
            <div className="row g-2">
              <div className="col-md-2">
                <label className="form-label">點數類別</label>
                <select className="form-select form-select-sm" value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="ADD">派發</option>
                  <option value="CONSUME">消耗</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">點數類型</label>
                <select
                  className="form-select form-select-sm"
                  name="typeId"
                  value={form.typeId}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>請選擇</option>
                  {pointTypes.map(pt => (
                    <option key={pt.typeId} value={pt.typeId}>{pt.name}</option>
                  ))}
                </select>
                {selectedType && (
                  <div className="form-text text-muted ms-2">
                    {selectedType.description || "（無描述）"}
                  </div>
                )}
              </div>
              <div className="col-md-2">
                <label className="form-label">點數</label>
                <input
                  type="number"
                  name="points"
                  value={form.points}
                  onChange={handleChange}
                  required
                  min={1}
                  className="form-control form-control-sm"
                  placeholder="必填"
                />
              </div>
              <div className="col">
                <label className="form-label">備註</label>
                <input
                  type="text"
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  maxLength={80}
                  className="form-control form-control-sm"
                  placeholder="選填"
                />
                <div class="form-text text-muted ms-2">
                  僅管理者可見
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-end mt-3">
              <button type="submit" className="btn btn-sm me-2">送出</button>
            </div>
          </fieldset>
        </form>

        {/* 搜尋與區間工具 */}
        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-2">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
          <GlobalFilter
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
        </div>

        {/* 歷史紀錄表格 */}
        <div className="table-responsive">
          <table className="table table-bordered table-hover table-sm align-middle" style={{ fontSize: "13px" }}>
            <thead className="table-light">
              <tr>
                <th>紀錄編號</th>
                <th>類型名稱</th>
                <th>點數種類</th>
                <th>原始點數</th>
                <th>剩餘點數</th>
                <th>扣除點數</th>
                <th>扣點來源</th>
                <th>備註</th>
                <th>操作人員</th>
                <th>來源單位</th>
                <th>建立時間</th>
                <th>到期時間</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center text-secondary">查無資料</td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.logId}>
                    <td>{log.logId}</td>
                    <td>{log.typeName}</td>
                    <td>{log.category === "ADD" ? "派發" : "消耗"}</td>
                    <td>{log.category === "ADD" ? log.originalPoints : "-"}</td>
                    <td>{log.category === "ADD" ? log.remainPoints ?? "-" : "-"}</td>
                    <td>{log.category === "CONSUME" ? log.originalPoints : "-"}</td>
                    <td>{log.category === "CONSUME" ? (log.consumeFromLogIds || []).join(", ") : "-"}</td>
                    <td>{log.note || "-"}</td>
                    <td>{log.adminName}</td>
                    <td>{log.unit || "-"}</td>
                    <td>{log.createdAt?.slice(0, 19).replace("T", " ")}</td>
                    <td>{log.category === "ADD" && log.expiredAt ? log.expiredAt.slice(0, 19).replace("T", " ") : "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminPointManagePage;