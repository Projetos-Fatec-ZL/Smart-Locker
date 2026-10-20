
import { Link } from "react-router-dom";
import {
  LockKeyhole,
  KeyRound,
  MapPin,
  Clock3,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { armariosMock } from "../../../data/mockData";
import "./MeuArmario.css";

function MeuArmario() {
  // Dados temporários do funcionário logado.
  // Depois serão obtidos pela API do backend.
  const nomeFuncionario = "Ana Souza";

  const armario = armariosMock.find(
    (item) => item.funcionario === nomeFuncionario
  );

  const temArmario = Boolean(armario);

  function formatarVestiario(vestiario) {
    if (!vestiario) return "Não informado";

    return vestiario.charAt(0).toUpperCase() +
      vestiario.slice(1);
  }

  function obterStatusArmario(status) {
    const statusMap = {
      livre: "Livre",
      ocupado: "Ocupado",
      manutencao: "Em manutenção",
    };

    return statusMap[status] || status || "Não informado";
  }

  function obterStatusChave(status) {
    const statusMap = {
      disponivel: "Disponível",
      entregue: "Entregue",
      aguardando_retirada: "Aguardando retirada",
    };

    return statusMap[status] || status || "Não informado";
  }


  return (
    <section className="meu-armario-page">

      {/* CABEÇALHO */}

      <header className="meu-armario-header">
        <span>ÁREA DO FUNCIONÁRIO</span>

        <h1>Meu Armário</h1>

        <p>
          Confira as informações do seu armário e o status da sua chave.
        </p>
      </header>


      {temArmario ? (
        <>
          {/* CARD PRINCIPAL */}

          <section className="meu-armario-card">

            <div className="meu-armario-card-header">
              <div className="meu-armario-icone">
                <LockKeyhole size={25} />
              </div>

              <div className="meu-armario-identificacao">
                <span>SEU ARMÁRIO</span>

                <h2>
                  Armário {armario.numero}
                </h2>

                <p>
                  {formatarVestiario(armario.vestiario)}
                </p>
              </div>

              <span
                className={`meu-armario-status ${
                  armario.status === "ocupado"
                    ? "status-ocupado"
                    : armario.status === "manutencao"
                    ? "status-manutencao"
                    : "status-livre"
                }`}
              >
                <span className="meu-armario-ponto" />
                {obterStatusArmario(armario.status)}
              </span>
            </div>


            {/* INFORMAÇÕES */}

            <div className="meu-armario-detalhes">

              <article className="meu-armario-detalhe">
                <div className="meu-armario-detalhe-icone">
                  <LockKeyhole size={18} />
                </div>

                <div>
                  <span>NÚMERO DO ARMÁRIO</span>
                  <strong className="valor-azul">
                    {armario.numero}
                  </strong>
                </div>
              </article>


              <article className="meu-armario-detalhe">
                <div className="meu-armario-detalhe-icone">
                  <MapPin size={18} />
                </div>

                <div>
                  <span>VESTIÁRIO</span>
                  <strong>
                    {formatarVestiario(armario.vestiario)}
                  </strong>
                </div>
              </article>


              <article className="meu-armario-detalhe">
                <div className="meu-armario-detalhe-icone">
                  <KeyRound size={18} />
                </div>

                <div>
                  <span>CÓDIGO DA CHAVE</span>
                  <strong className="valor-azul">
                    {armario.chave || `CH-${armario.numero}`}
                  </strong>
                </div>
              </article>


              <article className="meu-armario-detalhe">
                <div className="meu-armario-detalhe-icone">
                  <CheckCircle2 size={18} />
                </div>

                <div>
                  <span>STATUS DA CHAVE</span>

                  <strong>
                    {obterStatusChave(armario.chaveStatus)}
                  </strong>
                </div>
              </article>

            </div>
          </section>


          {/* SITUAÇÃO DA CHAVE */}

          <section className="meu-armario-info">

            <div className="meu-armario-info-icone">
              {armario.chaveStatus === "entregue" ? (
                <CheckCircle2 size={22} />
              ) : armario.chaveStatus === "aguardando_retirada" ? (
                <Clock3 size={22} />
              ) : (
                <KeyRound size={22} />
              )}
            </div>

            <div className="meu-armario-info-texto">
              <h3>
                {armario.chaveStatus === "entregue"
                  ? "Sua chave já foi entregue"
                  : armario.chaveStatus === "aguardando_retirada"
                  ? "Sua chave está aguardando retirada"
                  : "A chave está disponível"}
              </h3>

              <p>
                {armario.chaveStatus === "entregue"
                  ? "Guarde sua chave com segurança e devolva-a ao responsável quando seu armário for liberado."
                  : armario.chaveStatus === "aguardando_retirada"
                  ? "Procure o responsável pelo controle dos armários para retirar sua chave."
                  : "Entre em contato com o responsável para confirmar a situação da chave."}
              </p>
            </div>

          </section>


          {/* ATALHOS */}

          <div className="meu-armario-acoes">

            <Link
              to="/funcionario/inicio"
              className="meu-armario-botao secundario"
            >
              <ArrowLeft size={17} />
              Voltar ao início
            </Link>

            <Link
              to="/funcionario/achados-perdidos"
              className="meu-armario-botao primario"
            >
              Achados e Perdidos
              <ArrowRight size={17} />
            </Link>

          </div>
        </>
      ) : (
        /* FUNCIONÁRIO SEM ARMÁRIO */

        <section className="meu-armario-vazio">

          <div className="meu-armario-vazio-icone">
            <LockKeyhole size={34} />
          </div>

          <h2>Você ainda não possui um armário</h2>

          <p>
            Quando um armário for associado ao seu cadastro,
            as informações aparecerão nesta página.
          </p>

          <Link
            to="/funcionario/lista-espera"
            className="meu-armario-botao primario"
          >
            Consultar lista de espera
            <ArrowRight size={17} />
          </Link>

        </section>
      )}

    </section>
  );
}

export default MeuArmario;
