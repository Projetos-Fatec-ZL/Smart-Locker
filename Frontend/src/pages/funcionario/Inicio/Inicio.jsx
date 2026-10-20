
import { Link } from "react-router-dom";
import { LockKeyhole, PackageSearch, ArrowRight } from "lucide-react";
import { armariosMock } from "../../../data/mockData";
import "./Inicio.css";

function Inicio() {
  // Dados temporários do funcionário logado.
  // Depois vamos obter essas informações pelo backend.
  const nomeFuncionario = "Ana Souza";
  const setorFuncionario = "Padaria";

  const armario = armariosMock.find(
    (item) => item.funcionario === nomeFuncionario
  );

  const temArmario = Boolean(armario);

  function formatarVestiario(vestiario) {
    if (!vestiario) return "Não informado";

    return vestiario.charAt(0).toUpperCase() +
      vestiario.slice(1);
  }

  function formatarStatus(status) {
    const statusFormatados = {
      livre: "Livre",
      ocupado: "Ocupado",
      manutencao: "Em manutenção",
      disponivel: "Disponível",
      entregue: "Entregue",
      aguardando_retirada: "Aguardando retirada",
      devolvida: "Devolvida",
    };

    return statusFormatados[status] || status || "Não informado";
  }

  function classeStatusChave(status) {
    if (status === "entregue") return "entregue";
    if (status === "aguardando_retirada") return "aguardando";
    return "disponivel";
  }

  return (
    <section className="inicio-funcionario">

      {/* CABEÇALHO */}

      <header className="inicio-cabecalho">
        <span className="inicio-etiqueta">
          INÍCIO
        </span>

        <h1>
          Olá, {nomeFuncionario}! 👋
        </h1>

        <p>{setorFuncionario}</p>
      </header>


      {/* SITUAÇÃO ATUAL */}

      <h2 className="inicio-secao-titulo">
        SITUAÇÃO ATUAL
      </h2>

      <section className="inicio-card-principal">

        <div className="inicio-card-topo">

          <div className="inicio-icone-armario">
            <LockKeyhole size={23} />
          </div>

          <div className="inicio-identificacao">
            <h3>
              {temArmario
                ? `Armário ${armario.numero}`
                : "Você ainda não possui um armário"}
            </h3>

            <p>
              {temArmario
                ? `Vestiário ${formatarVestiario(armario.vestiario)}`
                : "Consulte a lista de espera para acompanhar sua solicitação."}
            </p>
          </div>

          {temArmario && (
            <span className="inicio-status ocupado">
              {formatarStatus(armario.status)}
            </span>
          )}

        </div>


        {temArmario ? (

          <div className="inicio-detalhes">

            <div className="inicio-detalhe">
              <span>ARMÁRIO</span>

              <strong className="inicio-valor-azul">
                {armario.numero}
              </strong>
            </div>


            <div className="inicio-detalhe">
              <span>VESTIÁRIO</span>

              <strong>
                {formatarVestiario(armario.vestiario)}
              </strong>
            </div>


            <div className="inicio-detalhe">
              <span>CHAVE</span>

              <strong className="inicio-valor-azul">
                {armario.chave || `CH-${armario.numero}`}
              </strong>
            </div>


            <div className="inicio-detalhe">
              <span>STATUS DA CHAVE</span>

              <div>
                <span
                  className={`inicio-status-chave ${classeStatusChave(armario.chaveStatus)}`}
                >
                  <span className="inicio-status-ponto" />

                  {formatarStatus(armario.chaveStatus)}
                </span>
              </div>
            </div>

          </div>

        ) : (

          <div className="inicio-sem-armario">
            <p>
              Você poderá consultar sua posição e acompanhar
              a disponibilidade de armários.
            </p>

            <Link
              to="/funcionario/lista-espera"
              className="inicio-botao"
            >
              Consultar lista de espera
              <ArrowRight size={16} />
            </Link>
          </div>

        )}

      </section>


      {/* ATALHOS */}

      <div className="inicio-atalhos">

        <Link
          to="/funcionario/meu-armario"
          className="inicio-atalho"
        >
          <div className="inicio-atalho-icone armario">
            <LockKeyhole size={21} />
          </div>

          <div className="inicio-atalho-texto">
            <strong>Meu Armário</strong>

            <p>
              Consultar os detalhes do seu armário
            </p>
          </div>

          <ArrowRight
            className="inicio-atalho-seta"
            size={18}
          />
        </Link>


        <Link
          to="/funcionario/achados-perdidos"
          className="inicio-atalho"
        >
          <div className="inicio-atalho-icone objetos">
            <PackageSearch size={21} />
          </div>

          <div className="inicio-atalho-texto">
            <strong>Achados e Perdidos</strong>

            <p>
              Consultar objetos encontrados no vestiário
            </p>
          </div>

          <ArrowRight
            className="inicio-atalho-seta"
            size={18}
          />
        </Link>

      </div>

    </section>
  );
}

export default Inicio;
