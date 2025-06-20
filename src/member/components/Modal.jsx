export default function Modal({ show, onClose, children, width = 400 }) {
  if (!show) return null;
  return (
    <div
      className="modal-backdrop"
      style={{
        position: "fixed",
        top: 0, left: 0, width: "100vw", height: "100vh",
        background: "rgba(0,0,0,0.6)",
        zIndex: 2000,
        display: "flex", justifyContent: "center", alignItems: "center"
      }}
      onClick={onClose}
    >
      <div
        className="modal-content"
        style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 8px 24px rgba(0,0,0,.18)",
          padding: "2.5rem 2rem",
          width: width,
          maxWidth: "95vw",
          position: "relative"
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          className="btn-close"
          style={{
            position: "absolute", right: 18, top: 16, opacity: 0.7
          }}
          onClick={onClose}
          aria-label="Close"
        />
        {children}
      </div>
    </div>
  );
}