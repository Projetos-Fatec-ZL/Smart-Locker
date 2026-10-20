

import { NavLink, Outlet } from "react-router-dom";
import {
  Home,
  LockKeyhole,
  List,
  PackageSearch,
  LogOut,
} from "lucide-react";

import AccessibilityControls from "../components/AccessibilityControls/AccessibilityControls";
import "./FuncionarioLayout.css";

function FuncionarioLayout() {
  return (
    <div className="funcionario-layout">
      <aside className="funcionario-sidebar">

        {/* LOGO */}

        <div className="funcionario-logo">
          <div className="funcionario-logo-icon">
            <LockKeyhole size={22} />
          </div>

          <div className="funcionario-logo-text">
            <strong>Smart Locker</strong>
            <span>Gestão de armários</span>
          </div>
        </div>

        {/* PERFIL */}

        <div className="funcionario-perfil">
          <div className="funcionario-perfil-avatar">
            AS
          </div>

          <div className="funcionario-perfil-info">
            <strong>Ana Souza</strong>
            <span>Padaria</span>
          </div>
        </div>

        {/* NAVEGAÇÃO */}

        <nav className="funcionario-menu">
          <NavLink
            to="/funcionario/inicio"
            className={({ isActive }) =>
              `funcionario-link ${isActive ? "ativo" : ""}`
            }
          >
            <Home size={18} />
            <span>Início</span>
          </NavLink>

          <NavLink
            to="/funcionario/meu-armario"
            className={({ isActive }) =>
              `funcionario-link ${isActive ? "ativo" : ""}`
            }
          >
            <LockKeyhole size={18} />
            <span>Meu Armário</span>
          </NavLink>

          <NavLink
            to="/funcionario/lista-espera"
            className={({ isActive }) =>
              `funcionario-link ${isActive ? "ativo" : ""}`
            }
          >
            <List size={18} />
            <span>Lista de Espera</span>
          </NavLink>

          <NavLink
            to="/funcionario/achados-perdidos"
            className={({ isActive }) =>
              `funcionario-link ${isActive ? "ativo" : ""}`
            }
          >
            <PackageSearch size={18} />
            <span>Achados e Perdidos</span>
          </NavLink>
        </nav>

        {/* SAIR */}

        <div className="funcionario-sidebar-footer">
          <NavLink to="/" className="funcionario-sair">
            <LogOut size={17} />
            <span>Sair</span>
          </NavLink>
        </div>

      </aside>

      {/* CONTEÚDO PRINCIPAL */}

      <main className="funcionario-main">
        <AccessibilityControls />

        <div className="funcionario-conteudo">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default FuncionarioLayout;
