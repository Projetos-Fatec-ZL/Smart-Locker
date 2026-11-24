
import { useCallback, useEffect, useMemo, useState } from "react";
import "./Armarios.css";

function Armarios() {
  const [armarios, setArmarios] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [chaves, setChaves] = useState([]);

  const [busca, setBusca] = useState("");
  const [vestiario, setVestiario] = useState("todos");
  const [status, setStatus] = useState("todos");

  const [armarioSelecionado, setArmarioSelecionado] = useState(null);
  const [modal, setModal] = useState(null);

  const [codigo, setCodigo] = useState("");
  const [tipo, setTipo] = useState("feminino");
  const [statusEdicao, setStatusEdicao] = useState("livre");
  const [funcionarioId, setFuncionarioId] = useState("");

  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  // realiza requisicoes autenticadas ao backend
  async function requisicao(endpoint, metodo = "GET", corpo = null) {
    const token = sessionStorage.getItem("token");

    if (!token) {
      throw new Error("Sessão não encontrada. Faça login novamente.");
    }

    const opcoes = {
      method: metodo,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    if (corpo !== null) {
      opcoes.headers["Content-Type"] = "application/json";
      opcoes.body = JSON.stringify(corpo);
    }

    const resposta = await fetch(
      `http://localhost:5000${endpoint}`,
      opcoes
    );

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      throw new Error(
        dados.mensagem || "Não foi possível realizar a operação."
      );
    }

    return dados;
  }

  // aceita listas retornadas diretamente ou dentro de objetos
  function obterLista(dados, propriedades) {
    if (Array.isArray(dados)) return dados;

    for (const propriedade of propriedades) {
      if (Array.isArray(dados?.[propriedade])) {
        return dados[propriedade];
      }
    }

    return [];
  }

  // carrega armarios, funcionarios e chaves
  const carregarDados = useCallback(async () => {
    try {
      setErro("");

      const [dadosArmarios, dadosFuncionarios, dadosChaves] =
        await Promise.all([
          requisicao("/api/armarios"),
          requisicao("/api/funcionarios"),
          requisicao("/api/chaves"),
        ]);

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

      setChaves(
        obterLista(dadosChaves, ["chaves", "lista", "registros"])
      );
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // identifica os funcionarios e as chaves associados
  function obterIdReferencia(referencia) {
    if (!referencia) return null;

    if (typeof referencia === "object") {
      return referencia._id || null;
    }

    return referencia;
  }

  const armariosComDados = useMemo(() => {
    return armarios.map((armario) => {
      const funcionario = funcionarios.find(
        (item) =>
          String(obterIdReferencia(item.armario)) ===
          String(armario._id)
      );

      const chave = chaves.find(
        (item) =>
          String(obterIdReferencia(item.armario)) ===
          String(armario._id)
      );

      return {
        ...armario,
        numero: armario.codigo,
        vestiario: armario.tipo,
        funcionario: funcionario?.nome || null,
        funcionarioId: funcionario?._id || null,
        setor: funcionario?.setor || null,
        chave: chave?.codigo || null,
        chaveId: chave?._id || null,
        chaveStatus: chave?.status || null,
      };
    });
  }, [armarios, funcionarios, chaves]);

  const livres = armariosComDados.filter(
    (armario) => armario.status === "livre"
  );

  const ocupados = armariosComDados.filter(
    (armario) => armario.status === "ocupado"
  );

  const manutencao = armariosComDados.filter(
    (armario) => armario.status === "manutencao"
  );

  const funcionariosDisponiveis = funcionarios.filter(
    (funcionario) =>
      funcionario.status === "ativo" && !funcionario.armario
  );

  const armariosFiltrados = useMemo(() => {
    return armariosComDados.filter((armario) => {
      const termo = busca.toLowerCase().trim();

      const correspondeBusca =
        !termo ||
        (armario.numero || "").toLowerCase().includes(termo) ||
        (armario.funcionario || "").toLowerCase().includes(termo);

      const correspondeVestiario =
        vestiario === "todos" ||
        armario.vestiario === vestiario;

      const correspondeStatus =
        status === "todos" ||
        armario.status === status;

      return (
        correspondeBusca &&
        correspondeVestiario &&
        correspondeStatus
      );
    });
  }, [armariosComDados, busca, vestiario, status]);

  function abrirModal(tipoModal, armario = null) {
    setArmarioSelecionado(armario);
    setModal(tipoModal);

    setCodigo(armario?.codigo || "");
    setTipo(armario?.tipo || "feminino");
    setStatusEdicao(armario?.status || "livre");
    setFuncionarioId("");

    setErro("");
    setMensagem("");
  }

  function fecharModal() {
    setModal(null);
    setArmarioSelecionado(null);
    setCodigo("");
    setFuncionarioId("");
  }

  function nomeStatus(statusArmario) {
    const nomes = {
      livre: "Livre",
      ocupado: "Ocupado",
      manutencao: "Em manutenção",
    };

    return nomes[statusArmario] || "Não informado";
  }

  function nomeVestiario(valor) {
    return valor === "feminino" ? "Feminino" : "Masculino";
  }

  // cadastra um novo armario e sua chave automaticamente
  async function cadastrarArmario() {
    if (!codigo.trim()) {
      setErro("Informe o código do armário.");
      return;
    }

    try {
      setProcessando(true);
      setErro("");

      await requisicao("/api/armarios", "POST", {
        codigo: codigo.trim(),
        tipo,
      });

      fecharModal();
      setMensagem("Armário e chave cadastrados com sucesso!");

      await carregarDados();
    } catch (error) {
      setErro(error.message);
    } finally {
      setProcessando(false);
    }
  }

  // atualiza os dados do armario
  async function salvarEdicao() {
    if (!codigo.trim()) {
      setErro("Informe o código do armário.");
      return;
    }

    try {
      setProcessando(true);
      setErro("");

      await requisicao(
        `/api/armarios/${armarioSelecionado._id}`,
        "PUT",
        {
          codigo: codigo.trim(),
          tipo,
          status: statusEdicao,
        }
      );

      fecharModal();
      setMensagem("Armário atualizado com sucesso!");

      await carregarDados();
    } catch (error) {
      setErro(error.message);
    } finally {
      setProcessando(false);
    }
  }

  // associa um funcionario a um armario
  async function associarFuncionario() {
    if (!funcionarioId) {
      setErro("Selecione um funcionário.");
      return;
    }

    try {
      setProcessando(true);
      setErro("");

      const armarioId = armarioSelecionado._id;

      await requisicao(`/api/armarios/${armarioId}`, "PUT", {
        status: "ocupado",
      });

      try {
        await requisicao(
          `/api/funcionarios/${funcionarioId}`,
          "PUT",
          {
            armario: armarioId,
          }
        );
      } catch (error) {
        await requisicao(
          `/api/armarios/${armarioId}`,
          "PUT",
          { status: "livre" }
        ).catch(() => {});

        throw error;
      }

      fecharModal();
      setMensagem("Funcionário associado ao armário com sucesso!");

      await carregarDados();
    } catch (error) {
      setErro(error.message);
    } finally {
      setProcessando(false);
    }
  }

  // desocupa o armario e registra a devolucao da chave
  async function desocuparArmario(armario) {
    const confirmar = window.confirm(
      `Deseja desocupar o armário ${armario.numero} e registrar a devolução da chave?`
    );

    if (!confirmar) return;

    try {
      setProcessando(true);
      setErro("");
      setMensagem("");

      if (armario.funcionarioId) {
        await requisicao(
          `/api/funcionarios/${armario.funcionarioId}`,
          "PUT",
          { armario: null }
        );
      }

      if (armario.chaveId) {
        await requisicao(
          `/api/chaves/${armario.chaveId}`,
          "PUT",
          { status: "devolvida" }
        );
      }

      await requisicao(
        `/api/armarios/${armario._id}`,
        "PUT",
        { status: "livre" }
      );

      setMensagem("Armário desocupado e devolução registrada!");

      await carregarDados();
    } catch (error) {
      setErro(error.message);
      await carregarDados();
    } finally {
      setProcessando(false);
    }
  }

  // conclui a manutencao
  async function concluirManutencao(armario) {
    const confirmar = window.confirm(
      `Deseja concluir a manutenção do armário ${armario.numero}?`
    );

    if (!confirmar) return;

    try {
      setProcessando(true);
      setErro("");

      await requisicao(
        `/api/armarios/${armario._id}`,
        "PUT",
        { status: "livre" }
      );

      setMensagem("Manutenção concluída. Armário liberado!");

      await carregarDados();
    } catch (error) {
      setErro(error.message);
    } finally {
      setProcessando(false);
    }
  }

  // abre o modal para confirmar a exclusao do armario e da chave vinculada
  function solicitarExclusao(armario) {
    setArmarioSelecionado(armario);
    setModal("confirmar-exclusao");
    setErro("");
    setMensagem("");
  }

  // exclui o armario e sua chave vinculada pelo backend
  async function excluirArmario(armario) {
    try {
      setProcessando(true);
      setErro("");
      setMensagem("");

      // O backend exclui a chave vinculada e depois o armario.
      await requisicao(
        `/api/armarios/${armario._id}`,
        "DELETE"
      );

      fecharModal();

      setMensagem(
        `Armário ${armario.numero} e sua chave ${
          armario.chave || "vinculada"
        } foram excluídos com sucesso!`
      );

      await carregarDados();
    } catch (error) {
      setErro(error.message);
      await carregarDados();
    } finally {
      setProcessando(false);
    }
  }

  if (loading) {
    return (
      <section className="armarios-page">
        <p>Carregando armários...</p>
      </section>
    );
  }

  return (
    <section className="armarios-page">

      {/* CABEÇALHO */}

      <header className="armarios-header">
        <span>ARMÁRIOS</span>

        <h1>Armários</h1>

        <p>
          Visualização e gerenciamento dos armários cadastrados
        </p>
      </header>

      {/* MENSAGENS */}

      {erro && (
        <p className="armarios-erro">
          {erro}
        </p>
      )}

      {mensagem && (
        <p className="armarios-mensagem">
          {mensagem}
        </p>
      )}

      {/* CARDS */}

      <div className="armarios-cards">
        <article className="armario-stat-card">
          <div className="armario-stat-icon total">🔒</div>
          <strong>{armarios.length}</strong>
          <span>Total</span>
        </article>

        <article className="armario-stat-card">
          <div className="armario-stat-icon livre">✓</div>
          <strong>{livres.length}</strong>
          <span>Livres</span>
        </article>

        <article className="armario-stat-card">
          <div className="armario-stat-icon ocupado">○</div>
          <strong>{ocupados.length}</strong>
          <span>Ocupados</span>
        </article>

        <article className="armario-stat-card">
          <div className="armario-stat-icon manutencao">🔧</div>
          <strong>{manutencao.length}</strong>
          <span>Em manutenção</span>
        </article>
      </div>

      {/* BUSCA E FILTROS */}

      <section className="armarios-filtros">
        <input
          type="text"
          placeholder="Pesquisar funcionário ou número"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
        />

        <select
          value={vestiario}
          onChange={(event) => setVestiario(event.target.value)}
        >
          <option value="todos">Todos os vestiários</option>
          <option value="feminino">Feminino</option>
          <option value="masculino">Masculino</option>
        </select>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="todos">Todos os status</option>
          <option value="livre">Livre</option>
          <option value="ocupado">Ocupado</option>
          <option value="manutencao">Em manutenção</option>
        </select>

        <button
          className="btn-cadastrar-armario"
          onClick={() => abrirModal("cadastrar")}
        >
          + Cadastrar armário
        </button>
      </section>

      {/* TABELA */}

      <section className="armarios-tabela-container">
        <table className="armarios-tabela">
          <thead>
            <tr>
              <th>Número</th>
              <th>Vestiário</th>
              <th>Status</th>
              <th>Funcionário associado</th>
              <th>Setor</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {armariosFiltrados.length === 0 && (
              <tr>
                <td colSpan="6" className="nenhum-armario">
                  Nenhum armário encontrado.
                </td>
              </tr>
            )}

            {armariosFiltrados.map((armario) => (
              <tr key={armario._id}>
                <td>
                  <span className="armario-codigo">
                    {armario.numero}
                  </span>
                </td>

                <td>
                  <span className="vestiario-badge">
                    {armario.vestiario === "feminino" ? "♀" : "♂"}
                    {" "}
                    {nomeVestiario(armario.vestiario)}
                  </span>
                </td>

                <td>
                  <span className={`armario-status ${armario.status}`}>
                    ● {nomeStatus(armario.status)}
                  </span>
                </td>

                <td>
                  {armario.funcionario ? (
                    <div className="funcionario-armario">
                      <div className="funcionario-avatar">
                        {armario.funcionario
                          .split(" ")
                          .map((nome) => nome[0])
                          .slice(0, 2)
                          .join("")}
                      </div>

                      <span>{armario.funcionario}</span>
                    </div>
                  ) : (
                    <span className="sem-dado">—</span>
                  )}
                </td>

                <td>
                  {armario.setor ? (
                    <span className="setor-badge">
                      {armario.setor}
                    </span>
                  ) : (
                    <span className="sem-dado">—</span>
                  )}
                </td>

                <td>
                  <div className="armario-acoes">
                    <button
                      className="btn-acao"
                      onClick={() => abrirModal("ver", armario)}
                    >
                      Ver
                    </button>

                    <button
                      className="btn-acao"
                      onClick={() => abrirModal("editar", armario)}
                    >
                      Editar
                    </button>

                    {armario.status === "livre" && (
                      <button
                        className="btn-associar"
                        onClick={() => abrirModal("associar", armario)}
                      >
                        Associar
                      </button>
                    )}

                    {armario.status === "ocupado" && (
                      <button
                        className="btn-acao"
                        disabled={processando}
                        onClick={() => desocuparArmario(armario)}
                      >
                        Desocupar
                      </button>
                    )}

                    {armario.status === "manutencao" && (
                      <button
                        className="btn-acao"
                        disabled={processando}
                        onClick={() => concluirManutencao(armario)}
                      >
                        Concluir
                      </button>
                    )}

                    <button
                      className="btn-acao"
                      style={{
                        color: "#dc2626",
                        border: "1px solid #fecaca",
                        backgroundColor: "#fef2f2",
                      }}
                      disabled={processando}
                      onClick={() => solicitarExclusao(armario)}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* MODAL CONFIRMAR EXCLUSAO */}

      {modal === "confirmar-exclusao" && armarioSelecionado && (
        <div className="modal-overlay">
          <div className="armario-modal modal-exclusao">
            <div className="modal-exclusao-icone">⚠️</div>

            <h2>Confirmar exclusão</h2>

            <p>
              Deseja realmente excluir o armário{" "}
              <strong>{armarioSelecionado.numero}</strong>
              {armarioSelecionado.chave && (
                <>
                  {" "}e sua chave{" "}
                  <strong>{armarioSelecionado.chave}</strong>
                </>
              )}?
            </p>

            <span className="modal-exclusao-aviso">
              O armário e a chave vinculada serão excluídos juntos. Essa ação não poderá ser desfeita.
            </span>

            <div className="modal-botoes">
              <button
                className="btn-modal-cancelar"
                onClick={fecharModal}
                disabled={processando}
              >
                Cancelar
              </button>

              <button
                className="btn-modal-excluir"
                onClick={() => excluirArmario(armarioSelecionado)}
                disabled={processando}
              >
                {processando ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VER */}

      {modal === "ver" && armarioSelecionado && (
        <div className="modal-overlay">
          <div className="armario-modal">
            <button className="modal-fechar" onClick={fecharModal}>
              ×
            </button>

            <h2>Armário {armarioSelecionado.numero}</h2>

            <div className="modal-dados">
              <p>
                <strong>Vestiário:</strong>{" "}
                {nomeVestiario(armarioSelecionado.vestiario)}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {nomeStatus(armarioSelecionado.status)}
              </p>

              <p>
                <strong>Funcionário:</strong>{" "}
                {armarioSelecionado.funcionario || "Nenhum"}
              </p>

              <p>
                <strong>Setor:</strong>{" "}
                {armarioSelecionado.setor || "—"}
              </p>

              <p>
                <strong>Chave:</strong>{" "}
                {armarioSelecionado.chave || "Não cadastrada"}
              </p>

              <p>
                <strong>Status da chave:</strong>{" "}
                {armarioSelecionado.chaveStatus || "Não informada"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CADASTRAR */}

      {modal === "cadastrar" && (
        <div className="modal-overlay">
          <div className="armario-modal">
            <button className="modal-fechar" onClick={fecharModal}>
              ×
            </button>

            <h2>Cadastrar armário</h2>

            <p className="modal-subtitulo">
              Adicione um novo armário ao sistema.
            </p>

            <label>Número</label>

            <input
              type="text"
              placeholder="Ex: F07"
              value={codigo}
              onChange={(event) => setCodigo(event.target.value)}
            />

            <label>Vestiário</label>

            <select
              value={tipo}
              onChange={(event) => setTipo(event.target.value)}
            >
              <option value="feminino">Feminino</option>
              <option value="masculino">Masculino</option>
            </select>

            <div className="modal-botoes">
              <button
                className="btn-modal-cancelar"
                onClick={fecharModal}
                disabled={processando}
              >
                Cancelar
              </button>

              <button
                className="btn-modal-salvar"
                onClick={cadastrarArmario}
                disabled={processando}
              >
                {processando ? "Cadastrando..." : "Cadastrar armário"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}

      {modal === "editar" && armarioSelecionado && (
        <div className="modal-overlay">
          <div className="armario-modal">
            <button className="modal-fechar" onClick={fecharModal}>
              ×
            </button>

            <h2>Editar armário</h2>

            <label>Número</label>

            <input
              type="text"
              value={codigo}
              onChange={(event) => setCodigo(event.target.value)}
            />

            <label>Vestiário</label>

            <select
              value={tipo}
              onChange={(event) => setTipo(event.target.value)}
            >
              <option value="feminino">Feminino</option>
              <option value="masculino">Masculino</option>
            </select>

            <label>Status</label>

            <select
              value={statusEdicao}
              onChange={(event) => setStatusEdicao(event.target.value)}
            >
              <option value="livre">Livre</option>
              <option value="ocupado">Ocupado</option>
              <option value="manutencao">Em manutenção</option>
            </select>

            <div className="modal-botoes">
              <button
                className="btn-modal-cancelar"
                onClick={fecharModal}
                disabled={processando}
              >
                Cancelar
              </button>

              <button
                className="btn-modal-salvar"
                onClick={salvarEdicao}
                disabled={processando}
              >
                {processando ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ASSOCIAR */}

      {modal === "associar" && armarioSelecionado && (
        <div className="modal-overlay">
          <div className="armario-modal">
            <button className="modal-fechar" onClick={fecharModal}>
              ×
            </button>

            <h2>Associar funcionário</h2>

            <p className="modal-subtitulo">
              Armário {armarioSelecionado.numero}
            </p>

            <label>Funcionário</label>

            <select
              value={funcionarioId}
              onChange={(event) => setFuncionarioId(event.target.value)}
            >
              <option value="">Selecione um funcionário</option>

              {funcionariosDisponiveis.map((funcionario) => (
                <option key={funcionario._id} value={funcionario._id}>
                  {funcionario.nome} — {funcionario.setor}
                </option>
              ))}
            </select>

            {funcionariosDisponiveis.length === 0 && (
              <p className="modal-subtitulo">
                Não há funcionários ativos sem armário disponível.
              </p>
            )}

            <div className="modal-botoes">
              <button
                className="btn-modal-cancelar"
                onClick={fecharModal}
                disabled={processando}
              >
                Cancelar
              </button>

              <button
                className="btn-modal-salvar"
                onClick={associarFuncionario}
                disabled={processando || funcionariosDisponiveis.length === 0}
              >
                {processando ? "Associando..." : "Associar"}
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}

export default Armarios;
