import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as authApi from "../api/auth.js";
import { ApiError } from "../api/client.js";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Alert from "../components/ui/Alert.jsx";
import {
  isValidEmail,
  isValidName,
  isValidPassword,
  isValidPhone,
} from "../utils/validation.js";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  const valid =
    isValidName(form.name) &&
    isValidEmail(form.email) &&
    isValidPassword(form.password) &&
    isValidPhone(form.phone);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await authApi.registerUser(form);
      sessionStorage.setItem("intentionContext", "register");
      navigate("/validate-code");
    } catch (err) {
      if (err instanceof ApiError && err.code === "USER_ALREADY_REGISTERED") {
        setError("Este e-mail já está cadastrado. Faça login ou recupere o acesso.");
      } else {
        setError(err.message || "Erro ao cadastrar");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-page__card auth-page__card--wide">
        <Link to="/" className="auth-page__back">
          ← Voltar
        </Link>
        <h1>Criar conta</h1>
        <p className="auth-card__subtitle">Preencha seus dados para começar</p>

        {error && <Alert type="error">{error}</Alert>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <Input label="Nome completo" value={form.name} onChange={update("name")} placeholder="Sem espaços, mín. 6 caracteres" />
          <Input label="E-mail" type="email" value={form.email} onChange={update("email")} />
          <Input label="Senha" type="password" value={form.password} onChange={update("password")} placeholder="8+ caracteres, 4 números e letras" />
          <Input label="Telefone" value={form.phone} onChange={update("phone")} placeholder="Somente números (10–11)" />
          <Button type="submit" disabled={!valid || submitting}>
            {submitting ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
