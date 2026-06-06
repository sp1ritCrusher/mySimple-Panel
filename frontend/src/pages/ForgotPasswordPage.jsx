import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as authApi from "../api/auth.js";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Alert from "../components/ui/Alert.jsx";
import { isValidEmail } from "../utils/validation.js";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await authApi.resolveIntention({ email, context: "forgot" });
      sessionStorage.setItem("intentionContext", "forgot");
      navigate("/validate-code");
    } catch (err) {
      setError(err.message || "Não foi possível iniciar recuperação");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <Link to="/" className="auth-page__back">
          ← Voltar
        </Link>
        <h1>Esqueci minha senha</h1>
        <p className="auth-card__subtitle">Informe o e-mail da sua conta</p>

        {error && <Alert type="error">{error}</Alert>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" disabled={!isValidEmail(email) || submitting}>
            Enviar código
          </Button>
        </form>
      </div>
    </div>
  );
}
