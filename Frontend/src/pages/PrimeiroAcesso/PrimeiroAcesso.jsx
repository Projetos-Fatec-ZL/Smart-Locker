import { useState } from "react";
import { Link } from "react-router-dom";
import "./PrimeiroAcesso.css";

function PrimeiroAcesso() {
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

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

  function handleSubmit(event) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    if (!cpf || !senha || !confirmarSenha) {
      setErro("Preencha todos os campos.");
      return;
    }

    if (cpf.length !== 14) {
      setErro("Informe um CPF válido.");
      return;
    }

    if (senha.length < 4) {
      setErro("A senha deve ter pelo menos 4 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não conferem.");
      return;
    }

    /*
      FUTURAMENTE:
      aqui o backend vai verificar se o CPF
      foi previamente cadastrado pelo administrador.
    */

    setSucesso("Acesso criado com sucesso!");
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
            />
          </div>

          {erro && (
            <div className="primeiro-acesso-erro">
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="primeiro-acesso-sucesso">
              {sucesso}
            </div>
          )}

          <button
            type="submit"
            className="primeiro-acesso-button"
          >
            Criar acesso
          </button>
        </form>

        <div className="primeiro-acesso-info">
          <span className="info-icon">i</span>

          <p>
            Seu CPF precisa estar previamente cadastrado no sistema
            pelo administrador.
          </p>
        </div>

        <Link
          to="/"
          className="primeiro-acesso-voltar"
        >
          ← Voltar para o login
        </Link>

      </section>
    </main>
  );
}

export default PrimeiroAcesso;