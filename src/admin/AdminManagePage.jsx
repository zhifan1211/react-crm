import { useState, useEffect } from "react";
import Navbar from "./components/AdminNavbar";

function AdminManagePage() {
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState({
    username: "",
    adminName: "",
    unit: "會員中心",
    active: true,
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ACTIVE");
  const [unitOptions, setUnitOptions] = useState([]);

  const isSuperAdmin = editId === "AD00001";

  const fetchAdmins = async () => {
    const res = await fetch("http://localhost:8081/admin/manage-admins", {
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok) setAdmins(data.data);
  };

  useEffect(() => {
    fetchAdmins();

    // 抓部門 enum
    fetch("http://localhost:8081/admin/manage-admins/units", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.status === 200) {
          setUnitOptions(resData.data);
        }
      })
      .catch((err) => console.error("取得部門 enum 失敗", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = name === "active" ? value === "true" : value;
    setForm((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitForm = { ...form };

    try {
      const url = editMode
        ? `http://localhost:8081/admin/manage-admins/${editId}`
        : "http://localhost:8081/admin/manage-admins";
      const method = editMode ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(submitForm),
      });
      const data = await res.json();
      if (res.ok && data.status === 200) {
        alert(editMode ? "修改成功！" : "新增成功！");
        setForm({ username: "", adminName: "", unit: "資訊部", active: true });
        setEditMode(false);
        setEditId(null);
        fetchAdmins();
      } else {
        alert((editMode ? "修改失敗：" : "新增失敗：") + data.message);
      }
    } catch (err) {
      alert("請求錯誤：" + err.message);
    }
  };

  const handleEdit = (admin) => {
    if (admin.adminId === "AD00001") {
      alert("總管理員無法被修改");
      return;
    }
    setForm({
      username: admin.username,
      adminName: admin.adminName,
      unit: admin.unit,
      active: admin.active,
    });
    setEditMode(true);
    setEditId(admin.adminId);
  };

  const handleCancel = () => {
    setForm({ username: "", adminName: "", unit: "資訊部", active: true });
    setEditMode(false);
    setEditId(null);
  };

  return (
    <div>
      <Navbar />
      <div style={{ padding: "20px", fontFamily: "Arial" }}>
        <h2>管理者管理</h2>

        <form onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
          <fieldset>
            <legend>{editMode ? "編輯管理者" : "新增管理者"}</legend>
            <div>
              <label>帳號：</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                disabled={editMode || isSuperAdmin}
                required
              />
            </div>
            <div>
              <label>姓名：</label>
              <input
                name="adminName"
                value={form.adminName}
                onChange={handleChange}
                disabled={isSuperAdmin}
                required
              />
            </div>
            <div>
              <label>部門：</label>
              <select
                name="unit"
                value={form.unit}
                onChange={handleChange}
                disabled={isSuperAdmin}
              >
                {unitOptions
                  .filter((u) => u !== "資訊部" || form.unit === "資訊部")
                  .map((u) => (
                    <option key={u} value={u} disabled={u === "資訊部" && form.unit !== "資訊部"}>
                      {u}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label>啟用狀態：</label>
              <select
                name="active"
                value={form.active}
                onChange={handleChange}
                disabled={isSuperAdmin}
              >
                <option value="true">啟用</option>
                <option value="false">停用</option>
              </select>
            </div>
            <button type="submit" disabled={isSuperAdmin}>
              {editMode ? "編輯完成" : "新增管理者"}
            </button>
            {editMode && (
              <button type="button" onClick={handleCancel} disabled={isSuperAdmin}>
                取消編輯
              </button>
            )}
          </fieldset>
        </form>

        <div style={{ marginBottom: "10px" }}>
          <button
            onClick={() => setFilterStatus("ACTIVE")}
            style={{ fontWeight: filterStatus === "ACTIVE" ? "bold" : "normal" }}
          >
            啟用中
          </button>
          <button
            onClick={() => setFilterStatus("INACTIVE")}
            style={{ marginLeft: "10px", fontWeight: filterStatus === "INACTIVE" ? "bold" : "normal" }}
          >
            已停用
          </button>
        </div>

        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>管理者編號</th>
              <th>帳號</th>
              <th>姓名</th>
              <th>部門</th>
              <th>是否啟用</th>
              <th>編輯</th>
            </tr>
          </thead>
          <tbody>
            {admins
              .filter((a) => (filterStatus === "ACTIVE" ? a.active : !a.active))
              .map((a) => (
                <tr key={a.adminId}>
                  <td>{a.adminId}</td>
                  <td>{a.username}</td>
                  <td>{a.adminName}</td>
                  <td>{a.unit}</td>
                  <td>{a.active ? "是" : "否"}</td>
                  <td>
                    {a.adminId !== "AD00001" && (
                      <button onClick={() => handleEdit(a)}>編輯</button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminManagePage;
