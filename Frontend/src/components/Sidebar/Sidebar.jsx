import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🔒</div>

        <div>
          <h2>Smart Locker</h2>
          <span>Gestão de armários</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/armarios"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          Armários
        </NavLink>

        <NavLink
          to="/admin/funcionarios"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          Funcionários
        </NavLink>

        <NavLink
          to="/admin/lista-espera"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          Lista de Espera
        </NavLink>

        <NavLink
          to="/admin/achados-perdidos"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          Achados e Perdidos
        </NavLink>

        <NavLink
          to="/admin/chaves"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          Chaves
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">AD</div>

          <div>
            <strong>Administrador</strong>
            <span>admin@empresa.com.br</span>
          </div>
        </div>

        <NavLink to="/" className="sidebar-logout">
          Sair
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;