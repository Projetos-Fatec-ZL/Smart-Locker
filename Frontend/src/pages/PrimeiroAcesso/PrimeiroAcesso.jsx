
import { useState } from "react";
import { Link } from "react-router-dom";
import "./PrimeiroAcesso.css";

const API_URL = "http://localhost:5000/api";

function PrimeiroAcesso() {
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  function formatarCpf(valor) {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);

    return numeros
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  function handleCpfChange(event) {
    setCpf(formatarCpf(event.target.value));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    if (!cpf || !senha || !confirmarSenha) {
      setErro("Preencha todos os campos.");
      return;
    }

    if (cpf.replace(/\D/g, "").length !== 11) {
      setErro("Informe um CPF válido.");
      return;
    }

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não conferem.");
      return;
    }

    try {
      setCarregando(true);

      const resposta = await fetch(
        `${API_URL}/auth/primeiro-acesso`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cpf: cpf.replace(/\D/g, ""),
            senha,
            confirmarSenha,
          }),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.mensagem || "Não foi possível criar seu acesso."
        );
      }

      setSucesso(dados.mensagem);
      setCpf("");
      setSenha("");
      setConfirmarSenha("");
    } catch (error) {
      setErro(error.message || "Erro ao conectar com o servidor.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="primeiro-acesso-page">
      <section className="primeiro-acesso-container">
        <h1>Primeiro acesso</h1>

        <p className="primeiro-acesso-subtitulo">
          Informe seu CPF e crie sua senha para acessar o sistema
        </p>

        <form onSubmit={handleSubmit}>
          <div className="primeiro-acesso-form-group">
            <label htmlFor="cpf">CPF</label>

            <input
              id="cpf"
              type="text"
              inputMode="numeric"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={handleCpfChange}
              disabled={carregando}
            />
          </div>

          <div className="primeiro-acesso-form-group">
            <label htmlFor="senha">Nova senha</label>

            <input
              id="senha"
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              disabled={carregando}
            />
          </div>

          <div className="primeiro-acesso-form-group">
            <label htmlFor="confirmarSenha">
              Confirmar senha
            </label>

            <input
              id="confirmarSenha"
              type="password"
              placeholder="••••••••"
              value={confirmarSenha}
              onChange={(event) =>
                setConfirmarSenha(event.target.value)
              }
              disabled={carregando}
            />
          </div>

          {erro && (
            <div className="primeiro-acesso-erro" role="alert">
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="primeiro-acesso-sucesso" role="status">
              {sucesso}
            </div>
          )}

          <button
            type="submit"
            className="primeiro-acesso-button"
            disabled={carregando}
          >
            {carregando ? "Criando acesso..." : "Criar acesso"}
          </button>
        </form>

        <div className="primeiro-acesso-info">
          <span className="info-icon">i</span>

          <p>
            Seu CPF precisa estar previamente cadastrado no sistema
            pelo administrador.
          </p>
        </div>

        <Link to="/" className="primeiro-acesso-voltar">
          ← Voltar para o login
        </Link>
      </section>
    </main>
  );
}

export default PrimeiroAcesso;
