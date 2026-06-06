export default function Input({ label, error, id, ...props }) {
  const inputId = id || props.name;
  return (
    <label className="field" htmlFor={inputId}>
      {label && <span className="field__label">{label}</span>}
      <input id={inputId} className={`field__input ${error ? "field__input--error" : ""}`} {...props} />
      {error && <span className="field__error">{error}</span>}
    </label>
  );
}
