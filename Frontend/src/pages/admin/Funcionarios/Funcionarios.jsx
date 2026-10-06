import { useMemo, useState } from "react";
import { funcionariosMock } from "./funcionariosMock";
import { listaEsperaMock } from "../../../data/mockData";

import "./Funcionarios.css";

function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState(funcionariosMock);

  const [busca, setBusca] = useState("");
  const [setorFiltro, setSetorFiltro] = useState("todos");

  const [modal, setModal] = useState(null);

  const [
    funcionarioSelecionado,
    setFuncionarioSelecionado,
  ] = useState(null);

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

      const nome = funcionario.nome.toLowerCase();

      const cpf = (funcionario.cpf || "").toLowerCase();

      const correspondeBusca =
        !termo ||
        nome.includes(termo) ||
        cpf.includes(termo);

      const correspondeSetor =
        setorFiltro === "todos" ||
        funcionario.setor === setorFiltro;

      return correspondeBusca && correspondeSetor;
    });
  }, [funcionarios, busca, setorFiltro]);

  const total = funcionarios.length;

  const comArmario = funcionarios.filter(
    (funcionario) => funcionario.armario
  ).length;

  const semArmario = total - comArmario;

  const naFila = listaEsperaMock.length;

  function abrirModal(tipo, funcionario = null) {
    setFuncionarioSelecionado(funcionario);

    setModal(tipo);
  }

  function fecharModal() {
    setModal(null);

    setFuncionarioSelecionado(null);
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

  function estaNaFila(funcionario) {
    return listaEsperaMock.some(
      (item) => item.nome === funcionario.nome
    );
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

    return (
      <span className="sem-dado">
        —
      </span>
    );
  }

  function cadastrarFuncionario(event) {
    event.preventDefault();

    const form = event.target;

    const nome = form.nome.value.trim();
    const cpf = form.cpf.value.trim();
    const setor = form.setor.value;

    if (!nome || !cpf || !setor) {
      alert("Preencha todos os campos.");

      return;
    }

    const novoFuncionario = {
      id: Date.now(),
      nome,
      cpf,
      setor,
      status: "ativo",
      armario: null,
    };

    setFuncionarios((anteriores) => [
      ...anteriores,
      novoFuncionario,
    ]);

    fecharModal();
  }

  function editarFuncionario(event) {
    event.preventDefault();

    const form = event.target;

    const nome = form.nome.value.trim();
    const setor = form.setor.value;
    const status = form.status.value;

    setFuncionarios((anteriores) =>
      anteriores.map((funcionario) =>
        funcionario.id ===
        funcionarioSelecionado.id
          ? {
              ...funcionario,
              nome,
              setor,
              status,
            }
          : funcionario
      )
    );

    fecharModal();
  }

  return (
    <section className="funcionarios-page">

      {/* CABEÇALHO */}

      <header className="funcionarios-header">
        <span>
          FUNCIONÁRIOS
        </span>

        <h1>
          Funcionários
        </h1>

        <p>
          Cadastro e gerenciamento de funcionários
        </p>
      </header>


      {/* CARDS */}

      <div className="funcionarios-cards">

        <article className="funcionario-stat-card">

          <div className="funcionario-stat-icon total">
            👥
          </div>

          <strong>
            {total}
          </strong>

          <span>
            Total
          </span>

        </article>


        <article className="funcionario-stat-card">

          <div className="funcionario-stat-icon com-armario">
            🔑
          </div>

          <strong>
            {comArmario}
          </strong>

          <span>
            Com armário
          </span>

        </article>


        <article className="funcionario-stat-card">

          <div className="funcionario-stat-icon sem-armario">
            🔒
          </div>

          <strong>
            {semArmario}
          </strong>

          <span>
            Sem armário
          </span>

        </article>


        <article className="funcionario-stat-card">

          <div className="funcionario-stat-icon fila">
            ⏳
          </div>

          <strong>
            {naFila}
          </strong>

          <span>
            Lista de espera
          </span>

        </article>

      </div>


      {/* FILTROS */}

      <section className="funcionarios-filtros">

        <input
          type="text"
          placeholder="Pesquisar nome ou CPF"
          value={busca}
          onChange={(event) =>
            setBusca(event.target.value)
          }
        />


        <select
          value={setorFiltro}
          onChange={(event) =>
            setSetorFiltro(
              event.target.value
            )
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
          className="btn-cadastrar-funcionario"
          onClick={() =>
            abrirModal("cadastrar")
          }
        >
          + Cadastrar funcionário
        </button>

      </section>


      {/* TABELA */}

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

            {funcionariosFiltrados.length ===
              0 && (

              <tr>
                <td
                  colSpan="6"
                  className="nenhum-funcionario"
                >
                  Nenhum funcionário encontrado.
                </td>
              </tr>

            )}


            {funcionariosFiltrados.map(
              (funcionario) => (

                <tr key={funcionario.id}>

                  <td>

                    <div className="funcionario-info">

                      <div className="funcionario-avatar">
                        {funcionario.nome
                          .split(" ")
                          .map(
                            (nome) => nome[0]
                          )
                          .slice(0, 2)
                          .join("")}
                      </div>


                      <div>

                        <strong>
                          {funcionario.nome}
                        </strong>


                        {funcionario.status ===
                          "inativo" && (

                          <span className="funcionario-inativo">
                            Inativo
                          </span>

                        )}

                      </div>

                    </div>

                  </td>


                  <td>
                    {mascararCpf(
                      funcionario.cpf
                    )}
                  </td>


                  <td>

                    {funcionario.setor ? (

                      <span className="setor-badge">
                        {funcionario.setor}
                      </span>

                    ) : (

                      <span className="sem-dado">
                        —
                      </span>

                    )}

                  </td>


                  <td>

                    {funcionario.armario ? (

                      <span className="armario-chip">
                        {funcionario.armario}
                      </span>

                    ) : (

                      <span className="sem-dado">
                        —
                      </span>

                    )}

                  </td>


                  <td>
                    {situacaoFuncionario(
                      funcionario
                    )}
                  </td>


                  <td>

                    <div className="funcionario-acoes">

                      <button
                        className="btn-acao"
                        onClick={() =>
                          abrirModal(
                            "ver",
                            funcionario
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
                            funcionario
                          )
                        }
                      >
                        Editar
                      </button>

                    </div>

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </section>


      {/* MODAL VER */}

      {modal === "ver" &&
        funcionarioSelecionado && (

        <div className="modal-overlay">

          <div className="funcionario-modal">

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
              Informações do funcionário
            </p>


            <div className="modal-dados">

              <p>
                <strong>
                  CPF:
                </strong>{" "}
                {mascararCpf(
                  funcionarioSelecionado.cpf
                )}
              </p>


              <p>
                <strong>
                  Setor:
                </strong>{" "}
                {funcionarioSelecionado.setor ||
                  "—"}
              </p>


              <p>
                <strong>
                  Status:
                </strong>{" "}
                {funcionarioSelecionado.status}
              </p>


              <p>
                <strong>
                  Armário:
                </strong>{" "}
                {funcionarioSelecionado.armario ||
                  "Nenhum"}
              </p>


              <p>
                <strong>
                  Situação:
                </strong>{" "}

                {funcionarioSelecionado.armario
                  ? "Com armário"
                  : estaNaFila(
                      funcionarioSelecionado
                    )
                  ? "Na lista de espera"
                  : "Sem armário"}
              </p>

            </div>

          </div>

        </div>
      )}


      {/* MODAL CADASTRAR */}

      {modal === "cadastrar" && (

        <div className="modal-overlay">

          <div className="funcionario-modal">

            <button
              className="modal-fechar"
              onClick={fecharModal}
            >
              ×
            </button>


            <h2>
              Cadastrar funcionário
            </h2>


            <p className="modal-subtitulo">
              O funcionário criará a senha
              no primeiro acesso.
            </p>


            <form
              onSubmit={
                cadastrarFuncionario
              }
            >

              <label>
                Nome
              </label>

              <input
                name="nome"
                type="text"
                placeholder="Nome completo"
              />


              <label>
                CPF
              </label>

              <input
                name="cpf"
                type="text"
                placeholder="000.000.000-00"
              />


              <label>
                Setor
              </label>

              <select
                name="setor"
                defaultValue=""
              >

                <option
                  value=""
                  disabled
                >
                  Selecione um setor
                </option>

                <option>
                  Padaria
                </option>

                <option>
                  Frente de Caixa
                </option>

                <option>
                  Hortifruti
                </option>

                <option>
                  Açougue
                </option>

                <option>
                  Reposição
                </option>

              </select>


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
                  Cadastrar funcionário
                </button>

              </div>

            </form>

          </div>

        </div>
      )}


      {/* MODAL EDITAR */}

      {modal === "editar" &&
        funcionarioSelecionado && (

        <div className="modal-overlay">

          <div className="funcionario-modal">

            <button
              className="modal-fechar"
              onClick={fecharModal}
            >
              ×
            </button>


            <h2>
              Editar funcionário
            </h2>


            <form
              onSubmit={
                editarFuncionario
              }
            >

              <label>
                Nome
              </label>

              <input
                name="nome"
                type="text"
                defaultValue={
                  funcionarioSelecionado.nome
                }
              />


              <label>
                Setor
              </label>

              <select
                name="setor"
                defaultValue={
                  funcionarioSelecionado.setor
                }
              >

                <option>
                  Padaria
                </option>

                <option>
                  Frente de Caixa
                </option>

                <option>
                  Hortifruti
                </option>

                <option>
                  Açougue
                </option>

                <option>
                  Reposição
                </option>

              </select>


              <label>
                Status
              </label>

              <select
                name="status"
                defaultValue={
                  funcionarioSelecionado.status
                }
              >

                <option value="ativo">
                  Ativo
                </option>

                <option value="inativo">
                  Inativo
                </option>

              </select>


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

export default Funcionarios;