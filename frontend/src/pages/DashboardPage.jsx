import { useAuth } from "../context/AuthContext.jsx";
import { useEffect, useMemo, useState } from "react";
import * as productsApi from "../api/products.js";
export default function DashboardPage() {
const { user } = useAuth();
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

async function load() {
    setLoading(true);
    setError("");
    try {
        const data = await productsApi.listProducts();
        console.log(data);
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

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="page-header__eyebrow">Painel</p>
          <h1>Olá, {user?.name?.split(" ")[0] || "usuário"}</h1>
        </div>
      </header>

      <section className="dashboard-empty">
        <div className="dashboard-empty__card">
          <h2>Dashboard em construção</h2>
          <p>
            Em breve você verá resumos do estoque aqui — totais, produtos com
            estoque baixo e indicadores do seu negócio.
          </p>
          <p className="dashboard-empty__hint">
            Por enquanto, use <strong>Produtos</strong> no menu para gerenciar seu catálogo.
          </p>
        </div>

        <div className="dashboard-empty__grid">
          <article className="stat-card stat-card--placeholder">
            <span>Produtos cadastrados</span>
            <strong>{products.length}</strong>
          </article>
          <article className="stat-card stat-card--placeholder">
            <span>Estoque baixo</span>
            <strong>—</strong>
          </article>
          <article className="stat-card stat-card--placeholder">
            <span>Última movimentação</span>
            <strong>—</strong>
          </article>
        </div>
      </section>
    </div>
  );
}
