import Navbar from "./components/AdminNavbar";
import { useState, useEffect } from "react";
import DateRangeFilter from "./components/DateRangeFilter";
import { API_BASE } from "../config";

function AdminHomePage() {
  // 六個數字的 state
  const [memberCount, setMemberCount] = useState(null);
  const [formalMemberCount, setFormalMemberCount] = useState(null);
  const [totalIssued, setTotalIssued] = useState(null);
  const [totalConsumed, setTotalConsumed] = useState(null);
  const [unredeemedPoints, setUnredeemedPoints] = useState(null);
  const [expiredPoints, setExpiredPoints] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // fetch 一次全 summary
  const fetchDashboardSummary = async (start, end) => {
    setLoading(true);
    try {
      let url = `${API_BASE}/admin/dashboard`;
      const params = [];
      if (start) params.push(`start=${encodeURIComponent(start)}`);
      if (end) params.push(`end=${encodeURIComponent(end)}`);
      if (params.length > 0) url += "?" + params.join("&");

      const res = await fetch(url, { credentials: "include" });
      const resData = await res.json();
      if (res.ok && resData.status === 200 && resData.data) {
        setMemberCount(resData.data.memberCount);
        setFormalMemberCount(resData.data.formalMemberCount);
        setTotalIssued(resData.data.addedPoints);
        setTotalConsumed(resData.data.consumedPoints);
        setUnredeemedPoints(resData.data.unredeemedPoints);
        setExpiredPoints(resData.data.expiredPoints);
      } else {
        setMemberCount(null);
        setFormalMemberCount(null);
        setTotalIssued(null);
        setTotalConsumed(null);
        setUnredeemedPoints(null);
        setExpiredPoints(null);
      }
    } catch (err) {
      setMemberCount(null);
      setFormalMemberCount(null);
      setTotalIssued(null);
      setTotalConsumed(null);
      setUnredeemedPoints(null);
      setExpiredPoints(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  const handleFilter = () => {
    fetchDashboardSummary(startDate, endDate);
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    fetchDashboardSummary();
  };

  return (
    <>
      <Navbar />
      <div className="container py-4">
        <h5 className="mb-4">總覽</h5>
        {/* 篩選器 */}
        <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            label="設定查詢時段："
          />
          <button className="btn btn-sm btn-brand" onClick={handleFilter}>查詢</button>
          <button className="btn btn-sm btn-outline-brand" onClick={handleReset}>重設</button>
        </div>
        {/* 第一行：會員總數、正式會員總數 */}
        <div className="row mb-3">
          <div className="col-md-6 mb-2">
            <div className="border rounded p-3 bg-white shadow-sm h-100">
              <div className="fs-7 text-secondary mb-1" style={{ fontSize: "13px" }}>
                所有會員總數
              </div>
              <div className="text-center fw-bold" style={{ fontSize: "2rem", color: "#1F5673" }}>
                {loading ? "載入中..." : memberCount ?? "-"}
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-2">
            <div className="border rounded p-3 bg-white shadow-sm h-100">
              <div className="fs-7 text-secondary mb-1" style={{ fontSize: "13px" }}>
                正式會員總數
              </div>
              <div className="text-center fw-bold" style={{ fontSize: "2rem", color: "#1F5673" }}>
                {loading ? "載入中..." : formalMemberCount ?? "-"}
              </div>
            </div>
          </div>
        </div>
        {/* 第二行：派發總點數、剩餘未核銷點數 */}
        <div className="row mb-3">
          <div className="col-md-6 mb-2">
            <div className="border rounded p-3 bg-white shadow-sm h-100">
              <div className="fs-7 text-secondary mb-1" style={{ fontSize: "13px" }}>
                派發總點數
              </div>
              <div className="text-center fw-bold" style={{ fontSize: "2rem", color: "#3D6E73" }}>
                {totalIssued ?? "-"}
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-2">
            <div className="border rounded p-3 bg-white shadow-sm h-100">
              <div className="fs-7 text-secondary mb-1" style={{ fontSize: "13px" }}>
                剩餘未核銷點數
              </div>
              <div className="text-center fw-bold" style={{ fontSize: "2rem", color: "#736029" }}>
                {unredeemedPoints ?? "-"}
              </div>
            </div>
          </div>
        </div>
        {/* 第三行：消耗點數、過期點數 */}
        <div className="row mb-3">
          <div className="col-md-6 mb-2">
            <div className="border rounded p-3 bg-white shadow-sm h-100">
              <div className="fs-7 text-secondary mb-1" style={{ fontSize: "13px" }}>
                會員消耗總點數
              </div>
              <div className="text-center fw-bold" style={{ fontSize: "2rem", color: "#90484C" }}>
                {totalConsumed ?? "-"}
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-2">
            <div className="border rounded p-3 bg-white shadow-sm h-100">
              <div className="fs-7 text-secondary mb-1" style={{ fontSize: "13px" }}>
                到期自動扣除點數
              </div>
              <div className="text-center fw-bold" style={{ fontSize: "2rem", color: "#90484C" }}>
                {expiredPoints ?? "-"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminHomePage;
