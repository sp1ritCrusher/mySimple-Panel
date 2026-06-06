import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as productsApi from "../api/products.js";
import Button from "../components/ui/Button.jsx";
import Alert from "../components/ui/Alert.jsx";

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await productsApi.listProducts();
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message || "Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }, [products, search]);

  async function handleDelete(id, name) {
    if (!window.confirm(`Remover o produto "${name}"?`)) return;
    try {
      await productsApi.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.message || "Erro ao remover");
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="page-header__eyebrow">Estoque</p>
          <h1>Meus produtos</h1>
        </div>
        <Button onClick={() => navigate("/app/products/new")}>+ Novo produto</Button>
      </header>

      {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Buscar por nome ou descrição..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="muted">Carregando...</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <h3>Nenhum produto encontrado</h3>
          <p>{products.length === 0 ? "Cadastre seu primeiro item." : "Ajuste a busca."}</p>
          {products.length === 0 && (
            <Button onClick={() => navigate("/app/products/new")}>Cadastrar produto</Button>
          )}
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Preço</th>
                <th>Qtd</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.description}</td>
                  <td>{Number(item.price).toFixed(2)} R$</td>
                  <td>{item.amount}</td>
                  <td className="data-table__actions">
                    <Link to={`/app/products/${item.id}/edit`} className="link-btn">
                      Editar
                    </Link>
                    <button
                      type="button"
                      className="link-btn link-btn--danger"
                      onClick={() => handleDelete(item.id, item.name)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
