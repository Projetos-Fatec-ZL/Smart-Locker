
const Armario = require("../models/Armario");
const Funcionario = require("../models/Funcionario");
const Chave = require("../models/Chave");

// cadastra um armario
const cadastrarArmario = async (req, res) => {
  try {
    const { codigo, tipo, status } = req.body;

    const armarioExistente = await Armario.findOne({ codigo });

    if (armarioExistente) {
      return res.status(409).json({
        mensagem: "Já existe um armário com esse código.",
      });
    }

    const armario = await Armario.create({
      codigo,
      tipo,
      status,
    });

    return res.status(201).json({
      mensagem: "Armário cadastrado com sucesso!",
      armario,
    });
  } catch (error) {
    return res.status(500).json({
      mensagem: "Erro ao cadastrar armário.",
      erro: error.message,
    });
  }
};

// lista os armarios
const listarArmarios = async (req, res) => {
  try {
    const { codigo, tipo, status } = req.query;

    const filtros = {};

    if (codigo) {
      filtros.codigo = { $regex: codigo, $options: "i" };
    }

    if (tipo) filtros.tipo = tipo;
    if (status) filtros.status = status;

    const armarios = await Armario.find(filtros).sort({ codigo: 1 });

    return res.status(200).json(armarios);
  } catch (error) {
    return res.status(500).json({
      mensagem: "Erro ao listar armários.",
      erro: error.message,
    });
  }
};

// busca um armario pelo id
const buscarArmarioPorId = async (req, res) => {
  try {
    const armario = await Armario.findById(req.params.id);

    if (!armario) {
      return res.status(404).json({
        mensagem: "Armário não encontrado.",
      });
    }

    return res.status(200).json(armario);
  } catch (error) {
    return res.status(500).json({
      mensagem: "Erro ao buscar armário.",
      erro: error.message,
    });
  }
};

// atualiza os dados de um armario
const atualizarArmario = async (req, res) => {
  try {
    const { codigo, tipo, status } = req.body;

    const dadosAtualizados = {};

    if (codigo !== undefined) dadosAtualizados.codigo = codigo;
    if (tipo !== undefined) dadosAtualizados.tipo = tipo;
    if (status !== undefined) dadosAtualizados.status = status;

    const armario = await Armario.findByIdAndUpdate(
      req.params.id,
      dadosAtualizados,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!armario) {
      return res.status(404).json({
        mensagem: "Armário não encontrado.",
      });
    }

    return res.status(200).json({
      mensagem: "Armário atualizado com sucesso!",
      armario,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        mensagem: "Já existe um armário com esse código.",
      });
    }

    return res.status(500).json({
      mensagem: "Erro ao atualizar armário.",
      erro: error.message,
    });
  }
};

// exclui um armario
const excluirArmario = async (req, res) => {
  try {
    const armario = await Armario.findById(req.params.id);

    if (!armario) {
      return res.status(404).json({
        mensagem: "Armário não encontrado.",
      });
    }

    const funcionarioVinculado = await Funcionario.findOne({
      armario: armario._id,
    });

    const chaveVinculada = await Chave.findOne({
      armario: armario._id,
    });

    if (funcionarioVinculado || chaveVinculada) {
      return res.status(409).json({
        mensagem: "Não é possível excluir um armário que possui funcionário ou chave vinculada.",
      });
    }

    await Armario.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      mensagem: "Armário excluído com sucesso!",
    });
  } catch (error) {
    return res.status(500).json({
      mensagem: "Erro ao excluir armário.",
      erro: error.message,
    });
  }
};

module.exports = {
  cadastrarArmario,
  listarArmarios,
  buscarArmarioPorId,
  atualizarArmario,
  excluirArmario,
};
