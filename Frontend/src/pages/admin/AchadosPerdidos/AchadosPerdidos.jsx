
import { useCallback, useEffect, useMemo, useState } from "react";
import "./AchadosPerdidos.css";

const API_URL = "http://localhost:5000/api";

function obterLista(dados) {
  if (Array.isArray(dados)) return dados;
  if (Array.isArray(dados?.achados)) return dados.achados;
  if (Array.isArray(dados?.objetos)) return dados.objetos;
  return [];
}

function obterId(objeto) {
  return objeto?._id || objeto?.id;
}

function AchadosPerdidos() {
  const [objetos, setObjetos] = useState([]);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [modal, setModal] = useState(null);
  const [objetoSelecionado, setObjetoSelecionado] = useState(null);
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

  const carregarObjetos = useCallback(async () => {
    try {
      setErro("");

      const dados = await requisicao("/achados-perdidos");
      setObjetos(obterLista(dados));
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  }, [requisicao]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarObjetos();
  }, [carregarObjetos]);

  const objetosFiltrados = useMemo(() => {
    return objetos.filter((objeto) => {
      const termo = busca.trim().toLowerCase();

      const correspondeBusca =
        !termo ||
        String(objeto.objeto || "").toLowerCase().includes(termo) ||
        String(objeto.descricao || "").toLowerCase().includes(termo) ||
        String(objeto.local || "").toLowerCase().includes(termo) ||
        String(objeto.codigo || "").toLowerCase().includes(termo);

      const correspondeStatus =
        statusFiltro === "todos" || objeto.status === statusFiltro;

      return correspondeBusca && correspondeStatus;
    });
  }, [objetos, busca, statusFiltro]);

  const total = objetos.length;

  const encontrados = objetos.filter(
    (objeto) => objeto.status === "encontrado"
  ).length;

  const entregues = objetos.filter(
    (objeto) => objeto.status === "entregue"
  ).length;

  function abrirModal(tipo, objeto = null) {
    setObjetoSelecionado(objeto);
    setModal(tipo);
    setErro("");
  }

  function fecharModal() {
    setModal(null);
    setObjetoSelecionado(null);
    setErro("");
  }

  function formatarData(data) {
    if (!data) return "—";

    const dataConvertida = new Date(data);

    if (Number.isNaN(dataConvertida.getTime())) return "—";

    return dataConvertida.toLocaleDateString("pt-BR");
  }

  function gerarCodigo() {
    const maiorNumero = objetos.reduce((maior, objeto) => {
      const numero = Number(
        String(objeto.codigo || "").replace("AP-", "")
      );

      return numero > maior ? numero : maior;
    }, 0);

    return `AP-${String(maiorNumero + 1).padStart(3, "0")}`;
  }

  async function cadastrarObjeto(event) {
    event.preventDefault();

    const form = event.target;
    const nome = form.objeto.value.trim();
    const local = form.local.value.trim();
    const descricao = form.descricao.value.trim();

    if (!nome || !local || !descricao) {
      setErro("Preencha todos os campos.");
      return;
    }

    const novoObjeto = {
      codigo: gerarCodigo(),
      objeto: nome,
      descricao,
      local,
      data: new Date().toISOString().split("T")[0],
      status: "encontrado",
    };

    try {
      setSalvando(true);
      setErro("");
      setMensagem("");

      await requisicao("/achados-perdidos", {
        method: "POST",
        body: JSON.stringify(novoObjeto),
      });

      fecharModal();
      setMensagem("Objeto cadastrado com sucesso!");
      await carregarObjetos();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  async function editarObjeto(event) {
    event.preventDefault();

    if (!objetoSelecionado) return;

    const form = event.target;
    const nome = form.objeto.value.trim();
    const local = form.local.value.trim();
    const descricao = form.descricao.value.trim();
    const status = form.status.value;

    if (!nome || !local || !descricao) {
      setErro("Preencha todos os campos.");
      return;
    }

    const id = obterId(objetoSelecionado);

    try {
      setSalvando(true);
      setErro("");
      setMensagem("");

      await requisicao(`/achados-perdidos/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          objeto: nome,
          local,
          descricao,
          status,
        }),
      });

      fecharModal();
      setMensagem("Objeto atualizado com sucesso!");
      await carregarObjetos();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  async function removerObjeto() {
    if (!objetoSelecionado) return;

    const confirmar = window.confirm(
      `Deseja remover "${objetoSelecionado.objeto}" do sistema?`
    );

    if (!confirmar) return;

    try {
      setSalvando(true);
      setErro("");
      setMensagem("");

      await requisicao(
        `/achados-perdidos/${obterId(objetoSelecionado)}`,
        { method: "DELETE" }
      );

      fecharModal();
      setMensagem("Objeto removido com sucesso!");
      await carregarObjetos();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  async function marcarComoEntregue(objeto) {
    const confirmar = window.confirm(
      `Deseja marcar "${objeto.objeto}" como entregue?`
    );

    if (!confirmar) return;

    try {
      setSalvando(true);
      setErro("");
      setMensagem("");

      await requisicao(`/achados-perdidos/${obterId(objeto)}`, {
        method: "PUT",
        body: JSON.stringify({ status: "entregue" }),
      });

      setMensagem("Objeto marcado como entregue!");
      await carregarObjetos();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="achados-page">
      <header className="achados-header">
        <span>ACHADOS E PERDIDOS</span>

        <h1>Achados e Perdidos</h1>

        <p>
          Controle de objetos encontrados e devolvidos aos funcionários
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

      <div className="achados-cards">
        <article className="achados-card">
          <div className="achados-icon total">📦</div>
          <strong>{total}</strong>
          <span>Total de objetos</span>
        </article>

        <article className="achados-card">
          <div className="achados-icon encontrado">🔍</div>
          <strong>{encontrados}</strong>
          <span>Encontrados</span>
        </article>

        <article className="achados-card">
          <div className="achados-icon entregue">✅</div>
          <strong>{entregues}</strong>
          <span>Entregues</span>
        </article>
      </div>

      <section className="achados-filtros">
        <input
          type="text"
          placeholder="Pesquisar objeto ou descrição"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
        />

        <select
          value={statusFiltro}
          onChange={(event) => setStatusFiltro(event.target.value)}
        >
          <option value="todos">Todos</option>
          <option value="encontrado">Encontrados</option>
          <option value="entregue">Entregues</option>
        </select>

        <button
          className="btn-cadastrar-objeto"
          onClick={() => abrirModal("cadastrar")}
        >
          + Cadastrar objeto
        </button>

        <button
          className="btn-atualizar-fila"
          onClick={carregarObjetos}
          disabled={loading}
        >
          Atualizar
        </button>
      </section>

      <section className="achados-tabela-container">
        <table className="achados-tabela">
          <thead>
            <tr>
              <th>Objeto</th>
              <th>Descrição</th>
              <th>Local encontrado</th>
              <th>Data</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="6" className="achados-vazio">
                  Carregando objetos...
                </td>
              </tr>
            )}

            {!loading && objetosFiltrados.length === 0 && (
              <tr>
                <td colSpan="6" className="achados-vazio">
                  Nenhum objeto encontrado.
                </td>
              </tr>
            )}

            {!loading &&
              objetosFiltrados.map((objeto) => (
                <tr key={obterId(objeto)}>
                  <td>
                    <div className="objeto-info">
                      <div className="objeto-emoji">📦</div>

                      <div>
                        <strong>{objeto.objeto}</strong>
                        <span>{objeto.codigo}</span>
                      </div>
                    </div>
                  </td>

                  <td>{objeto.descricao}</td>

                  <td>
                    <span className="local-badge">{objeto.local}</span>
                  </td>

                  <td>{formatarData(objeto.data)}</td>

                  <td>
                    <span className={`achados-status ${objeto.status}`}>
                      ●{" "}
                      {objeto.status === "encontrado"
                        ? "Encontrado"
                        : "Entregue"}
                    </span>
                  </td>

                  <td>
                    <div className="achados-acoes">
                      <button
                        className="btn-achados-acao"
                        onClick={() => abrirModal("ver", objeto)}
                      >
                        Ver
                      </button>

                      <button
                        className="btn-achados-acao"
                        onClick={() => abrirModal("editar", objeto)}
                      >
                        Editar
                      </button>

                      {objeto.status === "encontrado" && (
                        <button
                          className="btn-marcar-entregue"
                          onClick={() => marcarComoEntregue(objeto)}
                          disabled={salvando}
                        >
                          Marcar entregue
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>

      {modal === "cadastrar" && (
        <div className="modal-overlay">
          <div className="achados-modal">
            <button className="modal-fechar" onClick={fecharModal}>
              ×
            </button>

            <h2>Registrar item encontrado</h2>

            <p className="modal-subtitulo">
              Descreva o objeto encontrado no vestiário para que o dono
              possa recuperá-lo.
            </p>

            <form onSubmit={cadastrarObjeto}>
              <label>Item</label>

              <input
                name="objeto"
                type="text"
                placeholder="Ex: Garrafa térmica"
                required
              />

              <label>Local</label>

              <input
                name="local"
                type="text"
                placeholder="Ex: Vestiário masculino, próximo à entrada"
                required
              />

              <label>Descrição</label>

              <textarea
                name="descricao"
                placeholder="Detalhes que ajudem o dono a identificar o objeto"
                required
              />

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
                  {salvando ? "Registrando..." : "Registrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === "ver" && objetoSelecionado && (
        <div className="modal-overlay">
          <div className="achados-modal">
            <button className="modal-fechar" onClick={fecharModal}>
              ×
            </button>

            <h2>{objetoSelecionado.objeto}</h2>

            <p className="modal-subtitulo">
              {objetoSelecionado.codigo}
            </p>

            <div className="modal-dados">
              <p>
                <strong>Descrição:</strong> {objetoSelecionado.descricao}
              </p>

              <p>
                <strong>Local:</strong> {objetoSelecionado.local}
              </p>

              <p>
                <strong>Data:</strong>{" "}
                {formatarData(objetoSelecionado.data)}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {objetoSelecionado.status === "encontrado"
                  ? "Encontrado"
                  : "Entregue"}
              </p>
            </div>
          </div>
        </div>
      )}

      {modal === "editar" && objetoSelecionado && (
        <div className="modal-overlay">
          <div className="achados-modal">
            <button className="modal-fechar" onClick={fecharModal}>
              ×
            </button>

            <h2>Editar objeto</h2>

            <form onSubmit={editarObjeto}>
              <label>Item</label>

              <input
                name="objeto"
                type="text"
                defaultValue={objetoSelecionado.objeto}
                required
              />

              <label>Local</label>

              <input
                name="local"
                type="text"
                defaultValue={objetoSelecionado.local}
                required
              />

              <label>Descrição</label>

              <textarea
                name="descricao"
                defaultValue={objetoSelecionado.descricao}
                required
              />

              <label>Status</label>

              <select
                name="status"
                defaultValue={objetoSelecionado.status}
              >
                <option value="encontrado">Encontrado</option>
                <option value="entregue">Entregue</option>
              </select>

              <div className="modal-remover-area">
                <button
                  type="button"
                  className="btn-remover-objeto"
                  onClick={removerObjeto}
                  disabled={salvando}
                >
                  Remover objeto
                </button>
              </div>

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

export default AchadosPerdidos;
