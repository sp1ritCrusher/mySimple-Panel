import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as authApi from "../api/auth.js";
import { useAuth } from "../context/AuthContext.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Alert from "../components/ui/Alert.jsx";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      await authApi.updateProfile(form);
      await refreshUser();
      setMessage("Dados atualizados com sucesso.");
    } catch (err) {
      setError(err.message || "Erro ao atualizar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page page--narrow">
      <header className="page-header">
        <div>
          <p className="page-header__eyebrow">Conta</p>
          <h1>Configurações</h1>
        </div>
      </header>

      {message && <Alert type="success">{message}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      <form className="form-card" onSubmit={handleSubmit}>
        <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="E-mail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Button type="submit" disabled={submitting}>
          Salvar alterações
        </Button>
      </form>

      <section className="form-card settings-extra">
        <h3>Senha</h3>
        <p className="muted">Altere sua senha atual informando a senha antiga.</p>
        <Link to="/app/change-password" className="btn btn--ghost">
          Alterar senha
        </Link>
      </section>
    </div>
  );
}
