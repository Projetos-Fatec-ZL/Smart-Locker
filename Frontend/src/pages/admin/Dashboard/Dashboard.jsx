import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

import {
  armariosMock,
  funcionariosMock,
  listaEsperaMock,
} from "../../../data/mockData";

function Dashboard() {
  const navigate = useNavigate();

  const totalArmarios = armariosMock.length;

  const livres = armariosMock.filter(
    (armario) => armario.status === "livre"
  );

  const ocupados = armariosMock.filter(
    (armario) => armario.status === "ocupado"
  );

  const manutencao = armariosMock.filter(
    (armario) => armario.status === "manutencao"
  );

  const funcionariosAtivos = funcionariosMock.filter(
    (funcionario) => funcionario.status === "ativo"
  );

  const fila = listaEsperaMock.filter(
    (item) => item.status === "aguardando"
  );

  const movimentacoes = [...armariosMock]
    .sort(
      (a, b) =>
        new Date(b.updatedDate) -
        new Date(a.updatedDate)
    )
    .slice(0, 6);

  function calcularPorcentagem(valor) {
    if (totalArmarios === 0) {
      return 0;
    }

    return Math.round(
      (valor / totalArmarios) * 100
    );
  }

  function formatarData(data) {
    return new Date(
      `${data}T12:00:00`
    ).toLocaleDateString("pt-BR");
  }

  function nomeStatus(status) {
    if (status === "livre") {
      return "Livre";
    }

    if (status === "ocupado") {
      return "Ocupado";
    }

    return "Em manutenção";
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
            Olá, Administrador! 👋
          </h1>
        </div>

        <div className="dashboard-actions">
          <button
            className="btn-dashboard-primary"
            onClick={() =>
              navigate("/admin/funcionarios")
            }
          >
            + Cadastrar funcionário
          </button>

          <button
            className="btn-dashboard-secondary"
            onClick={() =>
              navigate("/admin/armarios")
            }
          >
            Ver armários
          </button>
        </div>
      </header>


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

          <strong>
            {funcionariosAtivos.length}
          </strong>

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
              <small>
                {calcularPorcentagem(
                  livres.length
                )}
                %
              </small>
            </strong>
          </div>

          <div className="distribution-bar">
            <div
              className="distribution-progress progress-livre"
              style={{
                width: `${calcularPorcentagem(
                  livres.length
                )}%`,
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
              <small>
                {calcularPorcentagem(
                  ocupados.length
                )}
                %
              </small>
            </strong>
          </div>

          <div className="distribution-bar">
            <div
              className="distribution-progress progress-ocupado"
              style={{
                width: `${calcularPorcentagem(
                  ocupados.length
                )}%`,
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
              <small>
                {calcularPorcentagem(
                  manutencao.length
                )}
                %
              </small>
            </strong>
          </div>

          <div className="distribution-bar">
            <div
              className="distribution-progress progress-manutencao"
              style={{
                width: `${calcularPorcentagem(
                  manutencao.length
                )}%`,
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
            onClick={() =>
              navigate("/admin/armarios")
            }
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

              {movimentacoes.map(
                (armario) => (
                  <tr key={armario.id}>

                    <td>
                      <span className="locker-code">
                        {armario.numero}
                      </span>
                    </td>

                    <td>
                      {armario.setor || "—"}
                    </td>

                    <td>
                      {armario.funcionario ||
                        "—"}
                    </td>

                    <td>
                      <span
                        className={`status-pill ${armario.status}`}
                      >
                        ●{" "}
                        {nomeStatus(
                          armario.status
                        )}
                      </span>
                    </td>

                    <td>
                      {formatarData(
                        armario.updatedDate
                      )}
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      </section>

    </section>
  );
}

export default Dashboard;