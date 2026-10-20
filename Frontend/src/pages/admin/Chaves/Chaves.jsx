
import { useMemo, useState } from "react";
import { chavesMock } from "./chavesMock";
import "./Chaves.css";

function Chaves() {
  const [chaves, setChaves] = useState(chavesMock);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [mensagem, setMensagem] = useState("");

  const total = chaves.length;

  const aguardando = chaves.filter(
    (chave) => chave.status === "Aguardando retirada"
  ).length;

  const entregues = chaves.filter(
    (chave) => chave.status === "Entregue"
  ).length;

  const chavesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return chaves.filter((chave) => {
      const correspondeBusca =
        chave.codigo.toLowerCase().includes(termo) ||
        chave.armario.toLowerCase().includes(termo) ||
        (chave.funcionario || "").toLowerCase().includes(termo);

      const correspondeStatus =
        filtroStatus === "Todos" ||
        chave.status === filtroStatus;

      return correspondeBusca && correspondeStatus;
    });
  }, [chaves, busca, filtroStatus]);

  function registrarEntrega(id) {
    setChaves((lista) =>
      lista.map((chave) =>
        chave.id === id
          ? { ...chave, status: "Entregue" }
          : chave
      )
    );

    setMensagem("Entrega da chave registrada com sucesso.");
  }

  function registrarDevolucao(id) {
    setChaves((lista) =>
      lista.map((chave) =>
        chave.id === id
          ? {
              ...chave,
              status: "Disponível",
              funcionario: null,
              setor: null,
            }
          : chave
      )
    );

    setMensagem("Devolução registrada com sucesso.");
  }

  function iniciais(nome) {
    if (!nome) return "";

    return nome
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0])
      .join("")
      .toUpperCase();
  }

  function classeStatus(status) {
    if (status === "Disponível") return "disponivel";
    if (status === "Aguardando retirada") return "aguardando";
    return "entregue";
  }

  return (
    <section className="chaves-page">
      <header className="chaves-header">
        <span>CONTROLE DE ACESSO</span>
        <h1>Chaves</h1>
        <p>Controle de entrega e devolução das chaves dos armários</p>
      </header>

      <div className="chaves-stats">
        <article className="chaves-stat-card">
          <div className="chaves-stat-icon chave-icon">🔑</div>
          <strong>{total}</strong>
          <span>Total de chaves</span>
        </article>

        <article className="chaves-stat-card">
          <div className="chaves-stat-icon espera-icon">⏳</div>
          <strong>{aguardando}</strong>
          <span>Aguardando retirada</span>
        </article>

        <article className="chaves-stat-card">
          <div className="chaves-stat-icon entregue-icon">☑️</div>
          <strong>{entregues}</strong>
          <span>Entregues</span>
        </article>
      </div>

      <div className="chaves-toolbar">
        <input
          type="search"
          placeholder="Pesquisar chave, armário ou funcionário"
          aria-label="Pesquisar chave, armário ou funcionário"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
        />

        <select
          aria-label="Filtrar chaves por status"
          value={filtroStatus}
          onChange={(event) => setFiltroStatus(event.target.value)}
        >
          <option value="Todos">Todos</option>
          <option value="Disponível">Disponível</option>
          <option value="Aguardando retirada">
            Aguardando retirada
          </option>
          <option value="Entregue">Entregue</option>
        </select>
      </div>

      {mensagem && (
        <div className="chaves-feedback" role="status">
          <span>{mensagem}</span>
          <button
            type="button"
            onClick={() => setMensagem("")}
            aria-label="Fechar mensagem"
          >
            ×
          </button>
        </div>
      )}

      <div className="chaves-table-wrapper">
        <table className="chaves-table">
          <thead>
            <tr>
              <th>Chave</th>
              <th>Armário</th>
              <th>Funcionário</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>

          <tbody>
            {chavesFiltradas.length === 0 ? (
              <tr>
                <td colSpan="5" className="chaves-empty">
                  Nenhuma chave encontrada.
                </td>
              </tr>
            ) : (
              chavesFiltradas.map((chave) => (
                <tr key={chave.id}>
                  <td>
                    <div className="chaves-key-cell">
                      <span className="chaves-key-icon">🔑</span>
                      <strong>{chave.codigo}</strong>
                    </div>
                  </td>

                  <td>
                    <span className="chaves-locker">
                      {chave.armario}
                    </span>
                  </td>

                  <td>
                    {chave.funcionario ? (
                      <div className="chaves-employee">
                        <span className="chaves-avatar">
                          {iniciais(chave.funcionario)}
                        </span>
                        <span>{chave.funcionario}</span>
                      </div>
                    ) : (
                      <span className="chaves-muted">—</span>
                    )}
                  </td>

                  <td>
                    <span
                      className={`chaves-status ${classeStatus(chave.status)}`}
                    >
                      <span className="chaves-status-dot" />
                      {chave.status}
                    </span>
                  </td>

                  <td>
                    {chave.status === "Aguardando retirada" ? (
                      <button
                        type="button"
                        className="chaves-action primary"
                        onClick={() => registrarEntrega(chave.id)}
                      >
                        Registrar entrega
                      </button>
                    ) : chave.status === "Entregue" ? (
                      <button
                        type="button"
                        className="chaves-action"
                        onClick={() => registrarDevolucao(chave.id)}
                      >
                        ↩ Registrar devolução
                      </button>
                    ) : (
                      <span className="chaves-muted">
                        Sem ação pendente
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Chaves;
