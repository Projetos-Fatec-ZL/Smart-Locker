
const mongoose = require("mongoose");

const funcionarioSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
    },

    cpf: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    setor: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["ativo", "inativo"],
      default: "ativo",
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

module.exports = mongoose.model("Funcionario", funcionarioSchema);
