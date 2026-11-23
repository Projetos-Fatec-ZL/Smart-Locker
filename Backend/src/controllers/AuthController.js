
const Funcionario = require("../models/Funcionario");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// normaliza o CPF
function formatosCpf(cpf) {
  const numeros = cpf.replace(/\D/g, "");

  const formatado = numeros.replace(
    /(\d{3})(\d{3})(\d{3})(\d{2})/,
    "$1.$2.$3-$4"
  );

  return [numeros, formatado];
}

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

    const funcionario = await Funcionario.findOne({
      cpf: { $in: formatosCpf(cpf) },
    }).select("+senha");

    if (!funcionario || !funcionario.senha) {
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
      { expiresIn: "8h" }
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

// realiza o primeiro acesso
const primeiroAcesso = async (req, res) => {
  try {
    const { cpf, senha, confirmarSenha } = req.body;

    if (!cpf || !senha || !confirmarSenha) {
      return res.status(400).json({
        mensagem: "Preencha todos os campos.",
      });
    }

    const cpfLimpo = cpf.replace(/\D/g, "");

    if (cpfLimpo.length !== 11) {
      return res.status(400).json({
        mensagem: "Informe um CPF válido.",
      });
    }

    if (senha.length < 6) {
      return res.status(400).json({
        mensagem: "A senha deve ter pelo menos 6 caracteres.",
      });
    }

    if (senha !== confirmarSenha) {
      return res.status(400).json({
        mensagem: "As senhas não conferem.",
      });
    }

    const funcionario = await Funcionario.findOne({
      cpf: { $in: formatosCpf(cpfLimpo) },
    }).select("+senha");

    if (!funcionario) {
      return res.status(404).json({
        mensagem: "CPF não cadastrado. Procure o administrador.",
      });
    }

    if (funcionario.status !== "ativo") {
      return res.status(403).json({
        mensagem: "Funcionário inativo. Procure o administrador.",
      });
    }

    if (funcionario.senha) {
      return res.status(409).json({
        mensagem: "Este funcionário já possui acesso cadastrado.",
      });
    }

    funcionario.senha = senha;
    await funcionario.save();

    return res.status(201).json({
      mensagem: "Acesso criado com sucesso! Você já pode fazer login.",
    });
  } catch (error) {
    return res.status(500).json({
      mensagem: "Erro ao criar acesso.",
    });
  }
};

// administrador gera código de recuperação
const gerarCodigoRecuperacao = async (req, res) => {
  try {
    const funcionario = await Funcionario.findById(req.params.id)
      .select("+senha");

    if (!funcionario) {
      return res.status(404).json({
        mensagem: "Funcionário não encontrado.",
      });
    }

    if (funcionario.perfil !== "funcionario") {
      return res.status(400).json({
        mensagem: "Esta operação é destinada a funcionários.",
      });
    }

    if (funcionario.status !== "ativo") {
      return res.status(403).json({
        mensagem: "Funcionário inativo.",
      });
    }

    if (!funcionario.senha) {
      return res.status(400).json({
        mensagem: "Este funcionário ainda precisa realizar o primeiro acesso.",
      });
    }

    const codigo = String(
      crypto.randomInt(0, 1000000)
    ).padStart(6, "0");

    funcionario.codigoRecuperacaoHash = await bcrypt.hash(
      codigo,
      10
    );

    funcionario.codigoRecuperacaoExpiraEm = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await funcionario.save();

    return res.status(200).json({
      mensagem: "Código de recuperação gerado com sucesso.",
      codigo,
      validadeMinutos: 15,
    });
  } catch (error) {
    return res.status(500).json({
      mensagem: "Erro ao gerar código de recuperação.",
    });
  }
};

// funcionário redefine a própria senha
const redefinirSenha = async (req, res) => {
  try {
    const {
      cpf,
      codigo,
      novaSenha,
      confirmarSenha,
    } = req.body;

    if (!cpf || !codigo || !novaSenha || !confirmarSenha) {
      return res.status(400).json({
        mensagem: "Preencha todos os campos.",
      });
    }

    if (codigo.length !== 6 || !/^\d{6}$/.test(codigo)) {
      return res.status(400).json({
        mensagem: "Informe um código válido de 6 dígitos.",
      });
    }

    if (novaSenha.length < 8) {
      return res.status(400).json({
        mensagem: "A nova senha deve ter pelo menos 8 caracteres.",
      });
    }

    if (novaSenha !== confirmarSenha) {
      return res.status(400).json({
        mensagem: "As senhas não coincidem.",
      });
    }

    const funcionario = await Funcionario.findOne({
      cpf: { $in: formatosCpf(cpf) },
    }).select(
      "+senha +codigoRecuperacaoHash +codigoRecuperacaoExpiraEm"
    );

    if (!funcionario || funcionario.perfil !== "funcionario") {
      return res.status(404).json({
        mensagem: "Não foi possível validar os dados informados.",
      });
    }

    if (funcionario.status !== "ativo") {
      return res.status(403).json({
        mensagem: "Funcionário inativo. Procure o administrador.",
      });
    }

    if (
      !funcionario.codigoRecuperacaoHash ||
      !funcionario.codigoRecuperacaoExpiraEm
    ) {
      return res.status(400).json({
        mensagem: "Código de recuperação não encontrado. Solicite outro ao administrador.",
      });
    }

    if (Date.now() >= funcionario.codigoRecuperacaoExpiraEm.getTime()) {
      funcionario.codigoRecuperacaoHash = null;
      funcionario.codigoRecuperacaoExpiraEm = null;
      await funcionario.save();

      return res.status(400).json({
        mensagem: "O código expirou. Solicite um novo ao administrador.",
      });
    }

    const codigoCorreto = await bcrypt.compare(
      codigo,
      funcionario.codigoRecuperacaoHash
    );

    if (!codigoCorreto) {
      return res.status(400).json({
        mensagem: "Código de recuperação inválido.",
      });
    }

    funcionario.senha = novaSenha;
    funcionario.codigoRecuperacaoHash = null;
    funcionario.codigoRecuperacaoExpiraEm = null;

    await funcionario.save();

    return res.status(200).json({
      mensagem: "Senha redefinida com sucesso! Você já pode fazer login.",
    });
  } catch (error) {
    return res.status(500).json({
      mensagem: "Erro ao redefinir senha.",
    });
  }
};

module.exports = {
  login,
  primeiroAcesso,
  gerarCodigoRecuperacao,
  redefinirSenha,
};
