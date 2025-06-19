import { useEffect, useMemo, useState } from "react";
import Navbar from "./components/AdminNavbar";
import AdminPointTypeManageModal from "./components/AdminPointTypeManageModal";
import StatusFilter from "./components/StatusFilter";
import { API_BASE } from "../config";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import "bootstrap/dist/css/bootstrap.min.css";
import { showAlert, showConfirm } from "../utils/alert";

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

function AdminPointTypeList() {
  const [pointTypes, setPointTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ACTIVE");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [modalData, setModalData] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");

  // 載入所有點數類型
  const fetchPointTypes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/point-types`, {
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

  // 搜尋&狀態篩選
  const filteredPointTypes = useMemo(() => {
    let data = pointTypes;
    if (filterStatus === "ACTIVE") {
      data = data.filter(pt => pt.active);
    } else if (filterStatus === "INACTIVE") {
      data = data.filter(pt => !pt.active);
    }
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
              onClick={() => {
                setModalMode("edit");
                setModalData(row.original);
                setShowModal(true);
              }}
            >
              編輯
            </button>
          ) : null,
      },
    ],
    []
  );

  // react-table 實例
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

  // Modal 送出處理
  const handleModalSubmit = async (formData) => {
    try {
      const url =
        modalMode === "add"
          ? `${API_BASE}/admin/point-types`
          : `${API_BASE}/admin/point-types/${modalData.typeId}`;
      const method = modalMode === "add" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          defaultValue: Number(formData.defaultValue),
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === 200) {
        showAlert({ title: modalMode === "add" ? "新增成功！" : "修改成功！", icon: "success" });
        setShowModal(false);
        fetchPointTypes();
      } else {
        showAlert({ title: modalMode === "add" ? "新增失敗" : "修改失敗", text: data.message || "", icon: "error" });
      }
    } catch (err) {
      showAlert({ title: "請求錯誤", text: err.message, icon: "error" });
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container py-4">
        <h5 className="mb-2">點數類型管理列表</h5>
        {/* 新增按鈕 */}
        <div className="mt-3 mb-3">
          <button
            className="btn btn-brand"
            onClick={() => {
              setModalMode("add");
              setModalData(null);
              setShowModal(true);
            }}
          >
            新增類型
          </button>
        </div>

        {/* 篩選、搜尋 */}
        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-2">
          <StatusFilter filterStatus={filterStatus} setFilterStatus={setFilterStatus} />
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

        {/* 新增/編輯 Modal */}
        <AdminPointTypeManageModal
          show={showModal}
          onClose={() => setShowModal(false)}
          mode={modalMode}
          data={modalData}
          onSubmit={handleModalSubmit}
        />
      </div>
    </div>
  );
}

export default AdminPointTypeList;