
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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

    senha: {
  type: String,
  required: true,
  select: false,

    },

   perfil: {
  type: String,
  enum: ["admin", "funcionario"],
  default: "funcionario",
  
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
funcionarioSchema.pre("save", async function () {
  if (!this.isModified("senha")) return;

  this.senha = await bcrypt.hash(this.senha, 10);
});
module.exports = mongoose.model("Funcionario", funcionarioSchema);
