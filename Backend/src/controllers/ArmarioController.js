
const Armario = require("../models/Armario");
const Funcionario = require("../models/Funcionario");
const Chave = require("../models/Chave");

// gera o codigo da chave a partir do codigo do armario
function gerarCodigoChave(codigo) {
  return `CH-${String(codigo).trim().toUpperCase()}`;
}

// cadastra um armario e sua chave automaticamente
const cadastrarArmario = async (req, res) => {
  let armarioCriado = null;

  try {
    const { codigo, tipo, status } = req.body;

    if (!codigo || !tipo) {
      return res.status(400).json({
        mensagem: "Informe o código e o tipo do armário.",
      });
    }

    const codigoNormalizado = String(codigo).trim().toUpperCase();
    const codigoChave = gerarCodigoChave(codigoNormalizado);

    const armarioExistente = await Armario.findOne({
      codigo: codigoNormalizado,
    });

    if (armarioExistente) {
      return res.status(409).json({
        mensagem: "Já existe um armário com esse código.",
      });
    }

    const chaveExistente = await Chave.findOne({
      codigo: codigoChave,
    });

    if (chaveExistente) {
      return res.status(409).json({
        mensagem: "Já existe uma chave com esse código.",
      });
    }

    armarioCriado = await Armario.create({
      codigo: codigoNormalizado,
      tipo,
      status: status || "livre",
    });

    const chave = await Chave.create({
      codigo: codigoChave,
      armario: armarioCriado._id,
      status: "disponivel",
    });

    return res.status(201).json({
      mensagem: "Armário e chave cadastrados com sucesso!",
      armario: armarioCriado,
      chave,
    });
  } catch (error) {
    console.error("ERRO AO CADASTRAR ARMÁRIO E CHAVE:", error);

    if (armarioCriado) {
      try {
        await Armario.findByIdAndDelete(armarioCriado._id);
      } catch (erroExclusao) {
        console.error("ERRO AO DESFAZER CADASTRO:", erroExclusao);
      }
    }

    if (error.code === 11000) {
      return res.status(409).json({
        mensagem: "Já existe um armário ou chave com esse código.",
      });
    }

    return res.status(500).json({
      mensagem: "Erro ao cadastrar armário e chave.",
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
    console.error("ERRO AO LISTAR ARMÁRIOS:", error);

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
    console.error("ERRO AO BUSCAR ARMÁRIO:", error);

    return res.status(500).json({
      mensagem: "Erro ao buscar armário.",
      erro: error.message,
    });
  }
};

// atualiza os dados do armario e sincroniza o codigo da chave
const atualizarArmario = async (req, res) => {
  try {
    const armario = await Armario.findById(req.params.id);

    if (!armario) {
      return res.status(404).json({
        mensagem: "Armário não encontrado.",
      });
    }

    const codigoAntigo = armario.codigo;
    const { codigo, tipo, status } = req.body;

    if (codigo !== undefined) {
      const codigoNormalizado = String(codigo).trim().toUpperCase();

      const outroArmario = await Armario.findOne({
        codigo: codigoNormalizado,
        _id: { $ne: armario._id },
      });

      if (outroArmario) {
        return res.status(409).json({
          mensagem: "Já existe um armário com esse código.",
        });
      }

      const chaveComNovoCodigo = await Chave.findOne({
        codigo: gerarCodigoChave(codigoNormalizado),
        armario: { $ne: armario._id },
      });

      if (chaveComNovoCodigo) {
        return res.status(409).json({
          mensagem: "Já existe uma chave com esse código.",
        });
      }

      armario.codigo = codigoNormalizado;
    }

    if (tipo !== undefined) armario.tipo = tipo;
    if (status !== undefined) armario.status = status;

    await armario.save();

    // sincroniza a chave vinculada ao armario
    if (codigo !== undefined && codigoAntigo !== armario.codigo) {
      const codigoChave = gerarCodigoChave(armario.codigo);

      const chave = await Chave.findOne({
        armario: armario._id,
      });

      if (chave) {
        chave.codigo = codigoChave;
        await chave.save();
      } else {
        await Chave.create({
          codigo: codigoChave,
          armario: armario._id,
          status: "disponivel",
        });
      }
    }

    return res.status(200).json({
      mensagem: "Armário atualizado com sucesso!",
      armario,
    });
  } catch (error) {
    console.error("ERRO AO ATUALIZAR ARMÁRIO:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        mensagem: "Já existe um armário ou chave com esse código.",
      });
    }

    return res.status(500).json({
      mensagem: "Erro ao atualizar armário.",
      erro: error.message,
    });
  }
};

// exclui um armario e sua chave, quando permitido
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

    if (funcionarioVinculado) {
      return res.status(409).json({
        mensagem: "Não é possível excluir um armário vinculado a um funcionário.",
      });
    }

    const chaveVinculada = await Chave.findOne({
      armario: armario._id,
    });

    if (
      armario.status !== "livre" ||
      (chaveVinculada && chaveVinculada.status !== "disponivel")
    ) {
      return res.status(409).json({
        mensagem: "Só é possível excluir armários livres e com chave disponível.",
      });
    }

    // exclui a chave antes do armario
    if (chaveVinculada) {
      await Chave.findByIdAndDelete(chaveVinculada._id);
    }

    await Armario.findByIdAndDelete(armario._id);

    return res.status(200).json({
      mensagem: "Armário e chave excluídos com sucesso!",
    });
  } catch (error) {
    console.error("ERRO AO EXCLUIR ARMÁRIO:", error);

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
