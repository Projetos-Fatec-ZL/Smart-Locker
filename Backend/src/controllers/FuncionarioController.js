
const Funcionario = require("../models/Funcionario");

// cadastra um funcionario
const cadastrarFuncionario = async (req, res) => {
  try {
    const { nome, cpf, senha, setor, status, armario } = req.body;

    if (!senha || senha.length < 6) {
      return res.status(400).json({
        mensagem: "A senha deve ter pelo menos 6 caracteres.",
      });
    }

    const funcionarioExistente = await Funcionario.findOne({ cpf });

    if (funcionarioExistente) {
      return res.status(409).json({
        mensagem: "Já existe um funcionário cadastrado com este CPF.",
      });
    }

    const funcionario = await Funcionario.create({
      nome,
      cpf,
      senha,
      setor,
      status,
      armario: armario || null,
    });

    const funcionarioSeguro = funcionario.toObject();
    delete funcionarioSeguro.senha;

    return res.status(201).json({
      mensagem: "Funcionário cadastrado com sucesso!",
      funcionario: funcionarioSeguro,
    });
  } catch (error) {
    return res.status(500).json({
      mensagem: "Erro ao cadastrar funcionário.",
      erro: error.message,
    });
  }
};


// lista os funcionarios
const listarFuncionarios = async (req, res) => {
  try {
    const { nome, cpf, setor, status } = req.query;

    const filtros = {};

    if (nome) filtros.nome = { $regex: nome, $options: "i" };
    if (cpf) filtros.cpf = cpf;
    if (setor) filtros.setor = setor;
    if (status) filtros.status = status;

    const funcionarios = await Funcionario.find(filtros)
      .populate("armario", "codigo tipo status")
      .sort({ nome: 1 });

    return res.status(200).json(funcionarios);
  } catch (error) {
    return res.status(500).json({
      mensagem: "Erro ao listar funcionários.",
      erro: error.message,
    });
  }
};

// busca um funcionario pelo id
const buscarFuncionarioPorId = async (req, res) => {
  try {
    const funcionario = await Funcionario.findById(req.params.id)
      .populate("armario", "codigo tipo status");

    if (!funcionario) {
      return res.status(404).json({
        mensagem: "Funcionário não encontrado.",
      });
    }

    return res.status(200).json(funcionario);
  } catch (error) {
    return res.status(500).json({
      mensagem: "Erro ao buscar funcionário.",
      erro: error.message,
    });
  }
};

// atualiza os dados de um funcionario
const atualizarFuncionario = async (req, res) => {
  try {
    const id = String(req.params.id)
      .replace(/^["']|["']$/g, "")
      .trim();

    // verifica se o id possui o formato correto
    if (!/^[a-f\d]{24}$/i.test(id)) {
      return res.status(400).json({
        mensagem: "ID do funcionário inválido.",
      });
    }

    const { nome, cpf, setor, status, armario } = req.body;

    const dadosAtualizados = {};

    if (nome !== undefined) dadosAtualizados.nome = nome;
    if (cpf !== undefined) dadosAtualizados.cpf = cpf;
    if (setor !== undefined) dadosAtualizados.setor = setor;
    if (status !== undefined) dadosAtualizados.status = status;
    if (armario !== undefined) dadosAtualizados.armario = armario;

    const funcionario = await Funcionario.findByIdAndUpdate(
      id,
      dadosAtualizados,
      {
        new: true,
        runValidators: true,
      }
    ).populate("armario", "codigo tipo status");

    if (!funcionario) {
      return res.status(404).json({
        mensagem: "Funcionário não encontrado.",
      });
    }

    return res.status(200).json({
      mensagem: "Funcionário atualizado com sucesso!",
      funcionario,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        mensagem: "Já existe um funcionário cadastrado com este CPF.",
      });
    }

    return res.status(500).json({
      mensagem: "Erro ao atualizar funcionário.",
      erro: error.message,
    });
  }
};

// consulta o perfil do funcionario autenticado
const consultarMeuPerfil = async (req, res) => {
  try {
    const funcionario = await Funcionario.findById(req.usuario.id)
      .select("-senha")
      .populate("armario", "codigo tipo status");

    if (!funcionario) {
      return res.status(404).json({
        mensagem: "Funcionário não encontrado.",
      });
    }

    if (funcionario.status !== "ativo") {
      return res.status(403).json({
        mensagem: "Funcionário inativo. Acesso não permitido.",
      });
    }

    return res.status(200).json({
      mensagem: "Perfil consultado com sucesso!",
      funcionario,
    });
  } catch (error) {
    return res.status(500).json({
      mensagem: "Erro ao consultar perfil.",
    });
  }
};

// exclui um funcionario
const excluirFuncionario = async (req, res) => {
  try {
    const funcionario = await Funcionario.findByIdAndDelete(req.params.id);

    if (!funcionario) {
      return res.status(404).json({
        mensagem: "Funcionário não encontrado.",
      });
    }

    return res.status(200).json({
      mensagem: "Funcionário excluído com sucesso!",
    });
  } catch (error) {
    return res.status(500).json({
      mensagem: "Erro ao excluir funcionário.",
      erro: error.message,
    });
  }
};

module.exports = {
  cadastrarFuncionario,
  listarFuncionarios,
  buscarFuncionarioPorId,
  atualizarFuncionario,
  excluirFuncionario,
  consultarMeuPerfil,
};
