export default function StatusFilter({ filterStatus, setFilterStatus }) {
  return (
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
  );
}
