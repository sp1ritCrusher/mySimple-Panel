import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as adminApi from "../../api/admin.js";
import { Pencil } from "lucide-react";
import Alert from "../../components/ui/Alert.jsx";

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .listUsers()
      .then((data) => setUsers(Array.isArray(data.user) ? data.user : []))
      .catch((err) => setError(err.message || "Erro ao listar usuários"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="page-header__eyebrow">Admin</p>
          <h1>Controle de usuários</h1>
        </div>
      </header>

      {error && <Alert type="error">{error}</Alert>}
      {loading ? (
        <p className="muted">Carregando...</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Status</th>
                <th>Perfil</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.status}</td>
                  <td>{u.power}</td>
                  <td><button onClick={() => navigate(`/app/admin/editUser/${u.id}`)}><Pencil size={16}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
