import { useEffect, useMemo, useState } from "react";
import Navbar from "./components/AdminNavbar";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "bootstrap/dist/css/bootstrap.min.css";

// 全欄位搜尋
function GlobalFilter({ globalFilter, setGlobalFilter }) {
  return (
    <input
      className="form-control"
      style={{ maxWidth: 200, display: "inline-block", fontSize: "14px"}}
      value={globalFilter || ""}
      onChange={e => setGlobalFilter(e.target.value)}
      placeholder="關鍵字搜尋…"
    />
  );
}

// 時間區間搜尋
function DateRangeFilter({ startDate, endDate, setStartDate, setEndDate }) {
  return (
    <div className="d-flex align-items-center gap-2 mb-2">
      <span style={{ fontSize: "14px" }}>時間區間：</span>
      <input
        type="datetime-local"
        className="form-control"
        style={{ maxWidth: 170, fontSize: "14px"}}
        value={startDate}
        onChange={e => setStartDate(e.target.value)}
      />
      <span style={{ fontSize: "14px" }}>～</span>
      <input
        type="datetime-local"
        className="form-control"
        style={{ maxWidth: 170, fontSize: "14px" }}
        value={endDate}
        onChange={e => setEndDate(e.target.value)}
      />
    </div>
  );
}

function AdminPointListPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(""); // 區間搜尋起
  const [endDate, setEndDate] = useState(""); // 區間搜尋訖

  // 載入所有點數紀錄
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8081/admin/point-list", {
        credentials: "include",
      });
      const resData = await res.json();
      if (res.ok && resData.status === 200) {
        setLogs(resData.data || []);
      } else {
        alert("載入失敗：" + (resData.message ?? "未知錯誤"));
      }
    } catch (err) {
      alert("歷程錯誤：" + err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // === react-table 欄位設定 ===
  const columns = useMemo(() => [
    { Header: "紀錄編號", accessor: "logId" },
    { Header: "會員編號", accessor: "memberId", Cell: ({ value }) => value || "-" },
    { Header: "會員姓名", accessor: "memberName", Cell: ({ value }) => value || "-" },
    { Header: "點數項目", accessor: "typeName" },
    {
      Header: "點數種類", accessor: "category",
      Cell: ({ value }) => value === "ADD" ? "派發" : "消耗"
    },
    {
      Header: "原始點數", accessor: "originalPoints",
      Cell: ({ row }) => row.original.category === "ADD" ? row.original.originalPoints : "-"
    },
    {
      Header: "剩餘點數", accessor: "remainPoints",
      Cell: ({ row }) => row.original.category === "ADD" ? (row.original.remainPoints ?? "-") : "-"
    },
    {
      Header: "扣除點數",
      Cell: ({ row }) => row.original.category === "CONSUME" ? row.original.originalPoints : "-"
    },
    {
      Header: "扣點來源",
      Cell: ({ row }) =>
        row.original.category === "CONSUME"
          ? (row.original.consumeFromLogIds || []).join(", ")
          : "-"
    },
    { Header: "備註", accessor: "note", Cell: ({ value }) => value || "-" },
    { Header: "操作人員", accessor: "adminName" },
    { Header: "來源單位", accessor: "unit", Cell: ({ value }) => value || "-" },
    {
      Header: "建立時間",
      accessor: "createdAt",
      Cell: ({ value }) => value ? value.slice(0, 19).replace("T", " ") : "-"
    },
    {
      Header: "到期時間",
      Cell: ({ row }) =>
        row.original.category === "ADD" && row.original.expiredAt
          ? row.original.expiredAt.slice(0, 19).replace("T", " ")
          : "-"
    }
  ], []);

  // 時間區間搜尋過濾
  const filteredLogs = useMemo(() => {
    if (!startDate && !endDate) return logs;
    return logs.filter(log => {
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
  }, [logs, startDate, endDate]);

  // === react-table instance ===
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state,
    setGlobalFilter,
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
      data: filteredLogs,
      initialState: { pageIndex: 0, pageSize: 10 }
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  // 匯出 Excel
  const exportExcel = () => {
    const data = filteredLogs.map(log => ({
      "紀錄編號": log.logId,
      "會員編號": log.memberId || "-",
      "會員姓名": log.memberName || "-",
      "點數項目": log.typeName,
      "點數種類": log.category === "ADD" ? "派發" : "消耗",
      "原始點數": log.category === "ADD" ? log.originalPoints : "-",
      "剩餘點數": log.category === "ADD" ? log.remainPoints ?? "-" : "-",
      "扣除點數": log.category === "CONSUME" ? log.originalPoints : "-",
      "扣點來源": log.category === "CONSUME" ? (log.consumeFromLogIds || []).join(", ") : "-",
      "備註": log.note || "-",
      "操作人員": log.adminName,
      "來源單位": log.unit || "-",
      "建立時間": log.createdAt?.slice(0, 19).replace("T", " "),
      "到期時間":
        log.category === "ADD" && log.expiredAt
          ? log.expiredAt.slice(0, 19).replace("T", " ")
          : "-"
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "點數紀錄");
    const wbout = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "點數紀錄.xlsx");
  };

  // === 畫面 ===
  return (
    <div>
      <Navbar />
      <div className="container py-4">
        <h5>點數紀錄列表</h5>
        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-2">
          <GlobalFilter
            globalFilter={state.globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
          <button className="btn btn-light ms-auto" onClick={exportExcel}>
            匯出 Excel
          </button>
        </div>
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
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          fontSize: "13px"
                        }}
                      >
                        {column.render("Header")}
                        <span>
                          {column.isSorted
                            ? column.isSortedDesc
                              ? " ▼"
                              : " ▲"
                            : ""}
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {page.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center">
                      查無資料
                    </td>
                  </tr>
                ) : (
                  page.map(row => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()}>
                        {row.cells.map(cell => (
                          <td
                            {...cell.getCellProps()}
                            style={{ fontSize: "13px" }}
                          >
                            {cell.render("Cell")}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            {/* 分頁按鈕 */}
            <div className="d-flex justify-content-between align-items-center">
              <div style={{ fontSize: "13px" }}>
                目前第 <strong>{state.pageIndex + 1}</strong> / {pageOptions.length} 頁
                ，每頁顯示
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

export default AdminPointListPage;
