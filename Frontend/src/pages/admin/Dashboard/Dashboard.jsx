
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [armarios, setArmarios] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [listaEspera, setListaEspera] = useState([]);
  const [administrador, setAdministrador] = useState("Administrador");

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  // carrega os dados reais do dashboard
  useEffect(() => {
    async function carregarDashboard() {
      try {
        const token = sessionStorage.getItem("token");

        if (!token) {
          throw new Error("Sessão não encontrada. Faça login novamente.");
        }

        const usuarioSalvo = sessionStorage.getItem("usuario");

        if (usuarioSalvo) {
          const usuario = JSON.parse(usuarioSalvo);
          setAdministrador(usuario.nome || "Administrador");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [respostaArmarios, respostaFuncionarios, respostaFila] =
          await Promise.all([
            fetch("http://localhost:5000/api/armarios", { headers }),
            fetch("http://localhost:5000/api/funcionarios", { headers }),
            fetch("http://localhost:5000/api/lista-espera", { headers }),
          ]);

        const dadosArmarios = await respostaArmarios.json();
        const dadosFuncionarios = await respostaFuncionarios.json();
        const dadosFila = await respostaFila.json();

        if (!respostaArmarios.ok) {
          throw new Error(
            dadosArmarios.mensagem || "Erro ao carregar armários."
          );
        }

        if (!respostaFuncionarios.ok) {
          throw new Error(
            dadosFuncionarios.mensagem || "Erro ao carregar funcionários."
          );
        }

        if (!respostaFila.ok) {
          throw new Error(
            dadosFila.mensagem || "Erro ao carregar lista de espera."
          );
        }

        // aceita listas retornadas diretamente ou dentro de objetos
        const obterLista = (dados, chaves) => {
          if (Array.isArray(dados)) return dados;

          for (const chave of chaves) {
            if (Array.isArray(dados[chave])) {
              return dados[chave];
            }
          }

          return [];
        };

        setArmarios(
          obterLista(dadosArmarios, ["armarios", "lista", "registros"])
        );

        setFuncionarios(
          obterLista(dadosFuncionarios, [
            "funcionarios",
            "lista",
            "registros",
          ])
        );

        setListaEspera(
          obterLista(dadosFila, ["lista", "registros"])
        );
      } catch (error) {
        setErro(error.message);
      } finally {
        setLoading(false);
      }
    }

    carregarDashboard();
  }, []);

  // indicadores
  const totalArmarios = armarios.length;

  const livres = armarios.filter(
    (armario) => armario.status === "livre"
  );

  const ocupados = armarios.filter(
    (armario) => armario.status === "ocupado"
  );

  const manutencao = armarios.filter(
    (armario) => armario.status === "manutencao"
  );

  const funcionariosAtivos = funcionarios.filter(
    (funcionario) => funcionario.status === "ativo"
  );

  const fila = listaEspera.filter(
    (item) => item.status === "aguardando"
  );

  // encontra o funcionário associado ao armário
  function encontrarFuncionario(armario) {
    return funcionarios.find((funcionario) => {
      const referencia = funcionario.armario;

      if (!referencia) return false;

      const idArmario =
        typeof referencia === "object"
          ? referencia._id
          : referencia;

      return String(idArmario) === String(armario._id);
    });
  }

  // últimas atualizações dos armários
  const movimentacoes = [...armarios]
    .sort((a, b) => {
      const dataA = new Date(a.updatedAt || a.createdAt || 0);
      const dataB = new Date(b.updatedAt || b.createdAt || 0);

      return dataB - dataA;
    })
    .slice(0, 6);

  function calcularPorcentagem(valor) {
    if (totalArmarios === 0) return 0;

    return Math.round((valor / totalArmarios) * 100);
  }

  function formatarData(data) {
    if (!data) return "Não informada";

    return new Date(data).toLocaleDateString("pt-BR");
  }

  function nomeStatus(status) {
    const statusFormatados = {
      livre: "Livre",
      ocupado: "Ocupado",
      manutencao: "Em manutenção",
    };

    return statusFormatados[status] || status || "Não informado";
  }

  if (loading) {
    return (
      <section className="dashboard-page">
        <p>Carregando informações do Dashboard...</p>
      </section>
    );
  }

  return (
    <section className="dashboard-page">

      {/* CABEÇALHO */}

      <header className="dashboard-header">
        <div>
          <span className="dashboard-breadcrumb">
            DASHBOARD
          </span>

          <h1>
            Olá, {administrador}! 👋
          </h1>
        </div>

        <div className="dashboard-actions">
          <button
            className="btn-dashboard-primary"
            onClick={() => navigate("/admin/funcionarios")}
          >
            + Cadastrar funcionário
          </button>

          <button
            className="btn-dashboard-secondary"
            onClick={() => navigate("/admin/armarios")}
          >
            Ver armários
          </button>
        </div>
      </header>

      {/* ERRO */}

      {erro && (
        <p className="dashboard-erro">
          {erro}
        </p>
      )}

      {/* CARDS */}

      <div className="dashboard-cards">

        <article className="dashboard-card">
          <div className="dashboard-icon icon-total">
            🔒
          </div>

          <strong>{totalArmarios}</strong>
          <span>Total de armários</span>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-icon icon-livres">
            ✓
          </div>

          <strong>{livres.length}</strong>
          <span>Livres</span>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-icon icon-ocupados">
            ○
          </div>

          <strong>{ocupados.length}</strong>
          <span>Ocupados</span>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-icon icon-manutencao">
            🔧
          </div>

          <strong>{manutencao.length}</strong>
          <span>Em manutenção</span>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-icon icon-funcionarios">
            👥
          </div>

          <strong>{funcionariosAtivos.length}</strong>
          <span>Funcionários</span>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-icon icon-fila">
            ⏳
          </div>

          <strong>{fila.length}</strong>
          <span>Lista de espera</span>
        </article>

      </div>

      {/* DISTRIBUIÇÃO */}

      <section className="dashboard-section">
        <div className="section-title">
          <h2>
            Distribuição dos Armários
          </h2>

          <p>
            Situação geral · {totalArmarios} armários cadastrados
          </p>
        </div>

        <div className="distribution-item">
          <div className="distribution-top">
            <div>
              <span className="status-dot livre"></span>
              <span>Livres</span>
            </div>

            <strong>
              {livres.length}
              <small>{calcularPorcentagem(livres.length)}%</small>
            </strong>
          </div>

          <div className="distribution-bar">
            <div
              className="distribution-progress progress-livre"
              style={{
                width: `${calcularPorcentagem(livres.length)}%`,
              }}
            />
          </div>
        </div>

        <div className="distribution-item">
          <div className="distribution-top">
            <div>
              <span className="status-dot ocupado"></span>
              <span>Ocupados</span>
            </div>

            <strong>
              {ocupados.length}
              <small>{calcularPorcentagem(ocupados.length)}%</small>
            </strong>
          </div>

          <div className="distribution-bar">
            <div
              className="distribution-progress progress-ocupado"
              style={{
                width: `${calcularPorcentagem(ocupados.length)}%`,
              }}
            />
          </div>
        </div>

        <div className="distribution-item">
          <div className="distribution-top">
            <div>
              <span className="status-dot manutencao"></span>
              <span>Em manutenção</span>
            </div>

            <strong>
              {manutencao.length}
              <small>{calcularPorcentagem(manutencao.length)}%</small>
            </strong>
          </div>

          <div className="distribution-bar">
            <div
              className="distribution-progress progress-manutencao"
              style={{
                width: `${calcularPorcentagem(manutencao.length)}%`,
              }}
            />
          </div>
        </div>
      </section>

      {/* MOVIMENTAÇÕES */}

      <section className="dashboard-section">
        <div className="movimentacoes-header">
          <div className="section-title">
            <h2>
              Últimas Movimentações
            </h2>

            <p>
              Vestiário feminino e masculino
            </p>
          </div>

          <button
            className="ver-todas"
            onClick={() => navigate("/admin/armarios")}
          >
            Ver todas →
          </button>
        </div>

        <div className="dashboard-table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Armário</th>
                <th>Setor</th>
                <th>Funcionário</th>
                <th>Status</th>
                <th>Atualização</th>
              </tr>
            </thead>

            <tbody>
              {movimentacoes.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    Nenhum armário cadastrado.
                  </td>
                </tr>
              ) : (
                movimentacoes.map((armario) => {
                  const funcionario = encontrarFuncionario(armario);

                  return (
                    <tr key={armario._id}>
                      <td>
                        <span className="locker-code">
                          {armario.codigo}
                        </span>
                      </td>

                      <td>
                        {funcionario?.setor || "—"}
                      </td>

                      <td>
                        {funcionario?.nome || "—"}
                      </td>

                      <td>
                        <span
                          className={`status-pill ${armario.status}`}
                        >
                          ● {nomeStatus(armario.status)}
                        </span>
                      </td>

                      <td>
                        {formatarData(
                          armario.updatedAt || armario.createdAt
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

    </section>
  );
}

export default Dashboard;
