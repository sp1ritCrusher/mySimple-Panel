import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as authApi from "../api/auth.js";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Alert from "../components/ui/Alert.jsx";
import { isValidPassword } from "../utils/validation.js";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValidPassword(newPass)) {
      setError("Nova senha não atende aos requisitos");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await authApi.changePassword({ current, newPass });
      navigate("/app/settings");
    } catch (err) {
      setError(err.message || "Erro ao alterar senha");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page page--narrow">
      <header className="page-header">
        <div>
          <p className="page-header__eyebrow">Segurança</p>
          <h1>Alterar senha</h1>
        </div>
      </header>

      {error && <Alert type="error">{error}</Alert>}

      <form className="form-card" onSubmit={handleSubmit}>
        <Input label="Senha atual" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        <Input label="Nova senha" type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
        <div className="form-actions">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
            Voltar
          </Button>
          <Button type="submit" disabled={submitting}>
            Salvar
          </Button>
        </div>
      </form>
    </div>
  );
}
