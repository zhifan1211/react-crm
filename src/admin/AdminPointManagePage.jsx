import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./components/AdminNavbar";

function AdminPointManagePage() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [memberName, setMemberName] = useState("");
  const [memberLevel, setMemberLevel] = useState("PASSER"); // 會員等級
  const [category, setCategory] = useState("ADD");
  const [pointTypes, setPointTypes] = useState([]);
  const [form, setForm] = useState({ typeId: "", points: "", note: "" });
  const [logs, setLogs] = useState([]);
  const [totalRemainPoints, setTotalRemainPoints] = useState(0);

  // 取得會員資訊
  const fetchMember = async () => {
    try {
      const res = await fetch(`http://localhost:8081/admin/member/${memberId}`, {
        credentials: "include",
      });
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
      const res = await fetch(`http://localhost:8081/admin/member/${memberId}/point`, {
        credentials: "include",
      });
      const resData = await res.json();
      if (res.ok && resData.status === 200) {
        const logs = resData.data;
        setLogs(logs);

        const total = logs
          .filter(log => log.category === "ADD" && typeof log.remainPoints === "number")
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

  useEffect(() => {
    fetchMember();
    fetchLogs();
  }, [memberId]);

  useEffect(() => {
    fetchPointTypes();
  }, [category]);

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
      if (!window.confirm(confirmMsg)) {
        return;
      }
    } else {
      const normalMsg = `請確認本次操作資訊無誤：\n操作類別：${category === "ADD" ? "派發" : "消耗"}\n點數：${form.points}\n確定要執行嗎？`;
      if (!window.confirm(normalMsg)) {
        return;
      }
    }

    const payload = {
      ...form,
      points: pointValue,
      memberId,
    };

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

  return (
    <div>
      <Navbar />
      <div style={{ padding: "20px", fontFamily: "Arial" }}>
        <h2>點數管理 - 會員 {memberName} ({memberId})</h2>
        <div>
          <span style={{ marginRight: 8 }}>會員等級：</span>
          <span>{memberLevel === "PASSER" ? "❌ 非正式會員" : "✅ 正式會員"}</span>
        </div>
        <p><strong>有效點數總計：</strong>{totalRemainPoints}</p>
        <form onSubmit={handleSubmit}>
          <div>
            <label>操作類別：</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="ADD">派發</option>
              <option value="CONSUME">消耗</option>
            </select>
          </div>
          <div>
            <label>點數類型：</label>
            <select name="typeId" value={form.typeId} onChange={handleChange} required>
              <option value="" disabled>請選擇</option>
              {pointTypes.map((pt) => (
                <option key={pt.typeId} value={pt.typeId}>{pt.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label>點數：</label>
            <input
              type="number"
              name="points"
              value={form.points}
              onChange={handleChange}
              required
              placeholder="必填"
            />
          </div>
          <div>
            <label>備註：</label>
            <input
              type="text"
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="選填"
            />
          </div>
          <button type="submit" style={{ marginTop: "10px" }}>確認送出</button>
          <button type="button" onClick={() => navigate("/admin/member")} style={{ marginLeft: "10px" }}>返回</button>
        </form>

        <div style={{ marginTop: "30px" }}>
          <h3>歷史紀錄</h3>
          <table border="1" cellPadding="5" cellSpacing="0">
            <thead>
              <tr>
                <th>紀錄編號</th>
                <th>點數項目</th>
                <th>點數種類</th>
                <th>原派發點數</th>
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
              {logs.map((log) => (
                <tr key={log.logId}>
                  <td>{log.logId}</td>
                  <td>{log.typeName}</td>
                  <td>{log.category === "ADD" ? "派發" : "消耗"}</td>
                  <td>{log.category === "ADD" ? log.originalPoints : "-"}</td>
                  <td>{log.category === "ADD" ? log.remainPoints ?? "-" : "-"}</td>
                  <td>{log.category === "CONSUME" ? log.originalPoints : "-"}</td> {/* 扣除點數 */}
                  <td>{log.category === "CONSUME" ? (log.consumeFromLogIds || []).join(", ") : "-"}</td>
                  <td>{log.note || "-"}</td>
                  <td>{log.adminName}</td>
                  <td>{log.unit || "-"}</td>
                  <td>{log.createdAt?.slice(0, 19).replace("T", " ")}</td>
                  <td>{log.category === "ADD" && log.expiredAt ? log.expiredAt.slice(0, 19).replace("T", " ") : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminPointManagePage;
