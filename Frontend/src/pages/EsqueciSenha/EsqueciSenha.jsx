
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  KeyRound,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import "./EsqueciSenha.css";

const API_URL = "http://localhost:5000/api";

function EsqueciSenha() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [cpf, setCpf] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [erro, setErro] = useState("");
  const [concluido, setConcluido] = useState(false);
  const [carregando, setCarregando] = useState(false);

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

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");

    const cpfDigitado = cpf.replace(/\D/g, "");

    if (cpfDigitado.length !== 11) {
      setErro("Informe um CPF com 11 dígitos.");
      return;
    }

    if (codigo.length !== 6) {
      setErro("Informe o código de recuperação com 6 dígitos.");
      return;
    }

    if (novaSenha.length < 8) {
      setErro("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    try {
      setCarregando(true);

      const resposta = await fetch(
        `${API_URL}/auth/redefinir-senha`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cpf: cpfDigitado,
            codigo,
            novaSenha,
            confirmarSenha,
          }),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.mensagem || "Não foi possível redefinir sua senha."
        );
      }

      setConcluido(true);
    } catch (error) {
      setErro(
        error.message || "Erro ao conectar com o servidor."
      );
    } finally {
      setCarregando(false);
    }
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
                        setCpf(formatarCpf(event.target.value));
                        setErro("");
                      }}
                      maxLength={14}
                      required
                      disabled={carregando}
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
                      disabled={carregando}
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
                      disabled={carregando}
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
                      disabled={carregando}
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
                    disabled={carregando}
                  >
                    {carregando ? "Validando..." : "Confirmar"}
                  </button>
                </form>

                <button
                  type="button"
                  className="recuperacao-voltar"
                  onClick={voltarParaOrientacoes}
                  disabled={carregando}
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

            <h1>Senha redefinida!</h1>

            <p>
              Sua senha foi alterada com sucesso.
              Agora você já pode acessar o Smart Locker
              utilizando sua nova senha.
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
