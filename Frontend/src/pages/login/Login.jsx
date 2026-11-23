
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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

    const cpfLimpo = cpf.replace(/\D/g, "");

    if (!cpfLimpo || !senha) {
      setErro("Preencha o CPF e a senha.");
      return;
    }

    setLoading(true);

    try {
      const resposta = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cpf: cpfLimpo,
            senha,
          }),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.mensagem || "Erro ao realizar login.");
      }

      if (!dados.token || !dados.usuario) {
        throw new Error("Resposta de autenticação inválida.");
      }

      sessionStorage.setItem("token", dados.token);
      sessionStorage.setItem("usuario", JSON.stringify(dados.usuario));

      if (dados.usuario.perfil === "admin") {
        navigate("/admin/dashboard");
      } else if (dados.usuario.perfil === "funcionario") {
        navigate("/funcionario/inicio");
      } else {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("usuario");
        throw new Error("Perfil de usuário não reconhecido.");
      }
    } catch (error) {
      setErro(
        error.message === "Failed to fetch"
          ? "Não foi possível conectar ao servidor. Verifique se o backend está ligado."
          : error.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-banner">
        <div className="login-logo">
          <div className="login-logo-icon">🔒</div>

          <div>
            <h2>Smart Locker</h2>
            <span>Gestão de armários</span>
          </div>
        </div>

        <div className="login-banner-content">
          <h1>
            Bem-vindo ao
            <br />
            Smart Locker
          </h1>

          <p>
            Plataforma de gestão de armários e controle de
            chaves para funcionários.
          </p>

          <div className="login-beneficios">
            <p>🔐 Acesso seguro e controlado</p>
            <p>🔑 Rastreamento de chaves</p>
            <p>📋 Gestão da lista de espera</p>
          </div>
        </div>
      </section>

      <section className="login-form-area">
        <div className="login-container">
          <div className="login-header">
            <h1>Acessar o sistema</h1>

            <p>Entre com seu CPF e senha para continuar</p>
          </div>

          {erro && (
            <div className="login-erro">
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="login-form-group">
              <label htmlFor="cpf">CPF</label>

              <input
                id="cpf"
                type="text"
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCpfChange}
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="login-form-group">
              <label htmlFor="senha">Senha</label>

              <input
                id="senha"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="login-links">
            <Link to="/primeiro-acesso">
              Primeiro acesso
            </Link>

            <Link to="/esqueci-senha">
              Esqueci minha senha
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;
