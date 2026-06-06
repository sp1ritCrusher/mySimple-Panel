export default function Alert({ type = "info", children, onClose }) {
  return (
    <div className={`alert alert--${type}`} role="alert">
      <span>{children}</span>
      {onClose && (
        <button type="button" className="alert__close" onClick={onClose} aria-label="Fechar">
          ×
        </button>
      )}
    </div>
  );
}
