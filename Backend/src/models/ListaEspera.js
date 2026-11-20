
const mongoose = require("mongoose");

const listaEsperaSchema = new mongoose.Schema(
  {
    funcionario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Funcionario",
      required: true,
    },

    status: {
      type: String,
      enum: ["aguardando", "atendida", "cancelada"],
      default: "aguardando",
    },

    armario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Armario",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ListaEspera", listaEsperaSchema);
