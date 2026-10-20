
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  KeyRound,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import "./EsqueciSenha.css";

function EsqueciSenha() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [cpf, setCpf] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [erro, setErro] = useState("");
  const [concluido, setConcluido] = useState(false);

  function formatarCpf(valor) {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);

    return numeros
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  function abrirFormulario() {
    setMostrarFormulario(true);
    setErro("");
  }

  function voltarParaOrientacoes() {
    setMostrarFormulario(false);
    setCpf("");
    setCodigo("");
    setNovaSenha("");
    setConfirmarSenha("");
    setErro("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    setErro("");

    const cpfDigitado = cpf.replace(/\D/g, "");

    // Validação básica do CPF informado.
    if (cpfDigitado.length !== 11) {
      setErro("Informe um CPF com 11 dígitos.");
      return;
    }

    // Recupera o código temporário gerado pelo administrador.
    const dadosSalvos = sessionStorage.getItem(
      "smartlocker-recovery"
    );

    if (!dadosSalvos) {
      setErro(
        "Não encontramos um código de recuperação. Procure o administrador."
      );
      return;
    }

    let recuperacao;

    try {
      recuperacao = JSON.parse(dadosSalvos);
    } catch {
      setErro(
        "Não foi possível verificar o código. Solicite outro ao administrador."
      );
      return;
    }

    // Confere se o código pertence ao CPF informado.
    if (recuperacao.cpf !== cpfDigitado) {
      setErro(
        "O código não corresponde ao CPF informado."
      );
      return;
    }

    // Verifica se o código já foi utilizado.
    if (recuperacao.usado) {
      setErro(
        "Este código já foi utilizado. Solicite um novo ao administrador."
      );
      return;
    }

    // Verifica se o código expirou.
    if (Date.now() >= recuperacao.expiraEm) {
      setErro(
        "O código expirou. Solicite um novo ao administrador."
      );
      return;
    }

    // Confere o código digitado.
    if (
      codigo.trim() !== String(recuperacao.codigo)
    ) {
      setErro("Código de recuperação inválido.");
      return;
    }

    // Verifica a nova senha.
    if (novaSenha.length < 8) {
      setErro(
        "A nova senha deve ter pelo menos 8 caracteres."
      );
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    /*
      SIMULAÇÃO DO FRONTEND:
      Marca o código como utilizado.

      A nova senha ainda não é salva na conta.
      Essa operação será implementada no Spring Boot.
    */
    sessionStorage.setItem(
      "smartlocker-recovery",
      JSON.stringify({
        ...recuperacao,
        usado: true,
      })
    );

    setConcluido(true);
  }

  return (
    <main className="recuperacao-page">
      <section className="recuperacao-card">

        {!concluido ? (
          <>
            <div className="recuperacao-icone">
              <KeyRound size={30} />
            </div>

            {!mostrarFormulario ? (
              <>
                <h1>Recuperar acesso</h1>

                <p className="recuperacao-subtitulo">
                  Esqueceu sua senha? Vamos ajudar você a
                  recuperar o acesso ao Smart Locker.
                </p>

                <div className="recuperacao-aviso">
                  <ShieldCheck size={24} />

                  <div>
                    <h2>Como recuperar minha senha?</h2>

                    <p>
                      Procure o administrador ou responsável
                      pelo sistema para confirmar sua identidade
                      e solicitar um código de recuperação.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="recuperacao-botao"
                  onClick={abrirFormulario}
                >
                  Já tenho um código
                </button>
              </>
            ) : (
              <>
                <h1>Redefinir senha</h1>

                <p className="recuperacao-subtitulo">
                  Informe seu CPF e o código recebido para
                  criar uma nova senha.
                </p>

                <form
                  className="recuperacao-form"
                  onSubmit={handleSubmit}
                >
                  <div className="recuperacao-campo">
                    <label htmlFor="cpfRecuperacao">
                      CPF
                    </label>

                    <input
                      id="cpfRecuperacao"
                      name="cpf"
                      type="text"
                      inputMode="numeric"
                      autoComplete="username"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(event) => {
                        setCpf(
                          formatarCpf(event.target.value)
                        );
                        setErro("");
                      }}
                      maxLength={14}
                      required
                    />
                  </div>

                  <div className="recuperacao-campo">
                    <label htmlFor="codigo">
                      Código de recuperação
                    </label>

                    <input
                      id="codigo"
                      name="codigo"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="Digite o código recebido"
                      value={codigo}
                      onChange={(event) => {
                        setCodigo(
                          event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6)
                        );
                        setErro("");
                      }}
                      maxLength={6}
                      required
                    />
                  </div>

                  <div className="recuperacao-campo">
                    <label htmlFor="novaSenha">
                      Nova senha
                    </label>

                    <input
                      id="novaSenha"
                      name="novaSenha"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Mínimo de 8 caracteres"
                      value={novaSenha}
                      onChange={(event) => {
                        setNovaSenha(event.target.value);
                        setErro("");
                      }}
                      required
                    />
                  </div>

                  <div className="recuperacao-campo">
                    <label htmlFor="confirmarSenha">
                      Repetir nova senha
                    </label>

                    <input
                      id="confirmarSenha"
                      name="confirmarSenha"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Digite a senha novamente"
                      value={confirmarSenha}
                      onChange={(event) => {
                        setConfirmarSenha(event.target.value);
                        setErro("");
                      }}
                      required
                    />
                  </div>

                  {erro && (
                    <div
                      className="recuperacao-erro"
                      role="alert"
                    >
                      {erro}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="recuperacao-botao"
                  >
                    Confirmar
                  </button>
                </form>

                <button
                  type="button"
                  className="recuperacao-voltar"
                  onClick={voltarParaOrientacoes}
                >
                  <ArrowLeft size={16} />
                  Voltar
                </button>
              </>
            )}

            {!mostrarFormulario && (
              <Link to="/" className="recuperacao-voltar">
                <ArrowLeft size={16} />
                Voltar para o login
              </Link>
            )}
          </>
        ) : (
          <div className="recuperacao-sucesso">
            <div className="recuperacao-icone sucesso">
              <CheckCircle2 size={32} />
            </div>

            <h1>Validação concluída!</h1>

            <p>
              O código foi validado e não poderá ser usado
              novamente. A alteração efetiva da senha ainda
              precisa ser conectada ao backend.
            </p>

            <Link to="/" className="recuperacao-botao">
              Voltar para o login
            </Link>
          </div>
        )}

      </section>
    </main>
  );
}

export default EsqueciSenha;
