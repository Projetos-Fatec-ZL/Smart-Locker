import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Botão de Menu Hambúrguer para telas menores */}
      <button
        className="mobile-menu-btn"
        onClick={toggleSidebar}
        aria-label="Abrir Menu"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Overlay escuro para fechar o menu ao clicar fora no celular */}
      {isOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      {/* Sidebar principal */}
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🔒</div>

          <div>
            <h2>Smart Locker</h2>
            <span>Gestão de armários</span>
          </div>
        </div>

        <nav className="sidebar-menu" onClick={closeSidebar}>
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

          <NavLink to="/" className="sidebar-logout" onClick={closeSidebar}>
            Sair
          </NavLink>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
