import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/AdminNavbar";
import GlobalFilter from "./components/GlobalFilter";
import DateRangeFilter from "./components/DateRangeFilter";
import StatusFilter from "./components/StatusFilter";
import { API_BASE } from "../config";
import { showAlert, showConfirm } from "../utils/alert";

import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import "bootstrap/dist/css/bootstrap.min.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function AdminMemberList() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ACTIVE");
  const [globalFilter, setGlobalFilter] = useState("");
  const [startDate, setStartDate] = useState(""); // 區間搜尋起
  const [endDate, setEndDate] = useState("");     // 區間搜尋訖

  // 載入會員
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/member`, {
        method: "GET",
        credentials: "include",
      });
      const resData = await res.json();
      if (res.ok && resData.status === 200) {
        setMembers(resData.data);
      } else {
        showAlert({ title: "載入會員失敗", text: resData.message || "", icon: "error" });
      }
    } catch (err) {
      showAlert({ title: "錯誤", text: err.message, icon: "error" });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // 分頁＆搜尋前的篩選
  const filteredMembers = useMemo(() => {
    let data = members;
    // 狀態篩選
    if (filterStatus !== "ALL") {
      data = data.filter((m) => filterStatus === "ACTIVE" ? m.active : !m.active);
    }
    // 時間區間篩選（依建立時間）
    if (startDate || endDate) {
      data = data.filter((m) => {
        if (!m.createdAt) return false;
        const created = new Date(m.createdAt.slice(0, 10));
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (start && end) return created >= start && created <= end;
        if (start) return created >= start;
        if (end) return created <= end;
        return true;
      });
    }
    // 關鍵字搜尋
    if (globalFilter.trim() !== "") {
      const keyword = globalFilter.trim().toLowerCase();
      data = data.filter(
        (m) =>
          m.memberId.toLowerCase().includes(keyword) ||
          (m.lastName + m.firstName).toLowerCase().includes(keyword) ||
          (m.email || "").toLowerCase().includes(keyword) ||
          (m.phoneNumber || "").toLowerCase().includes(keyword) ||
          (m.region || "").toLowerCase().includes(keyword)
      );
    }
    return data;
  }, [members, filterStatus, globalFilter, startDate, endDate]);
  
  // react-table 欄位
  const columns = useMemo(
    () => [
      { Header: "會員編號", accessor: "memberId" },
      { Header: "姓名", accessor: row => row.lastName + row.firstName, id: "fullName" },
      {
        Header: "性別", accessor: "gender",
        Cell: ({ value }) => (value === "MALE" ? "男" : "女"),
      },
      { Header: "電話", accessor: "phoneNumber" },
      { Header: "生日", accessor: "birthDate", Cell: ({ value }) => value || "-" },
      {
        Header: "等級", accessor: "level",
        Cell: ({ value }) =>
          value === "PASSER" ? "非正式" :
          value === "FORMAL" ? "正式" : "-"
      },
      {
        Header: "Email",
        accessor: "email",
        Cell: ({ value }) => <span style={{ wordBreak: "break-all" }}>{value}</span>
      },
      { Header: "地區", accessor: "region" },
      { Header: "剩餘點數", accessor: "remainPoint", Cell: ({ value }) => value ?? 0 },
      { Header: "是否啟用", accessor: "active", Cell: ({ value }) => value ? "是" : "否" },
      {
        Header: "建立時間",
        accessor: "createdAt",
        Cell: ({ value }) => value?.slice(0, 10),
      },
      {
        Header: "點數管理",
        id: "managePoint",
        Cell: ({ row }) => (
          <button
            className="btn btn-sm"
            onClick={() =>
              navigate(`/admin/member/${row.original.memberId}/point`, {
                state: { memberName: row.original.lastName + row.original.firstName }
              })
            }
          >
            點數管理
          </button>
        ),
      },
      {
        Header: "啟用/停用",
        id: "toggleActive",
        Cell: ({ row }) => (
          <button
            className={`btn btn-sm ${row.original.active ? "btn-disable-solid" : "btn-enable-solid"}`}
            onClick={async () => {
              const result = await showConfirm({
                title: row.original.active ? "確定要停用該會員？" : "確定要重新啟用該會員？",
                icon: "warning",
                confirmButtonText: "確定",
                cancelButtonText: "取消",
              });
              if (!result.isConfirmed) return;
              try {
                const res = await fetch(
                  `https://localhost:8443/admin/member/${row.original.memberId}/toggle-active`,
                  {
                    method: "PATCH",
                    credentials: "include",
                  }
                );
                const resData = await res.json();
                if (res.ok && resData.status === 200) {
                  showAlert({ title: "狀態切換成功！", icon: "success" });
                  fetchMembers(); // 重新載入
                } else {
                  showAlert({ title: "切換失敗", text: resData.message || "", icon: "error" });
                }
              } catch (err) {
                showAlert({ title: "錯誤", text: err.message, icon: "error" });
              }
            }}
          >
            {row.original.active ? "停用" : "啟用"}
          </button>
        ),
      },
    ],
    [navigate]
  );

  // react-table
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
      data: filteredMembers,
      initialState: { pageIndex: 0, pageSize: 10 }
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  // 匯出 Excel
  const exportExcel = () => {
    const data = members
      .filter((m) =>
        filterStatus === "ALL"
          ? true
          : filterStatus === "ACTIVE"
          ? m.active
          : !m.active
      )
      .map((m) => ({
        "會員編號": m.memberId,
        "姓名": m.lastName + m.firstName,
        "性別": m.gender === "MALE" ? "男" : "女",
        "電話": m.phoneNumber,
        "生日": m.birthDate || "-",
        "等級":
          m.level === "PASSER"
            ? "非正式"
            : m.level === "FORMAL"
            ? "正式"
            : "-",
        "Email": m.email,
        "地區": m.region,
        "剩餘點數": m.remainPoint ?? 0,
        "是否啟用": m.active ? "是" : "否",
        "建立時間": m.createdAt?.slice(0, 10) ?? "-",
      }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "會員列表");
    const wbout = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "會員列表.xlsx");
  };

  return (
    <div>
      <Navbar />
      <div className="container py-4">
        <h5 className="mb-3">會員管理列表</h5>

        {/* 篩選、搜尋 */}
        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-2">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
        </div>
        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-2">
          <StatusFilter filterStatus={filterStatus} setFilterStatus={setFilterStatus} />
          <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
        </div>

        {loading ? (
          <p>載入中...</p>
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
        <button className="btn btn-sm me-auto" onClick={exportExcel}>
          匯出 Excel
        </button>
      </div>
    </div>
  );
}

export default AdminMemberList;