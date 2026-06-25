import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as adminApi from "../../api/admin.js";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import Alert from "../../components/ui/Alert.jsx";
import ConfirmModal from "../../components/ui/ConfirmModal.jsx";
import AlertModal from "../../components/ui/AlertModal.jsx";
import { ArrowLeft } from "lucide-react";

export default function AdminUserEditPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [form, setForm] = useState({ name: "", email: "", phone: "" });
    const [user, setUser] = useState({});
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [proceed, setProceed] = useState(false);

    useEffect(() => {
        adminApi.getUserById(id)
        .then((data) => {
      setForm({
        id: id,
        name: data.user.name || "",
        email: data.user.email || "",
        phone: data.user.phone || "",
      });
    })
    .catch((err) => setError(err.message || "Erro ao verificar usuário"))
    .finally(() => setLoading(false));
}, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      await adminApi.editUser(form);
      setMessage("Dados atualizados com sucesso.");
    } catch (err) {
      setError(err.message || "Erro ao atualizar");
    } finally {
      setSubmitting(false);
    }
  }

async function handle_userRemove() {
  setSubmitting(true);
  setError("");
  setMessage("");

  try {
    await adminApi.removeUser(id);
    setProceed(true);

    setConfirmOpen(false);
  } catch (err) {
    setConfirmOpen(false);
    setError(err.message || "Erro ao remover");
  } finally {
    setSubmitting(false);
  }
}

  return (
    <div className="page page--narrow">

<header className="page-header">

  <div className="page-header__left">

    <button className="back-button" onClick = {() => navigate(`/app/admin/users`)} >
      <ArrowLeft size={22}/>
    </button>

    <div>
      <p className="page-header__eyebrow">Conta</p>
      <h1>Editar Usuário</h1>
    </div>

  </div>

</header>

      {message && <Alert type="success">{message}</Alert>}
      {error && <Alert type="error">{error}</Alert>}


      <form className="form-card" onSubmit={handleSubmit}>
        <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="E-mail" type="email" value={form.email} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Button type="submit">
          Salvar alterações
        </Button>
        <Button type="button" onClick={() => setConfirmOpen(true)}>
          Excluir Usuário
        </Button>
      </form>
    <ConfirmModal
      open={confirmOpen}
      title="Excluir usuário"
      message="Tem certeza de que deseja remover este usuário?"
      confirmText="Excluir"
      cancelText="Cancelar"
      onCancel={() => setConfirmOpen(false)}
      onConfirm={handle_userRemove}
    />
      <AlertModal
        open={proceed}
        title="Concluído"
        message="Usuário removido com sucesso"
        continueText="Ok"
        onContinue={() => navigate(`/app/admin/users`)}
      />
    </div>
  );
}

