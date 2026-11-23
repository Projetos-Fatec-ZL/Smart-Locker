
const Chave = require("../models/Chave");
const Armario = require("../models/Armario");

// cadastra uma chave
const cadastrarChave = async (req, res) => {
  try {
    const { codigo, armario, status } = req.body;

    if (!codigo || !armario) {
      return res.status(400).json({
        mensagem: "Informe o código da chave e o armário.",
      });
    }

    const codigoNormalizado = String(codigo).trim().toUpperCase();

    const armarioExistente = await Armario.findById(armario);

    if (!armarioExistente) {
      return res.status(404).json({
        mensagem: "Armário não encontrado.",
      });
    }

    const chaveExistente = await Chave.findOne({
      codigo: codigoNormalizado,
    });

    if (chaveExistente) {
      return res.status(409).json({
        mensagem: "Já existe uma chave com esse código.",
      });
    }

    const chaveDoArmario = await Chave.findOne({ armario });

    if (chaveDoArmario) {
      return res.status(409).json({
        mensagem: "Este armário já possui uma chave cadastrada.",
      });
    }

    const chave = await Chave.create({
      codigo: codigoNormalizado,
      armario,
      status: status || "disponivel",
    });

    return res.status(201).json({
      mensagem: "Chave cadastrada com sucesso!",
      chave,
    });
  } catch (error) {
    console.error("ERRO AO CADASTRAR CHAVE:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        mensagem: "Já existe uma chave com esse código.",
      });
    }

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
    console.error("ERRO AO LISTAR CHAVES:", error);

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
    console.error("ERRO AO BUSCAR CHAVE:", error);

    return res.status(500).json({
      mensagem: "Erro ao buscar chave.",
      erro: error.message,
    });
  }
};

// atualiza os dados de uma chave
const atualizarChave = async (req, res) => {
  try {
    const chave = await Chave.findById(req.params.id);

    if (!chave) {
      return res.status(404).json({
        mensagem: "Chave não encontrada.",
      });
    }

    const { codigo, armario, status } = req.body;

    // valida o novo codigo
    if (codigo !== undefined) {
      const codigoNormalizado = String(codigo).trim().toUpperCase();

      const outraChave = await Chave.findOne({
        codigo: codigoNormalizado,
        _id: { $ne: chave._id },
      });

      if (outraChave) {
        return res.status(409).json({
          mensagem: "Já existe uma chave com esse código.",
        });
      }

      chave.codigo = codigoNormalizado;
    }

    // valida o armario vinculado
    if (armario !== undefined) {
      const armarioExistente = await Armario.findById(armario);

      if (!armarioExistente) {
        return res.status(404).json({
          mensagem: "Armário não encontrado.",
        });
      }

      const outraChave = await Chave.findOne({
        armario,
        _id: { $ne: chave._id },
      });

      if (outraChave) {
        return res.status(409).json({
          mensagem: "Este armário já possui outra chave cadastrada.",
        });
      }

      chave.armario = armario;
    }

    if (status !== undefined) {
      chave.status = status;
    }

    await chave.save();

    await chave.populate("armario", "codigo tipo status");

    return res.status(200).json({
      mensagem: "Chave atualizada com sucesso!",
      chave,
    });
  } catch (error) {
    console.error("ERRO AO ATUALIZAR CHAVE:", error);

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
    const chave = await Chave.findById(req.params.id);

    if (!chave) {
      return res.status(404).json({
        mensagem: "Chave não encontrada.",
      });
    }

    if (chave.status !== "disponivel") {
      return res.status(409).json({
        mensagem: "Somente chaves disponíveis podem ser excluídas.",
      });
    }

    await Chave.findByIdAndDelete(chave._id);

    return res.status(200).json({
      mensagem: "Chave excluída com sucesso!",
    });
  } catch (error) {
    console.error("ERRO AO EXCLUIR CHAVE:", error);

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
