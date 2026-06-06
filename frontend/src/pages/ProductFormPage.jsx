import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as productsApi from "../api/products.js";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Alert from "../components/ui/Alert.jsx";
import { isValidProduct } from "../utils/validation.js";

const empty = { name: "", description: "", price: "", amount: "" };

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    productsApi
      .getProduct(id)
      .then((data) => {
        const p = data.product;
        setForm({
          name: p.name || "",
          description: p.description || "",
          price: String(p.price ?? ""),
          amount: String(p.amount ?? ""),
        });
      })
      .catch((err) => setError(err.message || "Produto não encontrado"))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  const valid = isValidProduct(form);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      amount: Number(form.amount),
    };

    try {
      if (isEdit) {
        await productsApi.updateProduct(id, payload);
      } else {
        await productsApi.createProduct(payload);
      }
      navigate("/app/products");
    } catch (err) {
      setError(err.message || "Erro ao salvar");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="muted">Carregando...</p>;

  return (
    <div className="page page--narrow">
      <header className="page-header">
        <div>
          <p className="page-header__eyebrow">Estoque</p>
          <h1>{isEdit ? "Editar produto" : "Novo produto"}</h1>
        </div>
      </header>

      {error && <Alert type="error">{error}</Alert>}

      <form className="form-card" onSubmit={handleSubmit}>
        <Input label="Nome" value={form.name} onChange={update("name")} />
        <Input label="Descrição" value={form.description} onChange={update("description")} />
        <div className="form-row">
          <Input label="Preço (R$)" type="number" min="0" step="0.01" value={form.price} onChange={update("price")} />
          <Input label="Quantidade" type="number" min="0" step="1" value={form.amount} onChange={update("amount")} />
        </div>
        <div className="form-actions">
          <Button type="button" variant="ghost" onClick={() => navigate("/app/products")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!valid || submitting}>
            {submitting ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
