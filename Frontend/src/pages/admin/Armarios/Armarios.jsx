import { useMemo, useState } from "react";
import { armariosMock } from "../../../data/mockData";
import "./Armarios.css";

function Armarios() {
  const [armarios, setArmarios] = useState(armariosMock);

  const [busca, setBusca] = useState("");
  const [vestiario, setVestiario] = useState("todos");
  const [status, setStatus] = useState("todos");

  const [armarioSelecionado, setArmarioSelecionado] =
    useState(null);

  const [modal, setModal] = useState(null);

  const livres = armarios.filter(
    (armario) => armario.status === "livre"
  );

  const ocupados = armarios.filter(
    (armario) => armario.status === "ocupado"
  );

  const manutencao = armarios.filter(
    (armario) => armario.status === "manutencao"
  );

  const armariosFiltrados = useMemo(() => {
    return armarios.filter((armario) => {
      const termo = busca.toLowerCase().trim();

      const correspondeBusca =
        !termo ||
        armario.numero.toLowerCase().includes(termo) ||
        armario.funcionario
          ?.toLowerCase()
          .includes(termo);

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
  }, [armarios, busca, vestiario, status]);

  function abrirModal(tipo, armario = null) {
    setArmarioSelecionado(armario);
    setModal(tipo);
  }

  function fecharModal() {
    setModal(null);
    setArmarioSelecionado(null);
  }

  function nomeStatus(statusArmario) {
    if (statusArmario === "livre") {
      return "Livre";
    }

    if (statusArmario === "ocupado") {
      return "Ocupado";
    }

    return "Em manutenção";
  }

  function nomeVestiario(valor) {
    return valor === "feminino"
      ? "Feminino"
      : "Masculino";
  }

  function desocuparArmario(armario) {
    const confirmar = window.confirm(
      `Deseja desocupar o armário ${armario.numero} e registrar a devolução da chave?`
    );

    if (!confirmar) {
      return;
    }

    setArmarios((anteriores) =>
      anteriores.map((item) =>
        item.id === armario.id
          ? {
              ...item,
              status: "livre",
              funcionario: null,
              setor: null,
              chaveStatus: "disponivel",
            }
          : item
      )
    );
  }

  function concluirManutencao(armario) {
    setArmarios((anteriores) =>
      anteriores.map((item) =>
        item.id === armario.id
          ? {
              ...item,
              status: "livre",
            }
          : item
      )
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


      {/* CARDS */}

      <div className="armarios-cards">

        <article className="armario-stat-card">
          <div className="armario-stat-icon total">
            🔒
          </div>

          <strong>{armarios.length}</strong>

          <span>Total</span>
        </article>


        <article className="armario-stat-card">
          <div className="armario-stat-icon livre">
            ✓
          </div>

          <strong>{livres.length}</strong>

          <span>Livres</span>
        </article>


        <article className="armario-stat-card">
          <div className="armario-stat-icon ocupado">
            ○
          </div>

          <strong>{ocupados.length}</strong>

          <span>Ocupados</span>
        </article>


        <article className="armario-stat-card">
          <div className="armario-stat-icon manutencao">
            🔧
          </div>

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
          onChange={(event) =>
            setBusca(event.target.value)
          }
        />


        <select
          value={vestiario}
          onChange={(event) =>
            setVestiario(event.target.value)
          }
        >
          <option value="todos">
            Todos os vestiários
          </option>

          <option value="feminino">
            Feminino
          </option>

          <option value="masculino">
            Masculino
          </option>
        </select>


        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
        >
          <option value="todos">
            Todos os status
          </option>

          <option value="livre">
            Livre
          </option>

          <option value="ocupado">
            Ocupado
          </option>

          <option value="manutencao">
            Em manutenção
          </option>
        </select>


        <button
          className="btn-cadastrar-armario"
          onClick={() =>
            abrirModal("cadastrar")
          }
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
                <td
                  colSpan="6"
                  className="nenhum-armario"
                >
                  Nenhum armário encontrado.
                </td>
              </tr>
            )}


            {armariosFiltrados.map((armario) => (

              <tr key={armario.id}>

                <td>
                  <span className="armario-codigo">
                    {armario.numero}
                  </span>
                </td>


                <td>
                  <span className="vestiario-badge">

                    {armario.vestiario ===
                    "feminino"
                      ? "♀"
                      : "♂"}

                    {" "}

                    {nomeVestiario(
                      armario.vestiario
                    )}

                  </span>
                </td>


                <td>
                  <span
                    className={`armario-status ${armario.status}`}
                  >
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

                      <span>
                        {armario.funcionario}
                      </span>

                    </div>

                  ) : (

                    <span className="sem-dado">
                      —
                    </span>

                  )}

                </td>


                <td>

                  {armario.setor ? (

                    <span className="setor-badge">
                      {armario.setor}
                    </span>

                  ) : (

                    <span className="sem-dado">
                      —
                    </span>

                  )}

                </td>


                <td>

                  <div className="armario-acoes">

                    <button
                      className="btn-acao"
                      onClick={() =>
                        abrirModal(
                          "ver",
                          armario
                        )
                      }
                    >
                      Ver
                    </button>


                    <button
                      className="btn-acao"
                      onClick={() =>
                        abrirModal(
                          "editar",
                          armario
                        )
                      }
                    >
                      Editar
                    </button>


                    {armario.status ===
                      "livre" && (

                      <button
                        className="btn-associar"
                        onClick={() =>
                          abrirModal(
                            "associar",
                            armario
                          )
                        }
                      >
                        Associar
                      </button>

                    )}


                    {armario.status ===
                      "ocupado" && (

                      <button
                        className="btn-acao"
                        onClick={() =>
                          desocuparArmario(
                            armario
                          )
                        }
                      >
                        Desocupar
                      </button>

                    )}


                    {armario.status ===
                      "manutencao" && (

                      <button
                        className="btn-acao"
                        onClick={() =>
                          concluirManutencao(
                            armario
                          )
                        }
                      >
                        Concluir
                      </button>

                    )}

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </section>


      {/* MODAL VER */}

      {modal === "ver" &&
        armarioSelecionado && (

        <div className="modal-overlay">

          <div className="armario-modal">

            <button
              className="modal-fechar"
              onClick={fecharModal}
            >
              ×
            </button>

            <h2>
              Armário {armarioSelecionado.numero}
            </h2>

            <div className="modal-dados">

              <p>
                <strong>Vestiário:</strong>{" "}
                {nomeVestiario(
                  armarioSelecionado.vestiario
                )}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {nomeStatus(
                  armarioSelecionado.status
                )}
              </p>

              <p>
                <strong>Funcionário:</strong>{" "}
                {armarioSelecionado.funcionario ||
                  "Nenhum"}
              </p>

              <p>
                <strong>Setor:</strong>{" "}
                {armarioSelecionado.setor ||
                  "—"}
              </p>

              <p>
                <strong>Chave:</strong>{" "}
                {armarioSelecionado.chave}
              </p>

            </div>

          </div>

        </div>

      )}


      {/* MODAL CADASTRO */}

      {modal === "cadastrar" && (

        <div className="modal-overlay">

          <div className="armario-modal">

            <button
              className="modal-fechar"
              onClick={fecharModal}
            >
              ×
            </button>

            <h2>Cadastrar armário</h2>

            <p className="modal-subtitulo">
              Adicione um novo armário ao sistema.
            </p>

            <label>
              Número
            </label>

            <input
              type="text"
              placeholder="Ex: F07"
            />


            <label>
              Vestiário
            </label>

            <select>
              <option>Feminino</option>
              <option>Masculino</option>
            </select>


            <div className="modal-botoes">

              <button
                className="btn-modal-cancelar"
                onClick={fecharModal}
              >
                Cancelar
              </button>

              <button
                className="btn-modal-salvar"
                onClick={fecharModal}
              >
                Cadastrar armário
              </button>

            </div>

          </div>

        </div>

      )}


      {/* MODAL EDITAR */}

      {modal === "editar" &&
        armarioSelecionado && (

        <div className="modal-overlay">

          <div className="armario-modal">

            <button
              className="modal-fechar"
              onClick={fecharModal}
            >
              ×
            </button>

            <h2>
              Editar armário
            </h2>

            <label>Número</label>

            <input
              type="text"
              defaultValue={
                armarioSelecionado.numero
              }
            />


            <label>Status</label>

            <select
              defaultValue={
                armarioSelecionado.status
              }
            >

              <option value="livre">
                Livre
              </option>

              <option value="ocupado">
                Ocupado
              </option>

              <option value="manutencao">
                Em manutenção
              </option>

            </select>


            <div className="modal-botoes">

              <button
                className="btn-modal-cancelar"
                onClick={fecharModal}
              >
                Cancelar
              </button>

              <button
                className="btn-modal-salvar"
                onClick={fecharModal}
              >
                Salvar alterações
              </button>

            </div>

          </div>

        </div>

      )}


      {/* MODAL ASSOCIAR */}

      {modal === "associar" &&
        armarioSelecionado && (

        <div className="modal-overlay">

          <div className="armario-modal">

            <button
              className="modal-fechar"
              onClick={fecharModal}
            >
              ×
            </button>

            <h2>
              Associar funcionário
            </h2>

            <p className="modal-subtitulo">
              Armário{" "}
              {armarioSelecionado.numero}
            </p>


            <label>
              Funcionário
            </label>

            <select>
              <option>
                Selecione um funcionário
              </option>

              <option>
                Joana Ferreira
              </option>

              <option>
                Marcos Alves
              </option>
            </select>


            <div className="modal-botoes">

              <button
                className="btn-modal-cancelar"
                onClick={fecharModal}
              >
                Cancelar
              </button>

              <button
                className="btn-modal-salvar"
                onClick={fecharModal}
              >
                Associar
              </button>

            </div>

          </div>

        </div>

      )}

    </section>
  );
}

export default Armarios;