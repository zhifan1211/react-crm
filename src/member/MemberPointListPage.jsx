import { useEffect, useMemo, useState } from "react";
import Navbar from "./components/MemberNavbar";
import { API_BASE } from "../config";
import {
  useTable,
  useSortBy,
  usePagination,
} from "react-table";
import "bootstrap/dist/css/bootstrap.min.css";
import { showAlert, showConfirm } from "../utils/alert";

function MemberPointListPage() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [nearestExpiry, setNearestExpiry] = useState("-");

  useEffect(() => {
    const fetchPoints = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/member/point`, {
          credentials: "include",
        });
        const data = await res.json();

        if (res.ok && data.status === 200) {
          setPoints(data.data);

          // 有效點數總計
          const totalPoints = data.data
            .filter((p) => p.category === "ADD")
            .reduce((sum, p) => sum + (p.remainPoints || 0), 0);
          setTotal(totalPoints);

          // 最近到期日
          const expiryDates = data.data
            .filter((p) => p.expiredAt)
            .map((p) => new Date(p.expiredAt))
            .sort((a, b) => a - b);
          if (expiryDates.length > 0) {
            setNearestExpiry(expiryDates[0].toLocaleDateString());
          }
        } else {
          showAlert({ title: "取得點數資料失敗", text: data.message || "", icon: "error" });
        }
      } catch (err) {
        showAlert({ title: "伺服器錯誤", icon: "error" });
      }
      setLoading(false);
    };

    fetchPoints();
  }, []);

  // react-table 欄位
  const columns = useMemo(() => [
    { Header: "紀錄編號", accessor: "logId" },
    { Header: "點數項目", accessor: "typeName" },
    {
      Header: "點數種類", accessor: "category",
      Cell: ({ value }) => value === "ADD" ? "派發" : "消耗"
    },
    {
      Header: "原派發點數", accessor: "originalPoints",
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
    { Header: "來源單位", accessor: "unit", Cell: ({ value }) => value || "-" },
    {
      Header: "建立時間",
      accessor: "createdAt",
      Cell: ({ value }) => value ? value.slice(0, 10).replace("T", " ") : "-"
    },
    {
      Header: "到期時間",
      accessor: "expiredAt",
      Cell: ({ value, row }) =>
        row.original.category === "ADD" && value
          ? value.slice(0, 10)
          : "-"
    }
  ], []);

  // react-table instance
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state,
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
      data: points,
      initialState: { pageIndex: 0, pageSize: 10 }
    },
    useSortBy,
    usePagination
  );

  return (
    <div>
      <Navbar />
      <div className="container py-4">
        <h5 className="mb-3">點數明細</h5>
        <div className="row mb-4">
          {/* 有效點數總計 */}
          <div className="col-md-6 mb-2">
            <div className="border rounded p-3 bg-white shadow-sm h-100">
              <div className="fs-7 text-secondary mb-1" style={{ fontSize: "13px" }}>有效點數總計</div>
              <div
                className="text-center fw-bold"
                style={{ fontSize: "2rem", color: "#1F5673"}}
              >
                {total}
              </div>
            </div>
          </div>
          {/* 點數即將到期日 */}
          <div className="col-md-6 mb-2">
            <div className="border rounded p-3 bg-white shadow-sm h-100">
              <div className="fs-7 text-secondary mb-1" style={{ fontSize: "13px" }}>點數即將到期日</div>
              <div
                className="text-center fw-bold"
                style={{ fontSize: "2rem", color: "#90484C"}}
              >
                {nearestExpiry}
              </div>
            </div>
          </div>
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

export default MemberPointListPage;
