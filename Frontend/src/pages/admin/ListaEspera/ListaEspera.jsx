
import { useCallback, useEffect, useMemo, useState } from "react";
import "./ListaEspera.css";

const API_URL = "http://localhost:5000/api";

function obterId(valor) {
  if (!valor) return null;
  if (typeof valor === "object") return valor._id || valor.id || null;
  return valor;
}

function obterLista(dados, propriedade) {
  if (Array.isArray(dados)) return dados;
  if (Array.isArray(dados?.[propriedade])) return dados[propriedade];
  if (Array.isArray(dados?.listaEspera)) return dados.listaEspera;
  return [];
}

function ListaEspera() {
  const [fila, setFila] = useState([]);
  const [armarios, setArmarios] = useState([]);
  const [chaves, setChaves] = useState([]);
  const [busca, setBusca] = useState("");
  const [setorFiltro, setSetorFiltro] = useState("todos");
  const [modal, setModal] = useState(null);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  const [armarioSelecionado, setArmarioSelecionado] = useState("");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
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

      const [dadosFila, dadosArmarios, dadosFuncionarios, dadosChaves] =
        await Promise.all([
          requisicao("/lista-espera"),
          requisicao("/armarios"),
          requisicao("/funcionarios"),
          requisicao("/chaves"),
        ]);

      const registros = obterLista(dadosFila, "registros");
      const listaArmarios = obterLista(dadosArmarios, "armarios");
      const listaFuncionarios = obterLista(
        dadosFuncionarios,
        "funcionarios"
      );
      const listaChaves = obterLista(dadosChaves, "chaves");

      const funcionariosPorId = new Map(
        listaFuncionarios.map((funcionario) => [
          String(obterId(funcionario)),
          funcionario,
        ])
      );

      const registrosAguardando = registros
        .filter((registro) => registro.status === "aguardando")
        .map((registro) => {
          const funcionario =
            typeof registro.funcionario === "object"
              ? registro.funcionario
              : funcionariosPorId.get(String(registro.funcionario));

          if (!funcionario) return null;

          return {
            ...funcionario,
            id: obterId(funcionario),
            registroId: obterId(registro),
            data: registro.createdAt || registro.data,
            status: registro.status,
            armario: registro.armario || null,
          };
        })
        .filter(Boolean)
        .sort(
          (a, b) => new Date(a.data || 0) - new Date(b.data || 0)
        );

      setFila(registrosAguardando);
      setArmarios(listaArmarios);
      setChaves(listaChaves);
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  }, [requisicao]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const setores = useMemo(() => {
    return [
      ...new Set(
        fila.map((funcionario) => funcionario.setor).filter(Boolean)
      ),
    ].sort();
  }, [fila]);

  const armariosLivres = useMemo(() => {
    return armarios.filter((armario) => armario.status === "livre");
  }, [armarios]);

  const filaFiltrada = useMemo(() => {
    return fila.filter((funcionario) => {
      const termo = busca.trim().toLowerCase();
      const cpf = String(funcionario.cpf || "").replace(/\D/g, "");
      const termoCpf = termo.replace(/\D/g, "");

      const correspondeBusca =
        !termo ||
        String(funcionario.nome || "").toLowerCase().includes(termo) ||
        String(funcionario.cpf || "").includes(termo) ||
        cpf.includes(termoCpf);

      const correspondeSetor =
        setorFiltro === "todos" || funcionario.setor === setorFiltro;

      return correspondeBusca && correspondeSetor;
    });
  }, [fila, busca, setorFiltro]);

  const proximo = fila[0];

  function formatarData(data) {
    if (!data) return "—";

    const dataConvertida = new Date(data);

    if (Number.isNaN(dataConvertida.getTime())) return "—";

    return dataConvertida.toLocaleDateString("pt-BR");
  }

  function mascararCpf(cpf) {
    if (!cpf) return "—";

    const numeros = String(cpf).replace(/\D/g, "");

    if (numeros.length !== 11) return "—";

    return `***.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-**`;
  }

  function iniciais(nome) {
    return String(nome || "")
      .split(" ")
      .filter(Boolean)
      .map((parte) => parte[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  function abrirModal(tipo, funcionario) {
    setFuncionarioSelecionado(funcionario);
    setModal(tipo);
    setArmarioSelecionado("");
    setErro("");
  }

  function fecharModal() {
    setModal(null);
    setFuncionarioSelecionado(null);
    setArmarioSelecionado("");
    setErro("");
  }

  async function removerDaFila(funcionario) {
    const confirmar = window.confirm(
      `Deseja remover ${funcionario.nome} da lista de espera?`
    );

    if (!confirmar) return;

    try {
      setSalvando(true);
      setErro("");
      setMensagem("");

      await requisicao(`/lista-espera/${funcionario.registroId}`, {
        method: "DELETE",
      });

      setMensagem("Solicitação removida da lista de espera.");
      await carregarDados();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  async function associarArmario() {
    if (!armarioSelecionado) {
      setErro("Selecione um armário.");
      return;
    }

    const armario = armarios.find(
      (item) => String(obterId(item)) === String(armarioSelecionado)
    );

    if (!armario || armario.status !== "livre") {
      setErro("Este armário não está mais disponível.");
      await carregarDados();
      return;
    }

    if (funcionarioSelecionado.armario) {
      setErro("Este funcionário já possui um armário associado.");
      return;
    }

    const funcionarioId = obterId(funcionarioSelecionado);
    const armarioId = obterId(armario);
    const chave = chaves.find(
      (item) => String(obterId(item.armario)) === String(armarioId)
    );

    try {
      setSalvando(true);
      setErro("");
      setMensagem("");

      await requisicao(`/funcionarios/${funcionarioId}`, {
        method: "PUT",
        body: JSON.stringify({ armario: armarioId }),
      });

      await requisicao(`/armarios/${armarioId}`, {
        method: "PUT",
        body: JSON.stringify({ status: "ocupado" }),
      });

      if (chave) {
        await requisicao(`/chaves/${obterId(chave)}`, {
          method: "PUT",
          body: JSON.stringify({ status: "entregue" }),
        });
      }

      await requisicao(`/lista-espera/${funcionarioSelecionado.registroId}`, {
        method: "DELETE",
      });

      fecharModal();
      setMensagem("Armário associado ao funcionário com sucesso!");
      await carregarDados();
    } catch (error) {
      setErro(
        `${error.message} Confira os dados do funcionário, armário e chave antes de tentar novamente.`
      );
      await carregarDados();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="lista-espera-page">
      <header className="lista-espera-header">
        <span>LISTA DE ESPERA</span>

        <h1>Lista de Espera</h1>

        <p>
          Funcionários aguardando a disponibilidade de um armário
        </p>
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

      <div className="fila-resumo">
        <article className="fila-total-card">
          <span>TOTAL NA FILA</span>

          <strong>{fila.length}</strong>

          <p>
            funcionários
            <br />
            aguardando
          </p>
        </article>

        {proximo && (
          <article className="proximo-card">
            <span>PRÓXIMO DA FILA</span>

            <strong>{proximo.nome}</strong>

            <p>
              {proximo.setor} · desde {formatarData(proximo.data)}
            </p>
          </article>
        )}
      </div>

      <section className="lista-espera-filtros">
        <input
          type="text"
          placeholder="Pesquisar funcionário ou CPF"
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
          className="btn-atualizar-fila"
          onClick={() => {
            setBusca("");
            setSetorFiltro("todos");
            carregarDados();
          }}
          disabled={loading}
        >
          Atualizar
        </button>
      </section>

      <section className="lista-espera-tabela-container">
        <table className="lista-espera-tabela">
          <thead>
            <tr>
              <th>Posição</th>
              <th>Funcionário</th>
              <th>CPF</th>
              <th>Setor</th>
              <th>Data</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="7" className="fila-vazia">
                  Carregando lista de espera...
                </td>
              </tr>
            )}

            {!loading && filaFiltrada.length === 0 && (
              <tr>
                <td colSpan="7" className="fila-vazia">
                  Nenhum funcionário encontrado.
                </td>
              </tr>
            )}

            {!loading &&
              filaFiltrada.map((funcionario) => {
                const posicao =
                  fila.findIndex(
                    (item) =>
                      item.registroId === funcionario.registroId
                  ) + 1;

                const primeiro = posicao === 1;

                return (
                  <tr
                    key={funcionario.registroId}
                    className={primeiro ? "proximo-fila-row" : ""}
                  >
                    <td>
                      <div className="posicao-container">
                        <span
                          className={`posicao ${
                            primeiro ? "primeiro" : ""
                          }`}
                        >
                          {posicao}
                        </span>

                        {primeiro && (
                          <span className="proximo-badge">
                            PRÓXIMO
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="fila-funcionario">
                        <div className="fila-avatar">
                          {iniciais(funcionario.nome)}
                        </div>

                        <strong>{funcionario.nome}</strong>
                      </div>
                    </td>

                    <td>{mascararCpf(funcionario.cpf)}</td>

                    <td>
                      <span className="fila-setor">
                        {funcionario.setor}
                      </span>
                    </td>

                    <td>{formatarData(funcionario.data)}</td>

                    <td>
                      <span className="fila-status">
                        ● Aguardando
                      </span>
                    </td>

                    <td>
                      <div className="fila-acoes">
                        <button
                          className="btn-fila-acao"
                          onClick={() => abrirModal("ver", funcionario)}
                        >
                          Ver
                        </button>

                        {primeiro && (
                          <button
                            className="btn-associar-fila"
                            onClick={() =>
                              abrirModal("associar", funcionario)
                            }
                          >
                            Associar armário
                          </button>
                        )}

                        <button
                          className="btn-fila-acao"
                          onClick={() => removerDaFila(funcionario)}
                          disabled={salvando}
                        >
                          Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </section>

      {modal === "associar" && funcionarioSelecionado && (
        <div className="modal-overlay">
          <div className="lista-espera-modal">
            <button className="modal-fechar" onClick={fecharModal}>
              ×
            </button>

            <h2>
              Atribuir armário a {funcionarioSelecionado.nome}
            </h2>

            <p className="modal-subtitulo">
              A associação vincula o armário ao funcionário, atualiza o
              status da chave e remove a solicitação da fila de espera.
            </p>

            <label>Armários livres</label>

            <select
              value={armarioSelecionado}
              onChange={(event) =>
                setArmarioSelecionado(event.target.value)
              }
            >
              <option value="">Selecione um armário</option>

              {armariosLivres.map((armario) => (
                <option
                  key={obterId(armario)}
                  value={obterId(armario)}
                >
                  Armário {armario.codigo}
                </option>
              ))}
            </select>

            {armariosLivres.length === 0 && (
              <p className="sem-armarios-livres">
                Nenhum armário disponível no momento.
              </p>
            )}

            <div className="modal-botoes">
              <button
                className="btn-modal-cancelar"
                onClick={fecharModal}
                disabled={salvando}
              >
                Cancelar
              </button>

              <button
                className="btn-modal-salvar"
                disabled={!armarioSelecionado || salvando}
                onClick={associarArmario}
              >
                {salvando ? "Associando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === "ver" && funcionarioSelecionado && (
        <div className="modal-overlay">
          <div className="lista-espera-modal">
            <button className="modal-fechar" onClick={fecharModal}>
              ×
            </button>

            <h2>{funcionarioSelecionado.nome}</h2>

            <p className="modal-subtitulo">
              Informações da solicitação
            </p>

            <div className="modal-dados">
              <p>
                <strong>CPF:</strong>{" "}
                {mascararCpf(funcionarioSelecionado.cpf)}
              </p>

              <p>
                <strong>Setor:</strong> {funcionarioSelecionado.setor}
              </p>

              <p>
                <strong>Solicitação:</strong>{" "}
                {formatarData(funcionarioSelecionado.data)}
              </p>

              <p>
                <strong>Status:</strong> Aguardando
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ListaEspera;
