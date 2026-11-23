
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  PackageSearch,
  CheckCircle2,
  CalendarDays,
  MapPin,
  X,
  Info,
} from "lucide-react";

import "./AchadosPerdidos.css";

function AchadosPerdidosFuncionario() {
  const [achados, setAchados] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [objetoSelecionado, setObjetoSelecionado] = useState(null);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  // consulta os objetos encontrados no backend
  useEffect(() => {
    async function carregarAchados() {
      try {
        const token = sessionStorage.getItem("token");

        if (!token) {
          throw new Error("Sessão não encontrada. Faça login novamente.");
        }

        const resposta = await fetch(
          "http://localhost:5000/api/funcionario/achados-perdidos",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
          throw new Error(
            dados.mensagem || "Erro ao consultar objetos encontrados."
          );
        }

        setAchados(Array.isArray(dados.achados) ? dados.achados : []);
      } catch (error) {
        setErro(error.message);
      } finally {
        setLoading(false);
      }
    }

    carregarAchados();
  }, []);

  const total = achados.length;

  const encontrados = achados.filter(
    (objeto) => objeto.status === "encontrado"
  ).length;

  const objetosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return achados.filter((objeto) => {
      const correspondeBusca =
        (objeto.objeto || "").toLowerCase().includes(termo) ||
        (objeto.descricao || "").toLowerCase().includes(termo) ||
        (objeto.local || "").toLowerCase().includes(termo) ||
        (objeto.codigo || "").toLowerCase().includes(termo);

      const correspondeStatus =
        filtroStatus === "todos" ||
        objeto.status === filtroStatus;

      return correspondeBusca && correspondeStatus;
    });
  }, [achados, busca, filtroStatus]);

  function formatarData(data) {
    if (!data) return "Não informada";

    const dataFormatada = String(data).split("T")[0];

    return new Date(
      `${dataFormatada}T12:00:00`
    ).toLocaleDateString("pt-BR");
  }

  if (loading) {
    return (
      <section className="func-achados-page">
        <p>Carregando objetos encontrados...</p>
      </section>
    );
  }

  return (
    <section className="func-achados-page">
      {/* CABEÇALHO */}

      <header className="func-achados-header">
        <span>ÁREA DO FUNCIONÁRIO</span>

        <h1>Achados e Perdidos</h1>

        <p>
          Consulte objetos encontrados nos vestiários e
          confira as informações para identificá-los.
        </p>
      </header>

      {/* MENSAGEM DE ERRO */}

      {erro && (
        <div className="func-achados-aviso">
          <Info size={19} />
          <p>{erro}</p>
        </div>
      )}

      {/* CARDS DE RESUMO */}

      <div className="func-achados-cards">
        <article className="func-achados-card">
          <div className="func-achados-card-icone total">
            <PackageSearch size={21} />
          </div>

          <strong>{total}</strong>
          <span>Total de objetos disponíveis</span>
        </article>

        <article className="func-achados-card">
          <div className="func-achados-card-icone encontrados">
            <Search size={21} />
          </div>

          <strong>{encontrados}</strong>
          <span>Encontrados</span>
        </article>

        <article className="func-achados-card">
          <div className="func-achados-card-icone entregues">
            <CheckCircle2 size={21} />
          </div>

          <strong>—</strong>
          <span>Entregues não exibidos</span>
        </article>
      </div>

      {/* PESQUISA E FILTRO */}

      <section className="func-achados-filtros">
        <div className="func-achados-busca">
          <Search size={18} />

          <input
            type="search"
            aria-label="Pesquisar objeto"
            placeholder="Pesquisar objeto, descrição ou local"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />
        </div>

        <select
          aria-label="Filtrar objetos por status"
          value={filtroStatus}
          onChange={(event) => setFiltroStatus(event.target.value)}
        >
          <option value="todos">Todos os objetos</option>
          <option value="encontrado">Encontrados</option>
        </select>
      </section>

      {/* INFORMAÇÃO */}

      <div className="func-achados-aviso">
        <Info size={19} />

        <p>
          Reconheceu algum objeto como seu? Procure o
          administrador ou responsável para confirmar
          a identificação e combinar a retirada.
        </p>
      </div>

      {/* LISTA DE OBJETOS */}

      <section className="func-achados-lista">
        <div className="func-achados-lista-header">
          <div>
            <h2>Objetos registrados</h2>

            <p>
              {objetosFiltrados.length}{" "}
              {objetosFiltrados.length === 1
                ? "objeto encontrado"
                : "objetos encontrados"}
            </p>
          </div>
        </div>

        {objetosFiltrados.length === 0 ? (
          <div className="func-achados-vazio">
            <PackageSearch size={36} />

            <h3>Nenhum objeto encontrado</h3>

            <p>
              {erro
                ? "Não foi possível carregar os objetos."
                : "Tente pesquisar por outro nome ou alterar o filtro."}
            </p>

            <button
              type="button"
              onClick={() => {
                setBusca("");
                setFiltroStatus("todos");
              }}
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="func-achados-tabela-container">
            <table className="func-achados-tabela">
              <thead>
                <tr>
                  <th>Objeto</th>
                  <th>Descrição</th>
                  <th>Local encontrado</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Detalhes</th>
                </tr>
              </thead>

              <tbody>
                {objetosFiltrados.map((objeto) => (
                  <tr key={objeto._id}>
                    <td>
                      <div className="func-achados-objeto">
                        <div className="func-achados-objeto-icone">
                          📦
                        </div>

                        <div>
                          <strong>{objeto.objeto}</strong>
                          <span>{objeto.codigo}</span>
                        </div>
                      </div>
                    </td>

                    <td>{objeto.descricao}</td>

                    <td>
                      <span className="func-achados-local">
                        {objeto.local}
                      </span>
                    </td>

                    <td>
                      <span className="func-achados-data">
                        {formatarData(objeto.data)}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`func-achados-status ${objeto.status}`}
                      >
                        <span className="func-achados-status-ponto" />

                        {objeto.status === "encontrado"
                          ? "Encontrado"
                          : "Entregue"}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="func-achados-btn-detalhes"
                        onClick={() => setObjetoSelecionado(objeto)}
                      >
                        Ver detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* MODAL DE DETALHES */}

      {objetoSelecionado && (
        <div
          className="func-achados-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setObjetoSelecionado(null);
            }
          }}
        >
          <section
            className="func-achados-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="func-achados-modal-titulo"
          >
            <button
              type="button"
              className="func-achados-modal-fechar"
              aria-label="Fechar detalhes"
              onClick={() => setObjetoSelecionado(null)}
            >
              <X size={21} />
            </button>

            <div className="func-achados-modal-icone">
              📦
            </div>

            <h2 id="func-achados-modal-titulo">
              {objetoSelecionado.objeto}
            </h2>

            <p className="func-achados-modal-codigo">
              Código: {objetoSelecionado.codigo}
            </p>

            <div className="func-achados-modal-dados">
              <div>
                <span>DESCRIÇÃO</span>
                <p>{objetoSelecionado.descricao}</p>
              </div>

              <div>
                <span>LOCAL ENCONTRADO</span>

                <p className="func-achados-modal-local">
                  <MapPin size={16} />
                  {objetoSelecionado.local}
                </p>
              </div>

              <div>
                <span>DATA DO REGISTRO</span>

                <p className="func-achados-modal-data">
                  <CalendarDays size={16} />
                  {formatarData(objetoSelecionado.data)}
                </p>
              </div>

              <div>
                <span>STATUS</span>

                <p>
                  <span
                    className={`func-achados-status ${objetoSelecionado.status}`}
                  >
                    <span className="func-achados-status-ponto" />

                    {objetoSelecionado.status === "encontrado"
                      ? "Encontrado"
                      : "Entregue"}
                  </span>
                </p>
              </div>
            </div>

            {objetoSelecionado.status === "encontrado" && (
              <div className="func-achados-modal-aviso">
                Procure o responsável pelo sistema para
                confirmar a propriedade e retirar o objeto.
              </div>
            )}

            <button
              type="button"
              className="func-achados-modal-botao"
              onClick={() => setObjetoSelecionado(null)}
            >
              Fechar
            </button>
          </section>
        </div>
      )}
    </section>
  );
}

export default AchadosPerdidosFuncionario;
