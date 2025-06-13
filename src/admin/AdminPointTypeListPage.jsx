import { useEffect, useMemo, useState } from "react";
import Navbar from "./components/AdminNavbar";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import "bootstrap/dist/css/bootstrap.min.css";

// 全欄位搜尋
function GlobalFilter({ globalFilter, setGlobalFilter }) {
  return (
    <input
      className="form-control"
      style={{ maxWidth: 200, display: "inline-block", fontSize: "14px" }}
      value={globalFilter || ""}
      onChange={e => setGlobalFilter(e.target.value)}
      placeholder="關鍵字搜尋…"
    />
  );
}

// 權限判斷：可以根據 props 或 localStorage
function getCurrentAdminUnit() {
  // 你可自行替換這裡，例如從 localStorage 或 context
  try {
    const admin = JSON.parse(localStorage.getItem("adminCert") || "{}");
    return admin.unit || "";
  } catch {
    return "";
  }
}

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
  const [loading, setLoading] = useState(true);

  // 載入所有點數類型
  const fetchPointTypes = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8081/admin/point-types", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) setPointTypes(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPointTypes();
  }, []);

  // 表單控制
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
    const submitForm = { ...form, defaultValue: Number(form.defaultValue) };

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

  // 搜尋&狀態篩選
  const [globalFilter, setGlobalFilter] = useState("");
  const filteredPointTypes = useMemo(() => {
    let data = pointTypes.filter(pt =>
      filterStatus === "ACTIVE" ? pt.active : !pt.active
    );
    if (globalFilter.trim() !== "") {
      const keyword = globalFilter.trim().toLowerCase();
      data = data.filter(
        (pt) =>
          pt.typeId.toLowerCase().includes(keyword) ||
          pt.name.toLowerCase().includes(keyword) ||
          (pt.description || "").toLowerCase().includes(keyword)
      );
    }
    return data;
  }, [pointTypes, filterStatus, globalFilter]);

  // react-table 欄位
  const columns = useMemo(
    () => [
      { Header: "類型編號", accessor: "typeId" },
      { Header: "類型名稱", accessor: "name" },
      {
        Header: "點數類別",
        accessor: "category",
        Cell: ({ value }) => (value === "ADD" ? "派發" : "消耗"),
      },
      { Header: "預設值", accessor: "defaultValue" },
      { Header: "描述", accessor: "description", Cell: ({ value }) => value || "-" },
      {
        Header: "啟用",
        accessor: "active",
        Cell: ({ value }) => (value ? "是" : "否"),
      },
      {
        Header: "編輯",
        id: "edit",
        Cell: ({ row }) =>
          row.original.typeId !== "TP00001" ? (
            <button
              className="btn btn-sm"
              onClick={() => handleEdit(row.original)}
            >
              編輯
            </button>
          ) : null,
      },
    ],
    []
  );

  // react-table 實例（用自己計算過的 filteredPointTypes）
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state,
    setGlobalFilter: setTableGlobalFilter,
    pageOptions,
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
  } = useTable(
    {
      columns,
      data: filteredPointTypes,
      initialState: { pageIndex: 0, pageSize: 10 }
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  // 搜尋同步到 table
  useEffect(() => {
    setTableGlobalFilter(globalFilter);
  }, [globalFilter, setTableGlobalFilter]);

  return (
    <div>
      <Navbar />
      <div className="container py-4">
        <h5 className="mb-3">點數類型管理</h5>
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
            <div className="d-flex justify-content-end mt-3">
              <button type="submit" className="btn btn-sm me-2">
                {editMode ? "儲存變更" : "新增類型"}
              </button>
              {editMode && (
                <button type="button" className="btn btn-sm" onClick={handleCancel}>
                  取消編輯
                </button>
              )}
            </div>
          </fieldset>
        </form>

        {/* 篩選、搜尋 */}
        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-2">
          <div className="btn-group mb-2">
            <button
              type="button"
              className={`btn btn-sm ${filterStatus === "ACTIVE" ? "btn-brand" : "btn-outline-brand"}`}
              onClick={() => setFilterStatus("ACTIVE")}
            >
              啟用中
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterStatus === "INACTIVE" ? "btn-brand" : "btn-outline-brand"}`}
              onClick={() => setFilterStatus("INACTIVE")}
            >
              已停用
            </button>
          </div>
          <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
        </div>

        {/* 表格區 */}
        {loading ? (
          <div>載入中...</div>
        ) : (
          <div className="table-responsive">
            <table
              className="table table-bordered table-hover table-sm align-middle"
              {...getTableProps()}
              style={{ fontSize: "13px" }}
            >
              <thead className="table-light">
                {headerGroups.map(headerGroup => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map(column => (
                      <th
                        {...column.getHeaderProps(column.getSortByToggleProps())}
                        style={{
                          cursor: column.canSort ? "pointer" : "default",
                          whiteSpace: "nowrap",
                          fontSize: "13px"
                        }}
                      >
                        {column.render("Header")}
                        {column.isSorted ? (
                          column.isSortedDesc ? " ▼" : " ▲"
                        ) : ""}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {page.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center text-secondary">
                      查無資料
                    </td>
                  </tr>
                ) : (
                  page.map(row => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()}>
                        {row.cells.map(cell => (
                          <td {...cell.getCellProps()} style={{ fontSize: "13px" }}>
                            {cell.render("Cell")}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            {/* 分頁 */}
            <div className="d-flex justify-content-between align-items-center">
              <div style={{ fontSize: "13px" }}>
                目前第 <strong>{state.pageIndex + 1}</strong> / {pageOptions.length} 頁 ，每頁顯示
                <select
                  className="form-select d-inline-block ms-1"
                  style={{ width: "auto", fontSize: "13px" }}
                  value={state.pageSize}
                  onChange={e => setPageSize(Number(e.target.value))}
                >
                  {[10, 20, 50, 100].map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                筆
              </div>
              <ul className="pagination mb-0">
                <li className={`page-item ${!canPreviousPage ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => gotoPage(0)}>&laquo;</button>
                </li>
                <li className={`page-item ${!canPreviousPage ? "disabled" : ""}`}>
                  <button className="page-link" onClick={previousPage}>上一頁</button>
                </li>
                <li className={`page-item ${!canNextPage ? "disabled" : ""}`}>
                  <button className="page-link" onClick={nextPage}>下一頁</button>
                </li>
                <li className={`page-item ${!canNextPage ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => gotoPage(pageCount - 1)}>&raquo;</button>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPointTypeList;