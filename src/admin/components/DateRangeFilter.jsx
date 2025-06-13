export default function DateRangeFilter({ startDate, endDate, setStartDate, setEndDate, label = "時間區間：" }) {
  return (
    <div className="d-flex align-items-center gap-2 mb-2">
      <span style={{ fontSize: "14px" }}>{label}</span>
      <input
        type="datetime-local"
        className="form-control"
        style={{ maxWidth: 170, fontSize: "14px" }}
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
