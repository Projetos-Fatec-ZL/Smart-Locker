
const Chave = require("../models/Chave");
const Armario = require("../models/Armario");

// cadastra uma chave
const cadastrarChave = async (req, res) => {
  try {
    const { codigo, armario, status } = req.body;

    const chaveExistente = await Chave.findOne({ codigo });

    if (chaveExistente) {
      return res.status(409).json({
        mensagem: "Já existe uma chave com esse código.",
      });
    }

    const armarioExistente = await Armario.findById(armario);

    if (!armarioExistente) {
      return res.status(404).json({
        mensagem: "Armário não encontrado.",
      });
    }

    const chave = await Chave.create({
      codigo,
      armario,
      status,
    });

    return res.status(201).json({
      mensagem: "Chave cadastrada com sucesso!",
      chave,
    });
  } catch (error) {
    return res.status(500).json({
      mensagem: "Erro ao cadastrar chave.",
      erro: error.message,
    });
  }
};

// lista as chaves
const listarChaves = async (req, res) => {
  try {
    const { codigo, armario, status } = req.query;

    const filtros = {};

    if (codigo) {
      filtros.codigo = { $regex: codigo, $options: "i" };
    }

    if (armario) filtros.armario = armario;
    if (status) filtros.status = status;

    const chaves = await Chave.find(filtros)
      .populate("armario", "codigo tipo status")
      .sort({ codigo: 1 });

    return res.status(200).json(chaves);
  } catch (error) {
    return res.status(500).json({
      mensagem: "Erro ao listar chaves.",
      erro: error.message,
    });
  }
};

// busca uma chave pelo id
const buscarChavePorId = async (req, res) => {
  try {
    const chave = await Chave.findById(req.params.id)
      .populate("armario", "codigo tipo status");

    if (!chave) {
      return res.status(404).json({
        mensagem: "Chave não encontrada.",
      });
    }

    return res.status(200).json(chave);
  } catch (error) {
    return res.status(500).json({
      mensagem: "Erro ao buscar chave.",
      erro: error.message,
    });
  }
};

// atualiza os dados de uma chave
const atualizarChave = async (req, res) => {
  try {
    const { codigo, armario, status } = req.body;

    const dadosAtualizados = {};

    if (codigo !== undefined) dadosAtualizados.codigo = codigo;
    if (status !== undefined) dadosAtualizados.status = status;

    if (armario !== undefined) {
      const armarioExistente = await Armario.findById(armario);

      if (!armarioExistente) {
        return res.status(404).json({
          mensagem: "Armário não encontrado.",
        });
      }

      dadosAtualizados.armario = armario;
    }

    const chave = await Chave.findByIdAndUpdate(
      req.params.id,
      dadosAtualizados,
      {
        new: true,
        runValidators: true,
      }
    ).populate("armario", "codigo tipo status");

    if (!chave) {
      return res.status(404).json({
        mensagem: "Chave não encontrada.",
      });
    }

    return res.status(200).json({
      mensagem: "Chave atualizada com sucesso!",
      chave,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        mensagem: "Já existe uma chave com esse código.",
      });
    }

    return res.status(500).json({
      mensagem: "Erro ao atualizar chave.",
      erro: error.message,
    });
  }
};

// exclui uma chave
const excluirChave = async (req, res) => {
  try {
    const chave = await Chave.findByIdAndDelete(req.params.id);

    if (!chave) {
      return res.status(404).json({
        mensagem: "Chave não encontrada.",
      });
    }

    return res.status(200).json({
      mensagem: "Chave excluída com sucesso!",
    });
  } catch (error) {
    return res.status(500).json({
      mensagem: "Erro ao excluir chave.",
      erro: error.message,
    });
  }
};

module.exports = {
  cadastrarChave,
  listarChaves,
  buscarChavePorId,
  atualizarChave,
  excluirChave,
};
