
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Hourglass,
  CheckCircle2,
  LockKeyhole,
  CalendarDays,
  ListOrdered,
  ArrowRight,
  Clock3,
  XCircle,
} from "lucide-react";

import "./ListaEspera.css";

function ListaEsperaFuncionario() {
  const [funcionario, setFuncionario] = useState(null);
  const [armarioAtual, setArmarioAtual] = useState(null);
  const [solicitacao, setSolicitacao] = useState(null);

  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const estaNaFila = Boolean(solicitacao);
  const temArmario = Boolean(armarioAtual);

  // consulta os dados reais do funcionario
  const carregarDados = useCallback(async () => {
    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        throw new Error("Sessão não encontrada. Faça login novamente.");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [respostaPerfil, respostaLista] = await Promise.all([
        fetch("http://localhost:5000/api/funcionario/meu-perfil", {
          headers,
        }),
        fetch("http://localhost:5000/api/funcionario/minha-lista-espera", {
          headers,
        }),
      ]);

      const dadosPerfil = await respostaPerfil.json();
      const dadosLista = await respostaLista.json();

      if (!respostaPerfil.ok) {
        throw new Error(
          dadosPerfil.mensagem || "Erro ao consultar perfil."
        );
      }

      if (!respostaLista.ok) {
        throw new Error(
          dadosLista.mensagem || "Erro ao consultar lista de espera."
        );
      }

      setFuncionario(dadosPerfil.funcionario);
      setArmarioAtual(dadosPerfil.funcionario.armario || null);

      const registros = Array.isArray(dadosLista) ? dadosLista : [];

      const solicitacaoPendente = registros.find(
        (registro) => registro.status === "aguardando"
      );

      setSolicitacao(solicitacaoPendente || null);
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarDados();
  }, [carregarDados]);

  // funcionario solicita entrada na fila
  async function solicitarEntrada() {
    try {
      setProcessando(true);
      setErro("");
      setMensagem("");

      const token = sessionStorage.getItem("token");

      const resposta = await fetch(
        "http://localhost:5000/api/funcionario/minha-lista-espera",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.mensagem || "Erro ao solicitar entrada na fila."
        );
      }

      setMensagem(dados.mensagem);
      await carregarDados();
    } catch (error) {
      setErro(error.message);
    } finally {
      setProcessando(false);
    }
  }

  // funcionario cancela sua propria solicitacao
  async function cancelarSolicitacao() {
    if (!solicitacao?._id) return;

    const confirmar = window.confirm(
      "Deseja realmente cancelar sua solicitação na lista de espera?"
    );

    if (!confirmar) return;

    try {
      setProcessando(true);
      setErro("");
      setMensagem("");

      const token = sessionStorage.getItem("token");

      const resposta = await fetch(
        `http://localhost:5000/api/funcionario/minha-lista-espera/${solicitacao._id}/cancelar`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.mensagem || "Erro ao cancelar solicitação."
        );
      }

      setMensagem(dados.mensagem);
      await carregarDados();
    } catch (error) {
      setErro(error.message);
    } finally {
      setProcessando(false);
    }
  }

  function formatarData(data) {
    if (!data) return "Não informada";

    return new Date(data).toLocaleDateString("pt-BR");
  }

  if (loading) {
    return (
      <section className="fila-funcionario-page">
        <p>Carregando sua lista de espera...</p>
      </section>
    );
  }

  return (
    <section className="fila-funcionario-page">
      {/* CABEÇALHO */}
      <header className="fila-funcionario-header">
        <span>ÁREA DO FUNCIONÁRIO</span>
        <h1>Lista de Espera</h1>
        <p>
          Acompanhe sua solicitação para conseguir um armário.
        </p>
      </header>

      {erro && (
        <div className="fila-funcionario-aviso">
          <XCircle size={19} />
          <p>{erro}</p>
        </div>
      )}

      {mensagem && (
        <div className="fila-funcionario-aviso">
          <CheckCircle2 size={19} />
          <p>{mensagem}</p>
        </div>
      )}

      {/* FUNCIONÁRIO JÁ POSSUI ARMÁRIO */}
      {temArmario ? (
        <section className="fila-funcionario-card">
          <div className="fila-funcionario-card-topo">
            <div className="fila-funcionario-icone sucesso">
              <CheckCircle2 size={25} />
            </div>

            <div className="fila-funcionario-card-titulo">
              <span>SUA SITUAÇÃO</span>
              <h2>Você já possui um armário</h2>
              <p>
                Sua conta já está associada a um armário.
              </p>
            </div>

            <span className="fila-funcionario-status associado">
              Com armário
            </span>
          </div>

          <div className="fila-funcionario-detalhes">
            <div>
              <span>ARMÁRIO</span>
              <strong className="fila-valor-azul">
                {armarioAtual.codigo}
              </strong>
            </div>

            <div>
              <span>SETOR</span>
              <strong>{funcionario?.setor || "Não informado"}</strong>
            </div>
          </div>

          <p className="fila-funcionario-aviso">
            A lista de espera é destinada a funcionários que
            ainda não possuem armário.
          </p>

          <Link
            to="/funcionario/meu-armario"
            className="fila-funcionario-botao primario"
          >
            Consultar meu armário
            <ArrowRight size={17} />
          </Link>
        </section>
      ) : estaNaFila ? (
        /* FUNCIONÁRIO JÁ ESTÁ NA FILA */
        <section className="fila-funcionario-card">
          <div className="fila-funcionario-card-topo">
            <div className="fila-funcionario-icone aguardando">
              <Hourglass size={25} />
            </div>

            <div className="fila-funcionario-card-titulo">
              <span>SUA SOLICITAÇÃO</span>
              <h2>Você está na lista de espera!</h2>
              <p>
                Sua solicitação está registrada no Smart Locker.
              </p>
            </div>

            <span className="fila-funcionario-status pendente">
              Aguardando
            </span>
          </div>

          <div className="fila-posicao-destaque">
            <div className="fila-posicao-icone">
              <ListOrdered size={25} />
            </div>

            <div>
              <span>SUA POSIÇÃO ATUAL</span>
              <strong>
                {solicitacao.posicao
                  ? `${solicitacao.posicao}º lugar`
                  : "Aguardando atualização"}
              </strong>
              <p>
                A fila segue a ordem de solicitação.
              </p>
            </div>
          </div>

          <div className="fila-funcionario-detalhes">
            <div>
              <span>DATA DA SOLICITAÇÃO</span>
              <strong>
                {formatarData(solicitacao.createdAt)}
              </strong>
            </div>

            <div>
              <span>SETOR</span>
              <strong>{funcionario?.setor || "Não informado"}</strong>
            </div>
          </div>

          <div className="fila-funcionario-aviso">
            <Clock3 size={19} />
            <p>
              Aguarde a disponibilidade de um armário.
              Quando houver uma atribuição, procure o responsável
              para retirar a chave.
            </p>
          </div>

          <button
            type="button"
            className="fila-funcionario-botao secundario"
            onClick={cancelarSolicitacao}
            disabled={processando}
          >
            {processando
              ? "Processando..."
              : "Cancelar solicitação"}
          </button>
        </section>
      ) : (
        /* FUNCIONÁRIO AINDA NÃO SOLICITOU ARMÁRIO */
        <section className="fila-funcionario-card fila-sem-solicitacao">
          <div className="fila-funcionario-icone neutro">
            <LockKeyhole size={27} />
          </div>

          <h2>Você ainda não está na lista de espera</h2>

          <p>
            Para solicitar um armário, entre na fila de espera.
            Sua posição será definida pela ordem da solicitação.
          </p>

          <div className="fila-funcionario-aviso">
            <CalendarDays size={19} />
            <p>
              Depois de solicitar, você poderá consultar sua posição
              nesta página.
            </p>
          </div>

          <button
            type="button"
            className="fila-funcionario-botao primario"
            onClick={solicitarEntrada}
            disabled={processando}
          >
            {processando
              ? "Solicitando..."
              : "Solicitar entrada na lista"}
            <ArrowRight size={17} />
          </button>
        </section>
      )}
    </section>
  );
}

export default ListaEsperaFuncionario;
