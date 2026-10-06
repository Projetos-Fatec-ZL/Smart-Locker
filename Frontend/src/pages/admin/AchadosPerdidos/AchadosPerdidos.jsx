import { useMemo, useState } from "react";
import { achadosPerdidosMock } from "./achadosPerdidosMock";
import "./AchadosPerdidos.css";

function AchadosPerdidos() {
  const [objetos, setObjetos] = useState(achadosPerdidosMock);

  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");

  const [modal, setModal] = useState(null);
  const [objetoSelecionado, setObjetoSelecionado] = useState(null);

  const objetosFiltrados = useMemo(() => {
    return objetos.filter((objeto) => {
      const termo = busca.trim().toLowerCase();

      const correspondeBusca =
        !termo ||
        objeto.objeto.toLowerCase().includes(termo) ||
        objeto.descricao.toLowerCase().includes(termo);

      const correspondeStatus =
        statusFiltro === "todos" ||
        objeto.status === statusFiltro;

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
  }

  function fecharModal() {
    setModal(null);
    setObjetoSelecionado(null);
  }

  function formatarData(data) {
    return new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR");
  }

  function gerarCodigo() {
    const maiorNumero = objetos.reduce((maior, objeto) => {
      const numero = Number(
        objeto.codigo.replace("AP-", "")
      );

      return numero > maior ? numero : maior;
    }, 0);

    return `AP-${String(maiorNumero + 1).padStart(3, "0")}`;
  }

  function cadastrarObjeto(event) {
    event.preventDefault();

    const form = event.target;

    const nome = form.objeto.value.trim();
    const local = form.local.value.trim();
    const descricao = form.descricao.value.trim();

    if (!nome || !local || !descricao) {
      alert("Preencha todos os campos.");
      return;
    }

    const novoObjeto = {
      id: Date.now(),
      codigo: gerarCodigo(),
      objeto: nome,
      descricao,
      local,
      data: new Date().toISOString().split("T")[0],
      status: "encontrado",
    };

    setObjetos((anteriores) => [
      ...anteriores,
      novoObjeto,
    ]);

    fecharModal();
  }

  function editarObjeto(event) {
    event.preventDefault();

    if (!objetoSelecionado) {
      return;
    }

    const form = event.target;

    const nome = form.objeto.value.trim();
    const local = form.local.value.trim();
    const descricao = form.descricao.value.trim();
    const status = form.status.value;

    if (!nome || !local || !descricao) {
      alert("Preencha todos os campos.");
      return;
    }

    setObjetos((anteriores) =>
      anteriores.map((item) =>
        item.id === objetoSelecionado.id
          ? {
              ...item,
              objeto: nome,
              local,
              descricao,
              status,
            }
          : item
      )
    );

    fecharModal();
  }

  function removerObjeto() {
    if (!objetoSelecionado) {
      return;
    }

    const confirmar = window.confirm(
      `Deseja remover "${objetoSelecionado.objeto}" do sistema?`
    );

    if (!confirmar) {
      return;
    }

    setObjetos((anteriores) =>
      anteriores.filter(
        (item) => item.id !== objetoSelecionado.id
      )
    );

    fecharModal();
  }

  function marcarComoEntregue(objeto) {
    const confirmar = window.confirm(
      `Deseja marcar "${objeto.objeto}" como entregue?`
    );

    if (!confirmar) {
      return;
    }

    setObjetos((anteriores) =>
      anteriores.map((item) =>
        item.id === objeto.id
          ? {
              ...item,
              status: "entregue",
            }
          : item
      )
    );
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


      <div className="achados-cards">

        <article className="achados-card">
          <div className="achados-icon total">
            📦
          </div>

          <strong>{total}</strong>

          <span>Total de objetos</span>
        </article>


        <article className="achados-card">
          <div className="achados-icon encontrado">
            🔍
          </div>

          <strong>{encontrados}</strong>

          <span>Encontrados</span>
        </article>


        <article className="achados-card">
          <div className="achados-icon entregue">
            ✅
          </div>

          <strong>{entregues}</strong>

          <span>Entregues</span>
        </article>

      </div>


      <section className="achados-filtros">

        <input
          type="text"
          placeholder="Pesquisar objeto ou descrição"
          value={busca}
          onChange={(event) =>
            setBusca(event.target.value)
          }
        />

        <select
          value={statusFiltro}
          onChange={(event) =>
            setStatusFiltro(event.target.value)
          }
        >
          <option value="todos">
            Todos
          </option>

          <option value="encontrado">
            Encontrados
          </option>

          <option value="entregue">
            Entregues
          </option>
        </select>

        <button
          className="btn-cadastrar-objeto"
          onClick={() =>
            abrirModal("cadastrar")
          }
        >
          + Cadastrar objeto
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

            {objetosFiltrados.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="achados-vazio"
                >
                  Nenhum objeto encontrado.
                </td>
              </tr>
            )}


            {objetosFiltrados.map((objeto) => (

              <tr key={objeto.id}>

                <td>

                  <div className="objeto-info">

                    <div className="objeto-emoji">
                      📦
                    </div>

                    <div>
                      <strong>
                        {objeto.objeto}
                      </strong>

                      <span>
                        {objeto.codigo}
                      </span>
                    </div>

                  </div>

                </td>


                <td>
                  {objeto.descricao}
                </td>


                <td>
                  <span className="local-badge">
                    {objeto.local}
                  </span>
                </td>


                <td>
                  {formatarData(objeto.data)}
                </td>


                <td>

                  <span
                    className={`achados-status ${objeto.status}`}
                  >
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
                      onClick={() =>
                        abrirModal(
                          "ver",
                          objeto
                        )
                      }
                    >
                      Ver
                    </button>


                    <button
                      className="btn-achados-acao"
                      onClick={() =>
                        abrirModal(
                          "editar",
                          objeto
                        )
                      }
                    >
                      Editar
                    </button>


                    {objeto.status ===
                      "encontrado" && (

                      <button
                        className="btn-marcar-entregue"
                        onClick={() =>
                          marcarComoEntregue(
                            objeto
                          )
                        }
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

            <button
              className="modal-fechar"
              onClick={fecharModal}
            >
              ×
            </button>


            <h2>
              Registrar item encontrado
            </h2>


            <p className="modal-subtitulo">
              Descreva o objeto encontrado no vestiário para que o dono possa recuperá-lo.
            </p>


            <form onSubmit={cadastrarObjeto}>

              <label>
                Item
              </label>

              <input
                name="objeto"
                type="text"
                placeholder="Ex: Garrafa térmica"
              />


              <label>
                Local
              </label>

              <input
                name="local"
                type="text"
                placeholder="Ex: Vestiário masculino, próximo à entrada"
              />


              <label>
                Descrição
              </label>

              <textarea
                name="descricao"
                placeholder="Detalhes que ajudem o dono a identificar o objeto"
              />


              <div className="modal-botoes">

                <button
                  type="button"
                  className="btn-modal-cancelar"
                  onClick={fecharModal}
                >
                  Cancelar
                </button>


                <button
                  type="submit"
                  className="btn-modal-salvar"
                >
                  Registrar
                </button>

              </div>

            </form>

          </div>

        </div>
      )}


      {modal === "ver" &&
        objetoSelecionado && (

        <div className="modal-overlay">

          <div className="achados-modal">

            <button
              className="modal-fechar"
              onClick={fecharModal}
            >
              ×
            </button>


            <h2>
              {objetoSelecionado.objeto}
            </h2>


            <p className="modal-subtitulo">
              {objetoSelecionado.codigo}
            </p>


            <div className="modal-dados">

              <p>
                <strong>Descrição:</strong>{" "}
                {objetoSelecionado.descricao}
              </p>

              <p>
                <strong>Local:</strong>{" "}
                {objetoSelecionado.local}
              </p>

              <p>
                <strong>Data:</strong>{" "}
                {formatarData(
                  objetoSelecionado.data
                )}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {objetoSelecionado.status ===
                "encontrado"
                  ? "Encontrado"
                  : "Entregue"}
              </p>

            </div>

          </div>

        </div>
      )}


      {modal === "editar" &&
        objetoSelecionado && (

        <div className="modal-overlay">

          <div className="achados-modal">

            <button
              className="modal-fechar"
              onClick={fecharModal}
            >
              ×
            </button>


            <h2>
              Editar objeto
            </h2>


            <form onSubmit={editarObjeto}>

              <label>
                Item
              </label>

              <input
                name="objeto"
                type="text"
                defaultValue={
                  objetoSelecionado.objeto
                }
              />


              <label>
                Local
              </label>

              <input
                name="local"
                type="text"
                defaultValue={
                  objetoSelecionado.local
                }
              />


              <label>
                Descrição
              </label>

              <textarea
                name="descricao"
                defaultValue={
                  objetoSelecionado.descricao
                }
              />


              <label>
                Status
              </label>

              <select
                name="status"
                defaultValue={
                  objetoSelecionado.status
                }
              >
                <option value="encontrado">
                  Encontrado
                </option>

                <option value="entregue">
                  Entregue
                </option>
              </select>


              <div className="modal-remover-area">

                <button
                  type="button"
                  className="btn-remover-objeto"
                  onClick={removerObjeto}
                >
                  Remover objeto
                </button>

              </div>


              <div className="modal-botoes">

                <button
                  type="button"
                  className="btn-modal-cancelar"
                  onClick={fecharModal}
                >
                  Cancelar
                </button>


                <button
                  type="submit"
                  className="btn-modal-salvar"
                >
                  Salvar alterações
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