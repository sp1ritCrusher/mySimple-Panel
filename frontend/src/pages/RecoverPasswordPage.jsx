import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as authApi from "../api/auth.js";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Alert from "../components/ui/Alert.jsx";
import { isValidPassword } from "../utils/validation.js";

function RecoverForm() {
  const navigate = useNavigate();
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (newPass !== confirm) {
      setError("As senhas não coincidem");
      return;
    }
    if (!isValidPassword(newPass)) {
      setError("Senha inválida (regras de segurança)");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await authApi.recoverPassword({ newPass });
      navigate("/app");
    } catch (err) {
      setError(err.message || "Erro ao redefinir senha");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <h1>Nova senha</h1>
        <p className="auth-card__subtitle">Defina sua nova senha de acesso</p>
        {error && <Alert type="error">{error}</Alert>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <Input label="Nova senha" type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
          <Input label="Confirmar senha" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <Button type="submit" disabled={submitting}>
            Salvar senha
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function RecoverPasswordPage() {
  return (
    <ProtectedRoute>
      <RecoverForm />
    </ProtectedRoute>
  );
}
