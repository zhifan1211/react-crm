import { useState, useEffect } from "react";

export default function AdminPointTypeManageModal({ show, onClose, mode = "add", data, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    category: "ADD",
    defaultValue: 0,
    description: "",
    active: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "edit" && data) {
      setForm({
        name: data.name || "",
        category: data.category || "ADD",
        defaultValue: data.defaultValue ?? 0,
        description: data.description || "",
        active: data.active ?? true,
      });
    } else {
      setForm({
        name: "",
        category: "ADD",
        defaultValue: 0,
        description: "",
        active: true,
      });
    }
  }, [show, mode, data]);

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
    setLoading(true);
    await onSubmit(form); // 呼叫外部onSubmit，處理新增/編輯
    setLoading(false);
  };

  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} />
      <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content p-2">
            <div className="modal-header">
              <h5 className="modal-title">{mode === "add" ? "新增點數類型" : "編輯點數類型"}</h5>
              <button type="button" className="btn-close" onClick={() => onClose()}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="mb-2">
                  <label className="form-label">名稱</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="form-control"
                    maxLength={30}
                    placeholder="請輸入名稱"
                    disabled={mode === "edit"}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">類別</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="form-select"
                    disabled={mode === "edit"}
                  >
                    <option value="ADD">派發</option>
                    <option value="CONSUME">消耗</option>
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label">預設值</label>
                  <input
                    name="defaultValue"
                    type="number"
                    min={0}
                    max={99999}
                    value={form.defaultValue}
                    onChange={handleChange}
                    required
                    className="form-control"
                    placeholder="數字"
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">描述</label>
                  <input
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    maxLength={80}
                    className="form-control"
                    placeholder="簡要說明"
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">啟用狀態</label>
                  <select
                    name="active"
                    value={form.active ? "true" : "false"}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="true">啟用</option>
                    <option value="false">停用</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer justify-content-center">
                <button type="submit" className="btn" disabled={loading}>
                  {loading ? "處理中..." : mode === "add" ? "新增" : "儲存變更"}
                </button>
                <button type="button" className="btn btn-outline-brand ms-2" onClick={() => onClose()}>
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
