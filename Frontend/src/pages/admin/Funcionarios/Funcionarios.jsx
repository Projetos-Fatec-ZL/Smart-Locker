
import { useCallback, useEffect, useMemo, useState } from "react";
import "./Funcionarios.css";

const API_URL = "http://localhost:5000/api";

function obterId(item) {
  return item?._id || item?.id || null;
}

function obterLista(dados, propriedade) {
  if (Array.isArray(dados)) return dados;
  if (Array.isArray(dados?.[propriedade])) return dados[propriedade];
  return [];
}

function obterIdFuncionario(registro) {
  const funcionario = registro?.funcionario;
  return typeof funcionario === "object"
    ? obterId(funcionario)
    : funcionario;
}

function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [listaEspera, setListaEspera] = useState([]);
  const [busca, setBusca] = useState("");
  const [setorFiltro, setSetorFiltro] = useState("todos");
  const [modal, setModal] = useState(null);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [gerandoCodigo, setGerandoCodigo] = useState(false);
  const [codigoRecuperacao, setCodigoRecuperacao] = useState(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const requisicao = useCallback(async (rota, opcoes = {}) => {
    const token = sessionStorage.getItem("token");

    const resposta = await fetch(`${API_URL}${rota}`, {
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
  }, []);

  const carregarDados = useCallback(async () => {
    try {
      setErro("");

      const [dadosFuncionarios, dadosLista] = await Promise.all([
        requisicao("/funcionarios"),
        requisicao("/lista-espera"),
      ]);

      setFuncionarios(obterLista(dadosFuncionarios, "funcionarios"));
      setListaEspera(obterLista(dadosLista, "registros"));
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  }, [requisicao]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarDados();
  }, [carregarDados]);

  const setores = useMemo(() => {
    return [
      ...new Set(
        funcionarios
          .map((funcionario) => funcionario.setor)
          .filter(Boolean)
      ),
    ].sort();
  }, [funcionarios]);

  const funcionariosFiltrados = useMemo(() => {
    return funcionarios.filter((funcionario) => {
      const termo = busca.trim().toLowerCase();
      const nome = (funcionario.nome || "").toLowerCase();
      const cpf = (funcionario.cpf || "").toLowerCase();

      const correspondeBusca =
        !termo || nome.includes(termo) || cpf.includes(termo);

      const correspondeSetor =
        setorFiltro === "todos" || funcionario.setor === setorFiltro;

      return correspondeBusca && correspondeSetor;
    });
  }, [funcionarios, busca, setorFiltro]);

  const total = funcionarios.length;

  const comArmario = funcionarios.filter(
    (funcionario) => funcionario.armario
  ).length;

  const semArmario = total - comArmario;

  const naFila = listaEspera.filter(
    (item) => item.status === "aguardando"
  ).length;

  function abrirModal(tipo, funcionario = null) {
    setFuncionarioSelecionado(funcionario);
    setModal(tipo);
    setErro("");
    setMensagem("");
    setCodigoRecuperacao(null);
  }

  function fecharModal() {
    setModal(null);
    setFuncionarioSelecionado(null);
    setCodigoRecuperacao(null);
    setErro("");
  }

  function mascararCpf(cpf) {
    if (!cpf) return "—";

    const numeros = String(cpf).replace(/\D/g, "");

    if (numeros.length !== 11) return "—";

    return `***.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-**`;
  }

  function estaNaFila(funcionario) {
    const id = obterId(funcionario);

    return listaEspera.some((item) => {
      if (item.status !== "aguardando") return false;

      const idNaFila = obterIdFuncionario(item);

      return (
        (id && idNaFila && String(id) === String(idNaFila)) ||
        item.funcionario?.nome === funcionario.nome
      );
    });
  }

  function obterCodigoArmario(funcionario) {
    if (!funcionario.armario) return null;

    if (typeof funcionario.armario === "object") {
      return funcionario.armario.codigo || "Armário associado";
    }

    return funcionario.armario;
  }

  function situacaoFuncionario(funcionario) {
    if (funcionario.armario) {
      return (
        <span className="funcionario-status com-armario">
          ● Com armário
        </span>
      );
    }

    if (estaNaFila(funcionario)) {
      return (
        <span className="funcionario-status fila">
          ● Na lista de espera
        </span>
      );
    }

    return <span className="sem-dado">—</span>;
  }

  async function cadastrarFuncionario(event) {
    event.preventDefault();

    const form = event.target;
    const nome = form.nome.value.trim();
    const cpf = form.cpf.value.replace(/\D/g, "");
    const setor = form.setor.value;

    if (!nome || !cpf || !setor) {
      setErro("Preencha todos os campos.");
      return;
    }

    if (cpf.length !== 11) {
      setErro("Informe um CPF válido com 11 números.");
      return;
    }

    try {
      setSalvando(true);
      setErro("");

      await requisicao("/funcionarios", {
        method: "POST",
        body: JSON.stringify({
          nome,
          cpf,
          setor,
          status: "ativo",
        }),
      });

      fecharModal();
      setMensagem("Funcionário cadastrado com sucesso!");
      await carregarDados();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  async function editarFuncionario(event) {
    event.preventDefault();

    if (!funcionarioSelecionado) return;

    const form = event.target;
    const nome = form.nome.value.trim();
    const setor = form.setor.value;
    const status = form.status.value;

    if (!nome || !setor) {
      setErro("Preencha todos os campos.");
      return;
    }

    try {
      setSalvando(true);
      setErro("");

      await requisicao(
        `/funcionarios/${obterId(funcionarioSelecionado)}`,
        {
          method: "PUT",
          body: JSON.stringify({ nome, setor, status }),
        }
      );

      fecharModal();
      setMensagem("Funcionário atualizado com sucesso!");
      await carregarDados();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  // administrador gera código de recuperação
  async function gerarCodigoRecuperacao() {
    if (!funcionarioSelecionado) return;

    try {
      setGerandoCodigo(true);
      setErro("");
      setCodigoRecuperacao(null);

      const dados = await requisicao(
        `/auth/${obterId(funcionarioSelecionado)}/gerar-codigo`,
        {
          method: "POST",
        }
      );

      setCodigoRecuperacao(dados.codigo);
      setMensagem("");
    } catch (error) {
      setErro(error.message);
    } finally {
      setGerandoCodigo(false);
    }
  }

  return (
    <section className="funcionarios-page">
      <header className="funcionarios-header">
        <span>FUNCIONÁRIOS</span>
        <h1>Funcionários</h1>
        <p>Cadastro e gerenciamento de funcionários</p>
      </header>

      {erro && (
        <div className="mensagem-erro" role="alert">
          {erro}
        </div>
      )}

      {mensagem && (
        <div className="mensagem-sucesso" role="status">
          {mensagem}
        </div>
      )}

      <div className="funcionarios-cards">
        <article className="funcionario-stat-card">
          <div className="funcionario-stat-icon total">👥</div>
          <strong>{total}</strong>
          <span>Total</span>
        </article>

        <article className="funcionario-stat-card">
          <div className="funcionario-stat-icon com-armario">🔑</div>
          <strong>{comArmario}</strong>
          <span>Com armário</span>
        </article>

        <article className="funcionario-stat-card">
          <div className="funcionario-stat-icon sem-armario">🔒</div>
          <strong>{semArmario}</strong>
          <span>Sem armário</span>
        </article>

        <article className="funcionario-stat-card">
          <div className="funcionario-stat-icon fila">⏳</div>
          <strong>{naFila}</strong>
          <span>Lista de espera</span>
        </article>
      </div>

      <section className="funcionarios-filtros">
        <input
          type="text"
          placeholder="Pesquisar nome ou CPF"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
        />

        <select
          value={setorFiltro}
          onChange={(event) => setSetorFiltro(event.target.value)}
        >
          <option value="todos">Todos os setores</option>

          {setores.map((setor) => (
            <option key={setor} value={setor}>
              {setor}
            </option>
          ))}
        </select>

        <button
          className="btn-cadastrar-funcionario"
          onClick={() => abrirModal("cadastrar")}
        >
          + Cadastrar funcionário
        </button>
      </section>

      <section className="funcionarios-tabela-container">
        <table className="funcionarios-tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Setor</th>
              <th>Armário</th>
              <th>Situação</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="6" className="nenhum-funcionario">
                  Carregando funcionários...
                </td>
              </tr>
            )}

            {!loading && funcionariosFiltrados.length === 0 && (
              <tr>
                <td colSpan="6" className="nenhum-funcionario">
                  Nenhum funcionário encontrado.
                </td>
              </tr>
            )}

            {!loading &&
              funcionariosFiltrados.map((funcionario) => (
                <tr key={obterId(funcionario)}>
                  <td>
                    <div className="funcionario-info">
                      <div className="funcionario-avatar">
                        {(funcionario.nome || "")
                          .split(" ")
                          .filter(Boolean)
                          .map((nome) => nome[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>{funcionario.nome}</strong>

                        {funcionario.status === "inativo" && (
                          <span className="funcionario-inativo">
                            Inativo
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td>{mascararCpf(funcionario.cpf)}</td>

                  <td>
                    {funcionario.setor ? (
                      <span className="setor-badge">
                        {funcionario.setor}
                      </span>
                    ) : (
                      <span className="sem-dado">—</span>
                    )}
                  </td>

                  <td>
                    {obterCodigoArmario(funcionario) ? (
                      <span className="armario-chip">
                        {obterCodigoArmario(funcionario)}
                      </span>
                    ) : (
                      <span className="sem-dado">—</span>
                    )}
                  </td>

                  <td>{situacaoFuncionario(funcionario)}</td>

                  <td>
                    <div className="funcionario-acoes">
                      <button
                        className="btn-acao"
                        onClick={() => abrirModal("ver", funcionario)}
                      >
                        Ver
                      </button>

                      <button
                        className="btn-acao"
                        onClick={() => abrirModal("editar", funcionario)}
                      >
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>

      {modal === "ver" && funcionarioSelecionado && (
        <div className="modal-overlay">
          <div className="funcionario-modal">
            <button className="modal-fechar" onClick={fecharModal}>
              ×
            </button>

            <h2>{funcionarioSelecionado.nome}</h2>

            <p className="modal-subtitulo">
              Informações do funcionário
            </p>

            <div className="modal-dados">
              <p>
                <strong>CPF:</strong>{" "}
                {mascararCpf(funcionarioSelecionado.cpf)}
              </p>

              <p>
                <strong>Setor:</strong>{" "}
                {funcionarioSelecionado.setor || "—"}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {funcionarioSelecionado.status}
              </p>

              <p>
                <strong>Armário:</strong>{" "}
                {obterCodigoArmario(funcionarioSelecionado) || "Nenhum"}
              </p>

              <p>
                <strong>Situação:</strong>{" "}
                {funcionarioSelecionado.armario
                  ? "Com armário"
                  : estaNaFila(funcionarioSelecionado)
                    ? "Na lista de espera"
                    : "Sem armário"}
              </p>
            </div>

            <div style={{ marginTop: "20px" }}>
              <button
                type="button"
                className="btn-modal-salvar"
                onClick={gerarCodigoRecuperacao}
                disabled={
                  gerandoCodigo ||
                  funcionarioSelecionado.status !== "ativo"
                }
              >
                {gerandoCodigo
                  ? "Gerando código..."
                  : "Gerar código de recuperação"}
              </button>

              {codigoRecuperacao && (
                <div
                  className="modal-dados"
                  style={{ marginTop: "16px", textAlign: "center" }}
                >
                  <p>
                    <strong>Código de recuperação:</strong>
                  </p>

                  <p
                    style={{
                      fontSize: "28px",
                      fontWeight: "bold",
                      letterSpacing: "6px",
                    }}
                  >
                    {codigoRecuperacao}
                  </p>

                  <p>
                    Válido por 15 minutos. Informe este código
                    diretamente ao funcionário.
                  </p>

                  <p>
                    Atenção: o código não será exibido novamente
                    após fechar esta janela.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {modal === "cadastrar" && (
        <div className="modal-overlay">
          <div className="funcionario-modal">
            <button className="modal-fechar" onClick={fecharModal}>
              ×
            </button>

            <h2>Cadastrar funcionário</h2>

            <p className="modal-subtitulo">
              O funcionário criará a senha no primeiro acesso.
            </p>

            <form onSubmit={cadastrarFuncionario}>
              <label>Nome</label>
              <input
                name="nome"
                type="text"
                placeholder="Nome completo"
                required
              />

              <label>CPF</label>
              <input
                name="cpf"
                type="text"
                placeholder="000.000.000-00"
                maxLength={14}
                required
              />

              <label>Setor</label>
              <select name="setor" defaultValue="" required>
                <option value="" disabled>
                  Selecione um setor
                </option>
                <option>Padaria</option>
                <option>Frente de Caixa</option>
                <option>Hortifruti</option>
                <option>Açougue</option>
                <option>Reposição</option>
              </select>

              <div className="modal-botoes">
                <button
                  type="button"
                  className="btn-modal-cancelar"
                  onClick={fecharModal}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn-modal-salvar"
                  disabled={salvando}
                >
                  {salvando ? "Cadastrando..." : "Cadastrar funcionário"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === "editar" && funcionarioSelecionado && (
        <div className="modal-overlay">
          <div className="funcionario-modal">
            <button className="modal-fechar" onClick={fecharModal}>
              ×
            </button>

            <h2>Editar funcionário</h2>

            <form onSubmit={editarFuncionario}>
              <label>Nome</label>
              <input
                name="nome"
                type="text"
                defaultValue={funcionarioSelecionado.nome}
                required
              />

              <label>Setor</label>
              <select
                name="setor"
                defaultValue={funcionarioSelecionado.setor}
                required
              >
                <option>Padaria</option>
                <option>Frente de Caixa</option>
                <option>Hortifruti</option>
                <option>Açougue</option>
                <option>Reposição</option>
              </select>

              <label>Status</label>
              <select
                name="status"
                defaultValue={funcionarioSelecionado.status}
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>

              <div className="modal-botoes">
                <button
                  type="button"
                  className="btn-modal-cancelar"
                  onClick={fecharModal}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn-modal-salvar"
                  disabled={salvando}
                >
                  {salvando ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Funcionarios;
