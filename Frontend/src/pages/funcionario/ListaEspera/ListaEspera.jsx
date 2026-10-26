
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Hourglass,
  CheckCircle2,
  LockKeyhole,
  CalendarDays,
  ListOrdered,
  ArrowRight,
  Clock3,
} from "lucide-react";

import { armariosMock } from "../../../data/mockData";
import { listaEsperaMock } from "../../admin/ListaEspera/listaEsperaMock";
import "./ListaEspera.css";

const nomeFuncionario = "Ana Souza";
const setorFuncionario = "Padaria";

function lerSolicitacaoSalva() {
  try {
    const dados = sessionStorage.getItem(
      "smartlocker-waiting-request"
    );

    if (!dados) return null;

    const solicitacao = JSON.parse(dados);

    return solicitacao.nome === nomeFuncionario
      ? solicitacao
      : null;
  } catch {
    return null;
  }
}

function ListaEsperaFuncionario() {
  const armarioAtual = armariosMock.find(
    (item) =>
      item.funcionario === nomeFuncionario &&
      item.status === "ocupado"
  );

  const solicitacaoExistente = listaEsperaMock.find(
    (item) => item.nome === nomeFuncionario
  );

  const [solicitacaoLocal, setSolicitacaoLocal] =
    useState(lerSolicitacaoSalva);

  const solicitacao =
    solicitacaoExistente || solicitacaoLocal;

  const estaNaFila = Boolean(solicitacao);
  const temArmario = Boolean(armarioAtual);

  const posicaoFila = solicitacaoExistente
    ? listaEsperaMock.findIndex(
        (item) => item.id === solicitacaoExistente.id
      ) + 1
    : solicitacaoLocal
    ? listaEsperaMock.length + 1
    : null;

  function formatarData(data) {
    if (!data) return "Não informada";

    return new Date(
      `${data}T12:00:00`
    ).toLocaleDateString("pt-BR");
  }

  function solicitarEntrada() {
    if (temArmario || estaNaFila) return;

    const dataAtual = new Date()
      .toISOString()
      .slice(0, 10);

    const novaSolicitacao = {
      id: Date.now(),
      nome: nomeFuncionario,
      setor: setorFuncionario,
      data: dataAtual,
      status: "aguardando",
    };

    sessionStorage.setItem(
      "smartlocker-waiting-request",
      JSON.stringify(novaSolicitacao)
    );

    setSolicitacaoLocal(novaSolicitacao);
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
                {armarioAtual.numero}
              </strong>
            </div>

            <div>
              <span>SETOR</span>
              <strong>{setorFuncionario}</strong>
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
              <strong>{posicaoFila}º lugar</strong>

              <p>
                A fila segue a ordem de solicitação.
              </p>
            </div>
          </div>

          <div className="fila-funcionario-detalhes">
            <div>
              <span>DATA DA SOLICITAÇÃO</span>

              <strong>
                {formatarData(solicitacao.data)}
              </strong>
            </div>

            <div>
              <span>SETOR</span>

              <strong>
                {solicitacao.setor || setorFuncionario}
              </strong>
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
          >
            Solicitar entrada na lista
            <ArrowRight size={17} />
          </button>

        </section>
      )}

    </section>
  );
}

export default ListaEsperaFuncionario;
