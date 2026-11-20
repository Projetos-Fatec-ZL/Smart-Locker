
const AchadoPerdido = require("../models/AchadoPerdido");

// cadastra um objeto encontrado
const cadastrarAchado = async (req, res) => {
  try {
    const { codigo, objeto, descricao, local, data, status } = req.body;

    const achadoExistente = await AchadoPerdido.findOne({ codigo });

    if (achadoExistente) {
      return res.status(409).json({
        mensagem: "Já existe um objeto cadastrado com esse código.",
      });
    }

    const achado = await AchadoPerdido.create({
      codigo,
      objeto,
      descricao,
      local,
      data,
      status,
    });

    return res.status(201).json({
      mensagem: "Objeto cadastrado com sucesso!",
      achado,
    });
  } catch (error) {
    return res.status(500).json({
      mensagem: "Erro ao cadastrar objeto.",
      erro: error.message,
    });
  }
};

// lista os objetos encontrados
const listarAchados = async (req, res) => {
  try {
    const { codigo, objeto, local, status } = req.query;

    const filtros = {};

    if (codigo) {
      filtros.codigo = { $regex: codigo, $options: "i" };
    }

    if (objeto) {
      filtros.objeto = { $regex: objeto, $options: "i" };
    }

    if (local) {
      filtros.local = { $regex: local, $options: "i" };
    }

    if (status) filtros.status = status;

    const achados = await AchadoPerdido.find(filtros)
      .sort({ data: -1 });

    return res.status(200).json(achados);
  } catch (error) {
    return res.status(500).json({
      mensagem: "Erro ao listar objetos encontrados.",
      erro: error.message,
    });
  }
};

// busca um objeto pelo id
const buscarAchadoPorId = async (req, res) => {
  try {
    const achado = await AchadoPerdido.findById(req.params.id);

    if (!achado) {
      return res.status(404).json({
        mensagem: "Objeto não encontrado.",
      });
    }

    return res.status(200).json(achado);
  } catch (error) {
    return res.status(500).json({
      mensagem: "Erro ao buscar objeto.",
      erro: error.message,
    });
  }
};

// atualiza os dados de um objeto
const atualizarAchado = async (req, res) => {
  try {
    const { codigo, objeto, descricao, local, data, status } = req.body;

    const dadosAtualizados = {};

    if (codigo !== undefined) dadosAtualizados.codigo = codigo;
    if (objeto !== undefined) dadosAtualizados.objeto = objeto;
    if (descricao !== undefined) dadosAtualizados.descricao = descricao;
    if (local !== undefined) dadosAtualizados.local = local;
    if (data !== undefined) dadosAtualizados.data = data;
    if (status !== undefined) dadosAtualizados.status = status;

    const achado = await AchadoPerdido.findByIdAndUpdate(
      req.params.id,
      dadosAtualizados,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!achado) {
      return res.status(404).json({
        mensagem: "Objeto não encontrado.",
      });
    }

    return res.status(200).json({
      mensagem: "Objeto atualizado com sucesso!",
      achado,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        mensagem: "Já existe um objeto cadastrado com esse código.",
      });
    }

    return res.status(500).json({
      mensagem: "Erro ao atualizar objeto.",
      erro: error.message,
    });
  }
};

// exclui um objeto
const excluirAchado = async (req, res) => {
  try {
    const achado = await AchadoPerdido.findByIdAndDelete(req.params.id);

    if (!achado) {
      return res.status(404).json({
        mensagem: "Objeto não encontrado.",
      });
    }

    return res.status(200).json({
      mensagem: "Objeto excluído com sucesso!",
    });
  } catch (error) {
    return res.status(500).json({
      mensagem: "Erro ao excluir o objeto.",
      erro: error.message,
    });
  }
};

module.exports = {
  cadastrarAchado,
  listarAchados,
  buscarAchadoPorId,
  atualizarAchado,
  excluirAchado,
};
