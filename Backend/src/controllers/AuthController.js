
const Funcionario = require("../models/Funcionario");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// realiza o login
const login = async (req, res) => {
  try {
    const { cpf, senha } = req.body;

    if (!cpf || !senha) {
      return res.status(400).json({
        mensagem: "Informe CPF e senha.",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        mensagem: "Chave de autenticação não configurada.",
      });
    }

    const funcionario = await Funcionario.findOne({ cpf })
      .select("+senha");

    if (!funcionario) {
      return res.status(401).json({
        mensagem: "CPF ou senha incorretos.",
      });
    }

    const senhaCorreta = await bcrypt.compare(
      senha,
      funcionario.senha
    );

    if (!senhaCorreta) {
      return res.status(401).json({
        mensagem: "CPF ou senha incorretos.",
      });
    }

    if (funcionario.status !== "ativo") {
      return res.status(403).json({
        mensagem: "Funcionário inativo. Acesso não permitido.",
      });
    }

    const token = jwt.sign(
      {
        id: funcionario._id,
        perfil: funcionario.perfil,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    return res.status(200).json({
      mensagem: "Login realizado com sucesso!",
      token,
      usuario: {
        id: funcionario._id,
        nome: funcionario.nome,
        cpf: funcionario.cpf,
        perfil: funcionario.perfil,
        setor: funcionario.setor,
      },
    });
  } catch (error) {
    return res.status(500).json({
      mensagem: "Erro ao realizar login.",
    });
  }
};

module.exports = { login };
