import { useState, useEffect, useMemo } from "react";
import Navbar from "./components/AdminNavbar";
import { API_BASE } from "../config";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import "bootstrap/dist/css/bootstrap.min.css";
import GlobalFilter from "./components/GlobalFilter";
import { showAlert, showConfirm } from "../utils/alert";

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
  const [globalFilter, setGlobalFilter] = useState("");

  // 僅能修改不是總管理員
  const isSuperAdmin = editId === "AD00001";

  const fetchAdmins = async () => {
    const res = await fetch(`${API_BASE}/admin/manage-admins`, {
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok) setAdmins(data.data);
  };

  useEffect(() => {
    fetchAdmins();

    // 抓部門 enum
    fetch(`${API_BASE}/admin/manage-admins/units`, {
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
        ? `${API_BASE}/admin/manage-admins/${editId}`
        : `${API_BASE}/admin/manage-admins`;
      const method = editMode ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(submitForm),
      });
      const data = await res.json();
      if (res.ok && data.status === 200) {
        showAlert({ title: editMode ? "修改成功！" : "新增成功！", icon: "success" });
        setForm({ username: "", adminName: "", unit: "資訊部", active: true });
        setEditMode(false);
        setEditId(null);
        fetchAdmins();
      } else {
        showAlert({ title: editMode ? "修改失敗" : "新增失敗", text: data.message || "", icon: "error" });
      }
    } catch (err) {
      showAlert({ title: "請求錯誤", text: err.message, icon: "error" });
    }
  };

  const handleEdit = (admin) => {
    if (admin.adminId === "AD00001") {
      showAlert({ title: "總管理員無法被修改", icon: "warning" });
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

  // react-table 欄位設定
  const columns = useMemo(() => [
    { Header: "管理者編號", accessor: "adminId" },
    { Header: "帳號", accessor: "username" },
    { Header: "姓名", accessor: "adminName" },
    { Header: "部門", accessor: "unit" },
    { Header: "是否啟用", accessor: "active", Cell: ({ value }) => value ? "是" : "否" },
    {
      Header: "編輯",
      id: "edit",
      Cell: ({ row }) =>
        row.original.adminId !== "AD00001" ? (
          <button className="btn btn-sm" onClick={() => handleEdit(row.original)}>
            編輯
          </button>
        ) : null,
    },
  ], []);

  // 狀態與搜尋過濾
  const filteredAdmins = useMemo(() => {
    let data = admins.filter(a =>
      filterStatus === "ACTIVE" ? a.active :
      filterStatus === "INACTIVE" ? !a.active : true
    );
    if (globalFilter.trim() !== "") {
      const keyword = globalFilter.trim().toLowerCase();
      data = data.filter(
        (a) =>
          a.adminId.toLowerCase().includes(keyword) ||
          a.username.toLowerCase().includes(keyword) ||
          a.adminName.toLowerCase().includes(keyword) ||
          a.unit.toLowerCase().includes(keyword)
      );
    }
    return data;
  }, [admins, filterStatus, globalFilter]);

  // react-table instance
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
      data: filteredAdmins,
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
        <h5 className="mb-3">後台管理列表</h5>
        {/* 表單 */}
        <form onSubmit={handleSubmit} className="mb-4">
          <fieldset className="border rounded p-3">
            <legend className="float-none w-auto px-2 fs-6">{editMode ? "編輯管理者" : "新增管理者"}</legend>
            <div className="row g-2">
              <div className="col-md-3">
                <label className="form-label">帳號</label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  disabled={editMode || isSuperAdmin}
                  required
                  className="form-control form-control-sm"
                  maxLength={30}
                  placeholder="請輸入帳號"
                />
                <div className="form-text text-muted ms-2">
                  密碼預設為 otterpoint
                </div>
              </div>
              <div className="col-md-3">
                <label className="form-label">姓名</label>
                <input
                  name="adminName"
                  value={form.adminName}
                  onChange={handleChange}
                  disabled={isSuperAdmin}
                  required
                  className="form-control form-control-sm"
                  maxLength={20}
                  placeholder="請輸入姓名"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">部門</label>
                <select
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  disabled={isSuperAdmin}
                  className="form-select form-select-sm"
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
              <div className="col">
                <label className="form-label">啟用狀態</label>
                <select
                  name="active"
                  value={form.active}
                  onChange={handleChange}
                  disabled={isSuperAdmin}
                  className="form-select form-select-sm"
                >
                  <option value="true">啟用</option>
                  <option value="false">停用</option>
                </select>
              </div>
            </div>
            <div className="d-flex justify-content-end mt-3">
              <button type="submit" className="btn btn-sm me-2" disabled={isSuperAdmin}>
                {editMode ? "儲存變更" : "新增管理者"}
              </button>
              {editMode && (
                <button type="button" className="btn btn-sm" onClick={handleCancel} disabled={isSuperAdmin}>
                  取消
                </button>
              )}
            </div>
          </fieldset>
        </form>

        {/* 狀態篩選 + 搜尋 */}
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
            <button
              type="button"
              className={`btn btn-sm ${filterStatus === "ALL" ? "btn-brand" : "btn-outline-brand"}`}
              onClick={() => setFilterStatus("ALL")}
            >
              全部
            </button>
          </div>
          <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} placeholder="搜尋管理者…" />
        </div>

        {/* 管理者列表 */}
        <div className="table-responsive">
          <table className="table table-bordered table-hover table-sm align-middle" {...getTableProps()} style={{ fontSize: "13px" }}>
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
                      {column.isSorted ? (column.isSortedDesc ? " ▼" : " ▲") : ""}
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
      </div>
    </div>
  );
}

export default AdminManagePage;
