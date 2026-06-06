import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import * as adminApi from "../../api/admin.js";
import Alert from "../../components/ui/Alert.jsx";

export default function AdminLogDetailPage() {
  const { id } = useParams();
  const [log, setLog] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi
      .getLogById(id)
      .then((data) => setLog(data.log))
      .catch((err) => setError(err.message || "Log não encontrado"));
  }, [id]);

  if (error) return <Alert type="error">{error}</Alert>;
  if (!log) return <p className="muted">Carregando...</p>;

  let parsedData = log.data;
  if (typeof parsedData === "string") {
    try {
      parsedData = JSON.parse(parsedData);
    } catch {
      /* keep string */
    }
  }

  return (
    <div className="page page--narrow">
      <Link to="/app/admin/logs" className="auth-page__back">
        ← Voltar aos logs
      </Link>
      <header className="page-header">
        <h1>Log #{log.id}</h1>
      </header>
      <dl className="info-list">
        <div>
          <dt>Acionador</dt>
          <dd>{log.actioner}</dd>
        </div>
        <div>
          <dt>Ação</dt>
          <dd>{log.action}</dd>
        </div>
        <div>
          <dt>Domínio</dt>
          <dd>{log.domain}</dd>
        </div>
        <div>
          <dt>IP</dt>
          <dd>{log.ip}</dd>
        </div>
        <div>
          <dt>Sessão</dt>
          <dd>{log.session || "—"}</dd>
        </div>
        <div>
          <dt>Data</dt>
          <dd>{new Date(log.created_at).toLocaleString("pt-BR")}</dd>
        </div>
        {parsedData && (
          <div>
            <dt>Dados</dt>
            <dd>
              <pre className="log-data-pre">{JSON.stringify(parsedData, null, 2)}</pre>
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
