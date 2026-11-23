
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LockKeyhole,
  PackageSearch,
  ArrowRight,
} from "lucide-react";

import "./Inicio.css";

function Inicio() {
  const [funcionario, setFuncionario] = useState(null);
  const [armario, setArmario] = useState(null);
  const [chave, setChave] = useState(null);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  // consulta os dados do funcionario logado
  useEffect(() => {
    async function carregarPerfil() {
      try {
        const token = sessionStorage.getItem("token");

        if (!token) {
          throw new Error("Sessão não encontrada. Faça login novamente.");
        }

        const resposta = await fetch(
          "http://localhost:5000/api/funcionario/meu-perfil",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
          throw new Error(
            dados.mensagem || "Erro ao carregar os dados do funcionário."
          );
        }

        setFuncionario(dados.funcionario);
        setArmario(dados.funcionario.armario || null);
        setChave(dados.chave || null);
      } catch (error) {
        setErro(error.message);
      } finally {
        setLoading(false);
      }
    }

    carregarPerfil();
  }, []);

  const nomeFuncionario = funcionario?.nome || "Funcionário";
  const setorFuncionario = funcionario?.setor || "Setor não informado";

  const temArmario = Boolean(armario);

  function formatarVestiario(tipo) {
    if (!tipo) return "Não informado";

    const tipos = {
      feminino: "Feminino",
      masculino: "Masculino",
    };

    return tipos[tipo] || tipo;
  }

  function formatarStatus(status) {
    const statusFormatados = {
      livre: "Livre",
      ocupado: "Ocupado",
      manutencao: "Em manutenção",
      disponivel: "Disponível",
      entregue: "Entregue",
      extraviada: "Extraviada",
      devolvida: "Devolvida",
    };

    return statusFormatados[status] || status || "Não informado";
  }

  function classeStatusChave(status) {
    if (status === "entregue") return "entregue";
    if (status === "extraviada") return "extraviada";
    if (status === "devolvida") return "devolvida";

    return "disponivel";
  }

  if (loading) {
    return (
      <section className="inicio-funcionario">
        <p>Carregando suas informações...</p>
      </section>
    );
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

      {erro && (
        <div className="inicio-erro">
          {erro}
        </div>
      )}

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
                ? `Armário ${armario.codigo}`
                : "Você ainda não possui um armário"}
            </h3>

            <p>
              {temArmario
                ? `Vestiário ${formatarVestiario(armario.tipo)}`
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
                {armario.codigo}
              </strong>
            </div>

            <div className="inicio-detalhe">
              <span>VESTIÁRIO</span>

              <strong>
                {formatarVestiario(armario.tipo)}
              </strong>
            </div>

            <div className="inicio-detalhe">
              <span>CHAVE</span>

              <strong className="inicio-valor-azul">
                {chave?.codigo || "Não vinculada"}
              </strong>
            </div>

            <div className="inicio-detalhe">
              <span>STATUS DA CHAVE</span>

              <div>
                <span
                  className={`inicio-status-chave ${classeStatusChave(chave?.status)}`}
                >
                  <span className="inicio-status-ponto" />

                  {formatarStatus(chave?.status)}
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
