
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const [funcionario, setFuncionario] = useState(() => {
    try {
      const usuarioSalvo = sessionStorage.getItem("usuario");
      return usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
    } catch {
      return null;
    }
  });

  // consulta os dados atualizados do funcionario
  useEffect(() => {
    async function carregarPerfil() {
      try {
        const token = sessionStorage.getItem("token");

        if (!token) return;

        const resposta = await fetch(
          "http://localhost:5000/api/funcionario/meu-perfil",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
          throw new Error(
            dados.mensagem || "Erro ao consultar perfil."
          );
        }

        setFuncionario(dados.funcionario);

        sessionStorage.setItem(
          "usuario",
          JSON.stringify({
            id: dados.funcionario._id,
            nome: dados.funcionario.nome,
            cpf: dados.funcionario.cpf,
            perfil: dados.funcionario.perfil,
            setor: dados.funcionario.setor,
          })
        );
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      }
    }

    carregarPerfil();
  }, []);

  // gera as iniciais do funcionario
  function gerarIniciais(nome) {
    if (!nome) return "F";

    return nome
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join("");
  }

  // encerra a sessao
  function sair() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");

    navigate("/");
  }

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
            {gerarIniciais(funcionario?.nome)}
          </div>

          <div className="funcionario-perfil-info">
            <strong>
              {funcionario?.nome || "Funcionário"}
            </strong>

            <span>
              {funcionario?.setor || "Setor não informado"}
            </span>
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
          <button
            type="button"
            className="funcionario-sair"
            onClick={sair}
          >
            <LogOut size={17} />
            <span>Sair</span>
          </button>
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
