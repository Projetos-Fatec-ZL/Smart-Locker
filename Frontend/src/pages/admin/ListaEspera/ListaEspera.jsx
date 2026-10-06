import { useMemo, useState } from "react";

import { listaEsperaMock } from "./listaEsperaMock";
import { armariosMock } from "../../../data/mockData";

import "./ListaEspera.css";

function ListaEspera() {
  const [fila, setFila] = useState(listaEsperaMock);

  const [armarios, setArmarios] = useState(armariosMock);

  const [busca, setBusca] = useState("");
  const [setorFiltro, setSetorFiltro] = useState("todos");

  const [modal, setModal] = useState(null);

  const [
    funcionarioSelecionado,
    setFuncionarioSelecionado,
  ] = useState(null);

  const [armarioSelecionado, setArmarioSelecionado] =
    useState("");

  const setores = useMemo(() => {
    return [
      ...new Set(
        fila
          .map((funcionario) => funcionario.setor)
          .filter(Boolean)
      ),
    ].sort();
  }, [fila]);

  const armariosLivres = armarios.filter(
    (armario) => armario.status === "livre"
  );

  const filaFiltrada = useMemo(() => {
    return fila.filter((funcionario) => {
      const termo = busca.trim().toLowerCase();

      const cpf = funcionario.cpf.replace(/\D/g, "");

      const termoCpf = termo.replace(/\D/g, "");

      const correspondeBusca =
        !termo ||
        funcionario.nome.toLowerCase().includes(termo) ||
        funcionario.cpf.includes(termo) ||
        cpf.includes(termoCpf);

      const correspondeSetor =
        setorFiltro === "todos" ||
        funcionario.setor === setorFiltro;

      return correspondeBusca && correspondeSetor;
    });
  }, [fila, busca, setorFiltro]);

  const proximo = fila[0];

  function formatarData(data) {
    return new Date(
      `${data}T12:00:00`
    ).toLocaleDateString("pt-BR");
  }

  function mascararCpf(cpf) {
    if (!cpf) {
      return "—";
    }

    return cpf.replace(
      /(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/,
      "***.$2.$3-**"
    );
  }

  function iniciais(nome) {
    return nome
      .split(" ")
      .map((parte) => parte[0])
      .slice(0, 2)
      .join("");
  }

  function abrirModal(tipo, funcionario) {
    setFuncionarioSelecionado(funcionario);

    setModal(tipo);

    setArmarioSelecionado("");
  }

  function fecharModal() {
    setModal(null);

    setFuncionarioSelecionado(null);

    setArmarioSelecionado("");
  }

  function removerDaFila(funcionario) {
    const confirmar = window.confirm(
      `Deseja remover ${funcionario.nome} da lista de espera?`
    );

    if (!confirmar) {
      return;
    }

    setFila((filaAtual) =>
      filaAtual.filter(
        (item) => item.id !== funcionario.id
      )
    );
  }

  function associarArmario() {
    if (!armarioSelecionado) {
      alert("Selecione um armário.");

      return;
    }

    const armario = armarios.find(
      (item) =>
        String(item.id) ===
        String(armarioSelecionado)
    );

    if (!armario) {
      return;
    }

    setArmarios((anteriores) =>
      anteriores.map((item) =>
        item.id === armario.id
          ? {
              ...item,
              status: "ocupado",
              funcionario:
                funcionarioSelecionado.nome,
              setor:
                funcionarioSelecionado.setor,
              chaveStatus:
                "aguardando_retirada",
            }
          : item
      )
    );

    setFila((filaAtual) =>
      filaAtual.filter(
        (item) =>
          item.id !==
          funcionarioSelecionado.id
      )
    );

    fecharModal();
  }

  return (
    <section className="lista-espera-page">

      {/* CABEÇALHO */}

      <header className="lista-espera-header">
        <span>
          LISTA DE ESPERA
        </span>

        <h1>
          Lista de Espera
        </h1>

        <p>
          Funcionários aguardando a disponibilidade
          de um armário
        </p>
      </header>


      {/* RESUMO */}

      <div className="fila-resumo">

        <article className="fila-total-card">
          <span>
            TOTAL NA FILA
          </span>

          <strong>
            {fila.length}
          </strong>

          <p>
            funcionários
            <br />
            aguardando
          </p>
        </article>


        {proximo && (
          <article className="proximo-card">

            <span>
              PRÓXIMO DA FILA
            </span>

            <strong>
              {proximo.nome}
            </strong>

            <p>
              {proximo.setor} · desde{" "}
              {formatarData(proximo.data)}
            </p>

          </article>
        )}

      </div>


      {/* FILTROS */}

      <section className="lista-espera-filtros">

        <input
          type="text"
          placeholder="Pesquisar funcionário ou CPF"
          value={busca}
          onChange={(event) =>
            setBusca(event.target.value)
          }
        />

        <select
          value={setorFiltro}
          onChange={(event) =>
            setSetorFiltro(event.target.value)
          }
        >
          <option value="todos">
            Todos os setores
          </option>

          {setores.map((setor) => (
            <option
              key={setor}
              value={setor}
            >
              {setor}
            </option>
          ))}
        </select>

        <button
          className="btn-atualizar-fila"
          onClick={() => {
            setBusca("");
            setSetorFiltro("todos");
          }}
        >
          Atualizar
        </button>

      </section>


      {/* TABELA */}

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

            {filaFiltrada.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="fila-vazia"
                >
                  Nenhum funcionário encontrado.
                </td>
              </tr>
            )}


            {filaFiltrada.map((funcionario) => {
              const posicao =
                fila.findIndex(
                  (item) =>
                    item.id === funcionario.id
                ) + 1;

              const primeiro = posicao === 1;

              return (
                <tr
                  key={funcionario.id}
                  className={
                    primeiro
                      ? "proximo-fila-row"
                      : ""
                  }
                >

                  <td>
                    <div className="posicao-container">

                      <span
                        className={`posicao ${
                          primeiro
                            ? "primeiro"
                            : ""
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
                        {iniciais(
                          funcionario.nome
                        )}
                      </div>

                      <strong>
                        {funcionario.nome}
                      </strong>

                    </div>
                  </td>


                  <td>
                    {mascararCpf(
                      funcionario.cpf
                    )}
                  </td>


                  <td>
                    <span className="fila-setor">
                      {funcionario.setor}
                    </span>
                  </td>


                  <td>
                    {formatarData(
                      funcionario.data
                    )}
                  </td>


                  <td>
                    <span className="fila-status">
                      ● Aguardando
                    </span>
                  </td>


                  <td>
                    <div className="fila-acoes">

                      <button
                        className="btn-fila-acao"
                        onClick={() =>
                          abrirModal(
                            "ver",
                            funcionario
                          )
                        }
                      >
                        Ver
                      </button>


                      {primeiro && (
                        <button
                          className="btn-associar-fila"
                          onClick={() =>
                            abrirModal(
                              "associar",
                              funcionario
                            )
                          }
                        >
                          Associar armário
                        </button>
                      )}


                      <button
                        className="btn-fila-acao"
                        onClick={() =>
                          removerDaFila(
                            funcionario
                          )
                        }
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


      {/* MODAL ASSOCIAR ARMÁRIO */}

      {modal === "associar" &&
        funcionarioSelecionado && (

        <div className="modal-overlay">

          <div className="lista-espera-modal">

            <button
              className="modal-fechar"
              onClick={fecharModal}
            >
              ×
            </button>


            <h2>
              Atribuir armário a{" "}
              {funcionarioSelecionado.nome}
            </h2>


            <p className="modal-subtitulo">
              A associação registra a chave como
              aguardando retirada e remove o funcionário
              da fila de espera.
            </p>


            <label>
              Armários livres
            </label>


            <select
              value={armarioSelecionado}
              onChange={(event) =>
                setArmarioSelecionado(
                  event.target.value
                )
              }
            >

              <option value="">
                Selecione um armário
              </option>


              {armariosLivres.map((armario) => (
                <option
                  key={armario.id}
                  value={armario.id}
                >
                  Armário {armario.numero}
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
              >
                Cancelar
              </button>


              <button
                className="btn-modal-salvar"
                disabled={
                  !armarioSelecionado
                }
                onClick={associarArmario}
              >
                Confirmar
              </button>

            </div>

          </div>

        </div>
      )}


      {/* MODAL VER */}

      {modal === "ver" &&
        funcionarioSelecionado && (

        <div className="modal-overlay">

          <div className="lista-espera-modal">

            <button
              className="modal-fechar"
              onClick={fecharModal}
            >
              ×
            </button>


            <h2>
              {funcionarioSelecionado.nome}
            </h2>


            <p className="modal-subtitulo">
              Informações da solicitação
            </p>


            <div className="modal-dados">

              <p>
                <strong>CPF:</strong>{" "}
                {mascararCpf(
                  funcionarioSelecionado.cpf
                )}
              </p>

              <p>
                <strong>Setor:</strong>{" "}
                {funcionarioSelecionado.setor}
              </p>

              <p>
                <strong>Solicitação:</strong>{" "}
                {formatarData(
                  funcionarioSelecionado.data
                )}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                Aguardando
              </p>

            </div>

          </div>

        </div>
      )}

    </section>
  );
}

export default ListaEspera;