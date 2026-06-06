import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const navItems = [
  { to: "/app", label: "Início", end: true },
  { to: "/app/products", label: "Produtos" },
  { to: "/app/profile", label: "Meus dados" },
  { to: "/app/settings", label: "Configurações" },
];

const adminItems = [
  { to: "/app/admin/users", label: "Usuários" },
  { to: "/app/admin/logs", label: "Auditoria" },
];

export default function AppLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-brand">
          <span className="app-brand__mark">msp</span>
          <div>
            <strong>mySimple Panel</strong>
            <small>Gestão simples</small>
          </div>
        </div>

        <nav className="app-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `app-nav__link ${isActive ? "app-nav__link--active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
          {isAdmin && (
            <>
              <p className="app-nav__section">Administração</p>
              {adminItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `app-nav__link ${isActive ? "app-nav__link--active" : ""}`}
                >
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="app-sidebar__footer">
          <p className="app-user-name">{user?.name}</p>
          <button type="button" className="btn btn--ghost btn--sm" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
