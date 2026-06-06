import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import Alert from "../components/ui/Alert.jsx";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    refreshUser().catch((err) => setError(err.message));
  }, [refreshUser]);

  if (!user) return null;

  const providers = Array.isArray(user.provider)
    ? user.provider.join(", ")
    : typeof user.provider === "string"
      ? user.provider
      : "—";

  return (
    <div className="page page--narrow">
      <header className="page-header">
        <div>
          <p className="page-header__eyebrow">Conta</p>
          <h1>Meus dados</h1>
        </div>
      </header>

      {error && <Alert type="error">{error}</Alert>}

      <dl className="info-list">
        <div>
          <dt>Nome</dt>
          <dd>{user.name}</dd>
        </div>
        <div>
          <dt>E-mail</dt>
          <dd>{user.email}</dd>
        </div>
        <div>
          <dt>Telefone</dt>
          <dd>{user.phone || "—"}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{user.status}</dd>
        </div>
        <div>
          <dt>Provedores</dt>
          <dd>{providers}</dd>
        </div>
        <div>
          <dt>Perfil</dt>
          <dd>{user.power}</dd>
        </div>
      </dl>
    </div>
  );
}
