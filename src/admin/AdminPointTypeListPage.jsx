import { useState, useEffect } from "react";
import Navbar from "./components/AdminNavbar";
import "bootstrap/dist/css/bootstrap.min.css";

function AdminPointTypeList() {
  const [pointTypes, setPointTypes] = useState([]);
  const [form, setForm] = useState({
    name: "",
    category: "ADD",
    defaultValue: 0,
    description: "",
    active: true,
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ACTIVE");

  const fetchPointTypes = async () => {
    const res = await fetch("http://localhost:8081/admin/point-types", {
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok) setPointTypes(data.data);
  };

  useEffect(() => {
    fetchPointTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      let parsedValue = value;
      if (name === "defaultValue") parsedValue = value;
      if (name === "active") parsedValue = value === "true";
      return { ...prev, [name]: parsedValue };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isNaN(form.defaultValue)) {
      alert("預設值必須是數字！");
      return;
    }

    // 將 defaultValue 轉為數字再送出
    const submitForm = {
      ...form,
      defaultValue: Number(form.defaultValue),
    };

    try {
      const url = editMode
        ? `http://localhost:8081/admin/point-types/${editId}`
        : "http://localhost:8081/admin/point-types";
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
        setForm({ name: "", category: "ADD", defaultValue: 0, description: "", active: true });
        setEditMode(false);
        setEditId(null);
        fetchPointTypes();
      } else {
        alert((editMode ? "修改失敗：" : "新增失敗：") + data.message);
      }
    } catch (err) {
      alert("請求錯誤：" + err.message);
    }
  };

  const handleEdit = (pt) => {
    setForm({
      name: pt.name,
      category: pt.category,
      defaultValue: pt.defaultValue,
      description: pt.description,
      active: pt.active,
    });
    setEditMode(true);
    setEditId(pt.typeId);
  };

  const handleCancel = () => {
    setForm({ name: "", category: "ADD", defaultValue: 0, description: "", active: true });
    setEditMode(false);
    setEditId(null);
  };

  return (
    <div>
      <Navbar />
      <div className="container py-4">
        <h4 className="mb-4">點數類型管理</h4>

        {/* 表單區 */}
        <form onSubmit={handleSubmit} className="mb-4">
          <fieldset className="border rounded p-3">
            <legend className="float-none w-auto px-2 fs-6">
              {editMode ? "編輯點數類型" : "新增點數類型"}
            </legend>
            <div className="row g-2">
              <div className="col-md-3">
                <label className="form-label">名稱</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={editMode}
                  required
                  className="form-control form-control-sm"
                  maxLength={30}
                  placeholder="請輸入名稱"
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">類別</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  disabled={editMode}
                  className="form-select form-select-sm"
                >
                  <option value="ADD">派發</option>
                  <option value="CONSUME">消耗</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">預設值</label>
                <input
                  name="defaultValue"
                  type="number"
                  min={0}
                  max={99999}
                  value={form.defaultValue}
                  onChange={handleChange}
                  required
                  className="form-control form-control-sm"
                  placeholder="數字"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">描述</label>
                <input
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  maxLength={80}
                  className="form-control form-control-sm"
                  placeholder="簡要說明"
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">啟用狀態</label>
                <select
                  name="active"
                  value={form.active}
                  onChange={handleChange}
                  className="form-select form-select-sm"
                >
                  <option value="true">啟用</option>
                  <option value="false">停用</option>
                </select>
              </div>
            </div>
            <div className="mt-3">
              <button type="submit" className="btn btn-primary btn-sm me-2">
                {editMode ? "儲存變更" : "新增類型"}
              </button>
              {editMode && (
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleCancel}>
                  取消編輯
                </button>
              )}
            </div>
          </fieldset>
        </form>

        {/* 啟用/停用 切換 */}
        <div className="mb-3">
          <div className="btn-group">
            <button
              type="button"
              className={`btn btn-outline-primary btn-sm ${filterStatus === "ACTIVE" ? "active" : ""}`}
              onClick={() => setFilterStatus("ACTIVE")}
            >
              啟用中
            </button>
            <button
              type="button"
              className={`btn btn-outline-secondary btn-sm ${filterStatus === "INACTIVE" ? "active" : ""}`}
              onClick={() => setFilterStatus("INACTIVE")}
            >
              已停用
            </button>
          </div>
        </div>

        {/* 列表區 */}
        <div className="table-responsive">
          <table className="table table-bordered table-hover table-sm align-middle" style={{ fontSize: "13px" }}>
            <thead className="table-light">
              <tr>
                <th>類型編號</th>
                <th>名稱</th>
                <th>類別</th>
                <th>預設值</th>
                <th>描述</th>
                <th>啟用</th>
                <th>編輯</th>
              </tr>
            </thead>
            <tbody>
              {pointTypes
                .filter((pt) => (filterStatus === "ACTIVE" ? pt.active : !pt.active))
                .map((pt) => (
                  <tr key={pt.typeId}>
                    <td>{pt.typeId}</td>
                    <td style={{ wordBreak: "break-all" }}>{pt.name}</td>
                    <td>{pt.category === "ADD" ? "派發" : "消耗"}</td>
                    <td>{pt.defaultValue}</td>
                    <td style={{ wordBreak: "break-all" }}>{pt.description}</td>
                    <td>{pt.active ? "是" : "否"}</td>
                    <td>
                      {pt.typeId !== "TP00001" && (
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleEdit(pt)}
                        >
                          編輯
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              {pointTypes.filter((pt) => (filterStatus === "ACTIVE" ? pt.active : !pt.active)).length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-secondary">查無資料</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminPointTypeList;
