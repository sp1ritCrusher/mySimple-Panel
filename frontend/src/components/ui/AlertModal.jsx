export default function AlertModal({
  open,
  title,
  message,
  continueText = "Confirmar",
  onContinue
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>{title}</h2>

        <p>{message}</p>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onContinue}
          >
            {continueText}
          </button>
        </div>
      </div>
    </div>
  );
}