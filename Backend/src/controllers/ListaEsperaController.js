
const ListaEspera = require("../models/ListaEspera");
const Funcionario = require("../models/Funcionario");
const Armario = require("../models/Armario");

// cadastra um funcionario na lista de espera
const cadastrarNaLista = async (req, res) => {
  try {
    const { funcionario } = req.body;

    const funcionarioExistente = await Funcionario.findById(funcionario);

    if (!funcionarioExistente) {
      return res.status(404).json({
        mensagem: "Funcionário não encontrado.",
      });
    }

    const registro = await ListaEspera.create({
      funcionario,
    });

    const lista = await ListaEspera.findById(registro._id)
      .populate("funcionario", "nome cpf setor")
      .populate("armario", "codigo tipo status");

    return res.status(201).json({
      mensagem: "Funcionário adicionado à lista de espera!",
      registro: lista,
    });
  } catch (error) {
    return res.status(500).json({
      mensagem: "Erro ao adicionar funcionário à lista de espera.",
      erro: error.message,
    });
  }
};

// lista os registros da lista de espera
const listarListaEspera = async (req, res) => {
  try {
    const { status, funcionario } = req.query;

    const filtros = {};

    if (status) filtros.status = status;
    if (funcionario) filtros.funcionario = funcionario;

    const lista = await ListaEspera.find(filtros)
      .populate("funcionario", "nome cpf setor")
      .populate("armario", "codigo tipo status")
      .sort({ createdAt: 1 });

    return res.status(200).json(lista);
  } catch (error) {
    return res.status(500).json({
      mensagem: "Erro ao listar a lista de espera.",
      erro: error.message,
    });
  }
};

// busca um registro pelo id
const buscarRegistroPorId = async (req, res) => {
  try {
    const registro = await ListaEspera.findById(req.params.id)
      .populate("funcionario", "nome cpf setor")
      .populate("armario", "codigo tipo status");

    if (!registro) {
      return res.status(404).json({
        mensagem: "Registro da lista de espera não encontrado.",
      });
    }

    return res.status(200).json(registro);
  } catch (error) {
    return res.status(500).json({
      mensagem: "Erro ao buscar registro da lista de espera.",
      erro: error.message,
    });
  }
};

// atualiza um registro da lista de espera
const atualizarRegistro = async (req, res) => {
  try {
    const { funcionario, status, armario } = req.body;

    const dadosAtualizados = {};

    if (funcionario !== undefined) {
      const funcionarioExistente = await Funcionario.findById(funcionario);

      if (!funcionarioExistente) {
        return res.status(404).json({
          mensagem: "Funcionário não encontrado.",
        });
      }

      dadosAtualizados.funcionario = funcionario;
    }

    if (status !== undefined) {
      dadosAtualizados.status = status;
    }

    if (armario !== undefined) {
      if (armario !== null) {
        const armarioExistente = await Armario.findById(armario);

        if (!armarioExistente) {
          return res.status(404).json({
            mensagem: "Armário não encontrado.",
          });
        }
      }

      dadosAtualizados.armario = armario;
    }

    const registro = await ListaEspera.findByIdAndUpdate(
      req.params.id,
      dadosAtualizados,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("funcionario", "nome cpf setor")
      .populate("armario", "codigo tipo status");

    if (!registro) {
      return res.status(404).json({
        mensagem: "Registro da lista de espera não encontrado.",
      });
    }

    return res.status(200).json({
      mensagem: "Registro da lista de espera atualizado com sucesso!",
      registro,
    });
  } catch (error) {
    return res.status(500).json({
      mensagem: "Erro ao atualizar registro da lista de espera.",
      erro: error.message,
    });
  }
};

// remove um registro da lista de espera
const excluirRegistro = async (req, res) => {
  try {
    const registro = await ListaEspera.findByIdAndDelete(req.params.id);

    if (!registro) {
      return res.status(404).json({
        mensagem: "Registro da lista de espera não encontrado.",
      });
    }

    return res.status(200).json({
      mensagem: "Registro removido da lista de espera com sucesso!",
    });
  } catch (error) {
    return res.status(500).json({
      mensagem: "Erro ao remover registro da lista de espera.",
      erro: error.message,
    });
  }
};

module.exports = {
  cadastrarNaLista,
  listarListaEspera,
  buscarRegistroPorId,
  atualizarRegistro,
  excluirRegistro,
};
