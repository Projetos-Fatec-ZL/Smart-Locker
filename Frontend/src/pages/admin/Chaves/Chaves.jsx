
import { useEffect, useMemo, useState } from "react";
import "./Chaves.css";

const API_URL = "http://localhost:5000/api";

function Chaves() {
  const [chaves, setChaves] = useState([]);
  const [armarios, setArmarios] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [listaEspera, setListaEspera] = useState([]);

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(null);

  const token = sessionStorage.getItem("token");

  // extrai listas das respostas da API
  function extrairLista(dados, propriedade) {
    if (Array.isArray(dados)) return dados;
    if (Array.isArray(dados?.[propriedade])) return dados[propriedade];
    return [];
  }

  // realiza requisicoes autenticadas
  async function requisicao(endpoint, opcoes = {}) {
    const resposta = await fetch(`${API_URL}${endpoint}`, {
      ...opcoes,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...opcoes.headers,
      },
    });

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      throw new Error(
        dados.mensagem || "Não foi possível realizar a operação."
      );
    }

    return dados;
  }

  // carrega os dados do sistema
  async function carregarDados() {
    try {
      const [
        dadosChaves,
        dadosArmarios,
        dadosFuncionarios,
        dadosEspera,
      ] = await Promise.all([
        requisicao("/chaves"),
        requisicao("/armarios"),
        requisicao("/funcionarios"),
        requisicao("/lista-espera"),
      ]);

      setChaves(extrairLista(dadosChaves, "chaves"));
      setArmarios(extrairLista(dadosArmarios, "armarios"));
      setFuncionarios(extrairLista(dadosFuncionarios, "funcionarios"));
      setListaEspera(extrairLista(dadosEspera, "registros"));
    } catch (error) {
      setMensagem(error.message || "Erro ao carregar as chaves.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  // identifica o id de uma referencia
  function obterId(referencia) {
    if (!referencia) return null;

    return typeof referencia === "object"
      ? referencia._id || referencia.id
      : referencia;
  }

  // localiza o armario vinculado
  function obterArmario(chave) {
    if (chave.armario && typeof chave.armario === "object") {
      return chave.armario;
    }

    const armarioId = obterId(chave.armario);

    return armarios.find(
      (armario) => obterId(armario) === armarioId
    );
  }

  // localiza o funcionario associado ao armario
  function obterFuncionario(chave) {
    const armarioId = obterId(chave.armario);

    return funcionarios.find(
      (funcionario) =>
        obterId(funcionario.armario) === armarioId
    );
  }

  function nomeStatus(status) {
    const nomes = {
      disponivel: "Disponível",
      entregue: "Entregue",
      extraviada: "Extraviada",
      devolvida: "Devolvida",
    };

    return nomes[status] || status;
  }

  function classeStatus(status) {
    return status || "disponivel";
  }

  const total = chaves.length;

  const aguardando = listaEspera.filter(
    (registro) => registro.status === "aguardando"
  ).length;

  const entregues = chaves.filter(
    (chave) => chave.status === "entregue"
  ).length;

  // filtra as chaves por pesquisa e status
  const chavesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return chaves.filter((chave) => {
      const armario = obterArmario(chave);
      const funcionario = obterFuncionario(chave);

      const codigoArmario = armario?.codigo || "";
      const nomeFuncionario = funcionario?.nome || "";

      const correspondeBusca =
        (chave.codigo || "").toLowerCase().includes(termo) ||
        codigoArmario.toLowerCase().includes(termo) ||
        nomeFuncionario.toLowerCase().includes(termo);

      const correspondeStatus =
        filtroStatus === "Todos" ||
        chave.status === filtroStatus;

      return correspondeBusca && correspondeStatus;
    });
  }, [chaves, armarios, funcionarios, busca, filtroStatus]);

  // atualiza o status da chave no banco de dados
  async function atualizarStatus(chave, novoStatus) {
    const id = obterId(chave);

    try {
      setAtualizando(id);
      setMensagem("");

      await requisicao(`/chaves/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: novoStatus,
        }),
      });

      setMensagem(
        `Status da chave ${chave.codigo} atualizado para ${nomeStatus(novoStatus)}!`
      );

      await carregarDados();
    } catch (error) {
      setMensagem(
        error.message || "Erro ao atualizar o status da chave."
      );

      await carregarDados();
    } finally {
      setAtualizando(null);
    }
  }

  // gera iniciais do funcionario
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

  return (
    <section className="chaves-page">

      {/* CABEÇALHO */}

      <header className="chaves-header">
        <span>CONTROLE DE ACESSO</span>
        <h1>Chaves</h1>
        <p>
          Controle de entrega e devolução das chaves dos armários
        </p>
      </header>

      {/* INDICADORES */}

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

      {/* PESQUISA E FILTROS */}

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
          <option value="disponivel">Disponível</option>
          <option value="entregue">Entregue</option>
          <option value="extraviada">Extraviada</option>
          <option value="devolvida">Devolvida</option>
        </select>
      </div>

      {/* MENSAGEM */}

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

      {/* TABELA */}

      <div className="chaves-table-wrapper">
        <table className="chaves-table">
          <thead>
            <tr>
              <th>Chave</th>
              <th>Armário</th>
              <th>Funcionário</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {carregando ? (
              <tr>
                <td colSpan="4" className="chaves-empty">
                  Carregando chaves...
                </td>
              </tr>
            ) : chavesFiltradas.length === 0 ? (
              <tr>
                <td colSpan="4" className="chaves-empty">
                  Nenhuma chave encontrada.
                </td>
              </tr>
            ) : (
              chavesFiltradas.map((chave) => {
                const armario = obterArmario(chave);
                const funcionario = obterFuncionario(chave);
                const id = obterId(chave);

                return (
                  <tr key={id}>
                    <td>
                      <div className="chaves-key-cell">
                        <span className="chaves-key-icon">🔑</span>
                        <strong>{chave.codigo}</strong>
                      </div>
                    </td>

                    <td>
                      <span className="chaves-locker">
                        {armario?.codigo || "—"}
                      </span>
                    </td>

                    <td>
                      {funcionario ? (
                        <div className="chaves-employee">
                          <span className="chaves-avatar">
                            {iniciais(funcionario.nome)}
                          </span>
                          <span>{funcionario.nome}</span>
                        </div>
                      ) : (
                        <span className="chaves-muted">—</span>
                      )}
                    </td>

                    <td>
                      <select
                        className={`chaves-status-select ${classeStatus(chave.status)}`}
                        value={chave.status || "disponivel"}
                        aria-label={`Alterar status da chave ${chave.codigo}`}
                        disabled={atualizando === id}
                        onChange={(event) =>
                          atualizarStatus(chave, event.target.value)
                        }
                      >
                        <option value="disponivel">
                          Disponível
                        </option>

                        <option value="entregue">
                          Entregue
                        </option>

                        <option value="extraviada">
                          Extraviada
                        </option>

                        <option value="devolvida">
                          Devolvida
                        </option>
                      </select>

                      {atualizando === id && (
                        <span className="chaves-muted">
                          Salvando...
                        </span>
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
  );
}

export default Chaves;
