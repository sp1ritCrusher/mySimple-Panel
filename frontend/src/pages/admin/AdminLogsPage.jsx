import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as adminApi from "../../api/admin.js";
import Alert from "../../components/ui/Alert.jsx";

const domainLabels = {
  auth: "Autenticação",
  admin: "Administrador",
  user: "Usuário",
  product: "Produto",
  system: "Sistema",
};

export default function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .listLogs()
      .then((data) => setLogs(data.logs || []))
      .catch((err) => setError(err.message || "Erro ao carregar logs"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="page-header__eyebrow">Admin</p>
          <h1>Auditoria</h1>
        </div>
      </header>

      {error && <Alert type="error">{error}</Alert>}

      {loading ? (
        <p className="muted">Carregando...</p>
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <h3>Nenhum log registrado</h3>
        </div>
      ) : (
        <div className="log-list">
          {logs.map((log) => (
            <article key={log.id} className="log-item">
              <div>
                <strong>{log.actioner}</strong>
                <span className="log-item__badge">{domainLabels[log.domain] || log.domain}</span>
              </div>
              <p>{log.action}</p>
              <small>
                {new Date(log.created_at).toLocaleString("pt-BR")} ·{" "}
                <Link to={`/app/admin/logs/${log.id}`}>Detalhes</Link>
              </small>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
