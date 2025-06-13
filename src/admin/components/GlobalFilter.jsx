export default function GlobalFilter({ globalFilter, setGlobalFilter, placeholder = "關鍵字搜尋…" }) {
  return (
    <input
      className="form-control"
      style={{ maxWidth: 200, display: "inline-block", fontSize: "14px" }}
      value={globalFilter || ""}
      onChange={e => setGlobalFilter(e.target.value)}
      placeholder={placeholder}
    />
  );
}
