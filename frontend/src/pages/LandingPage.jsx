import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as authApi from "../api/auth.js";
import { ApiError } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Alert from "../components/ui/Alert.jsx";
import { isValidEmail, isValidPassword } from "../utils/validation.js";
import { FRONTEND_ORIGIN } from "../config.js";
import { motion } from "framer-motion";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, loading, refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate("/app", { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    function onOAuthMessage(event) {
      if (event.origin !== FRONTEND_ORIGIN) return;
      const data = event.data;
      console.log("DATINHA", data);
      if (!data?.code && !data?.success) return;

      if (data.context === "google" && data.success) {
        refreshUser().then(() => navigate("/app"));
        return;
      }

      if (
        data.code === "PROVIDER_NOT_VALIDATED" ||
        data.code === "USER_LOCAL_REGISTERED"
      ) {
        handleOAuthConflict(data);
      }
    }

    window.addEventListener("message", onOAuthMessage);
    return () => window.removeEventListener("message", onOAuthMessage);
  }, [navigate, refreshUser]);

  async function handleOAuthConflict(data) {
    try {
      if (data.code === "USER_LOCAL_REGISTERED") {
        const merge = window.confirm(
          "Já existe cadastro com este e-mail. Deseja vincular sua conta ao Google?",
        );
        if (!merge) return;
      }
      await authApi.oauthCallback({ code: data.code, userid: data.userid });
      sessionStorage.setItem("intentionContext", "merge");
      navigate("/validate-code");
    } catch (err) {
      setError(err.message || "Erro ao processar login Google");
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    if (!isValidEmail(email)) {
      setError("E-mail inválido");
      return;
    }
    if (!password.trim()) {
      setError("Informe sua senha");
      return;
    }

    setSubmitting(true);
    try {
      await authApi.loginLocal({ email, password });
      await refreshUser();
      navigate("/app");
    } catch (err) {
      if (err instanceof ApiError && err.code === "USER_NOT_VERIFIED") {
        sessionStorage.setItem("intentionContext", "register");
        navigate("/validate-code");
        return;
      }
      setError(err.message || "Não foi possível entrar");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError("");
    try {
      const data = await authApi.startGoogleOAuth();
      if (data.url) {
        window.open(data.url, "LoginGoogle", "width=520,height=640");
      }
    } catch (err) {
      setError(err.message || "Erro ao abrir Google");
    }
  }

  const canSubmit = isValidEmail(email) && password.trim().length > 0;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="landing">
      <section className="landing-hero">
        <div className="landing-hero__content">
          <motion.p
            className="landing-hero__eyebrow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            PARA MICROEMPREENDEDORES
          </motion.p>
          <motion.h1
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 1.6,
              delay: 0.15,
            }}
          >
            Estoque simples,
            <em> gestão inteligente</em>
          </motion.h1>

          <motion.p
            className="landing-hero__text"
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 1.6,
              delay: 0.3,
            }}
          >
            Controle produtos, acompanhe seu negócio e prepare-se para insights
            inteligentes — tudo em um painel leve, feito para quem está
            começando ou crescendo.
          </motion.p>
          <div className="landing-hero__gallery">
          <motion.img
              src="../assets/hero_image.png"
              className="landing-hero__illustration"
              initial={{
                opacity: 0,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 1.8,
              }}
            />
            <motion.img
              src="../assets/hero_products.png"
              className="landing-hero__img"
              initial={{
                opacity: 0,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 1.8,
              }}
            />
          </div>
        </div>
        <div className="landing-hero__glow" aria-hidden />
      </section>
      <section className="landing-auth">
        <motion.div
          initial={{
            opacity: 0,
            x: 30,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.7,
            delay: 0.6,
            ease: "easeOut",
          }}
          className="auth-card"
        >
          <h2>Iniciar sessão</h2>
          <p className="auth-card__subtitle">
            Acesse sua conta ou crie uma nova
          </p>

          {error && (
            <Alert type="error" onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <form className="auth-form" onSubmit={handleLogin}>
            <Input
              label="E-mail"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              autoComplete="email"
            />
            <Input
              label="Senha"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              autoComplete="current-password"
            />
            <Link to="/forgot-password" className="auth-form__link">
              Esqueci minha senha
            </Link>
            <Button
              type="submit"
              disabled={!canSubmit || submitting}
              className="auth-form__submit"
            >
              {submitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="auth-divider">
            <span>ou</span>
          </div>

          <button
            type="button"
            className="btn btn--google"
            onClick={handleGoogle}
          >
            <GoogleIcon />
            Continuar com Google
          </button>

          <p className="auth-card__footer">
            Não tem conta? <Link to="/register">Cadastre-se</Link>
          </p>
        </motion.div>
      </section>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.083 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 29.082 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 29.082 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C39.99 36.858 44 30.858 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}
