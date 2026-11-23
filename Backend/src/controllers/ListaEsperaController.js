
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

/* funcionario entra na propria lista de espera */
const entrarNaMinhaLista = async (req, res) => {
  try {
    const funcionarioId = req.usuario.id;

    const funcionario = await Funcionario.findOne({
      _id: funcionarioId,
      status: "ativo",
    });

    if (!funcionario) {
      return res.status(404).json({
        mensagem: "Funcionário não encontrado ou inativo.",
      });
    }

    const registroExistente = await ListaEspera.findOne({
      funcionario: funcionarioId,
      status: "aguardando",
    });

    if (registroExistente) {
      return res.status(409).json({
        mensagem: "Você já está na lista de espera.",
      });
    }

    const registro = await ListaEspera.create({
      funcionario: funcionarioId,
    });

    const registroCompleto = await ListaEspera.findById(registro._id)
      .populate("funcionario", "nome setor")
      .populate("armario", "codigo tipo status");

    return res.status(201).json({
      mensagem: "Você entrou na lista de espera!",
      registro: registroCompleto,
    });
  } catch (error) {
    return res.status(500).json({
      mensagem: "Erro ao entrar na lista de espera.",
    });
  }
};

/* funcionario consulta sua propria lista */
const consultarMinhaLista = async (req, res) => {
  try {
    const funcionarioId = req.usuario.id;

    const registros = await ListaEspera.find({
      funcionario: funcionarioId,
    })
      .populate("armario", "codigo tipo status")
      .sort({ createdAt: 1 });

    const fila = await ListaEspera.find({
      status: "aguardando",
    }).sort({ createdAt: 1, _id: 1 });

    const resultado = registros.map((registro) => {
      const posicao = fila.findIndex(
        (item) => item._id.toString() === registro._id.toString()
      );

      return {
        ...registro.toObject(),
        posicao: posicao === -1 ? null : posicao + 1,
      };
    });

    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(500).json({
      mensagem: "Erro ao consultar sua lista de espera.",
    });
  }
};

/* funcionario cancela sua propria solicitacao */
const cancelarMinhaLista = async (req, res) => {
  try {
    const registro = await ListaEspera.findOneAndUpdate(
      {
        _id: req.params.id,
        funcionario: req.usuario.id,
        status: "aguardando",
      },
      {
        status: "cancelada",
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!registro) {
      return res.status(404).json({
        mensagem: "Solicitação não encontrada ou não pode ser cancelada.",
      });
    }

    return res.status(200).json({
      mensagem: "Solicitação cancelada com sucesso!",
    });
  } catch (error) {
    return res.status(500).json({
      mensagem: "Erro ao cancelar solicitação.",
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
  entrarNaMinhaLista,
  consultarMinhaLista,
  cancelarMinhaLista,
};
