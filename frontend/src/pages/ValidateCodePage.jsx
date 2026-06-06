import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as authApi from "../api/auth.js";
import { useAuth } from "../context/AuthContext.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Alert from "../components/ui/Alert.jsx";

export default function ValidateCodePage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const intentionContext = sessionStorage.getItem("intentionContext") || "register";

  async function handleValidate(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await authApi.validateCode(code);
      await refreshUser();
      sessionStorage.removeItem("intentionContext");

      if (intentionContext === "forgot") {
        navigate("/recover-password");
      } else {
        navigate("/app");
      }
    } catch (err) {
      setError(err.message || "Código inválido");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setError("");
    try {
      await authApi.resendCode();
      setMessage("Código reenviado. Verifique seu e-mail.");
    } catch (err) {
      setError(err.message || "Não foi possível reenviar");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <h1>Código de segurança</h1>
        <p className="auth-card__subtitle">
          Digite o código enviado para validar sua{" "}
          {intentionContext === "forgot" ? "recuperação de senha" : "conta"}.
        </p>

        {message && <Alert type="success">{message}</Alert>}
        {error && <Alert type="error">{error}</Alert>}

        <form className="auth-form" onSubmit={handleValidate}>
          <Input
            label="Código"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6 caracteres"
            maxLength={12}
          />
          <Button type="submit" disabled={!code.trim() || submitting}>
            Validar
          </Button>
        </form>

        <button type="button" className="btn btn--ghost auth-form__link-btn" onClick={handleResend}>
          Reenviar código
        </button>

        <p className="auth-card__footer">
          <Link to="/">Voltar ao login</Link>
        </p>
      </div>
    </div>
  );
}
