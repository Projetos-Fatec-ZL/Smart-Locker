
const mongoose = require("mongoose");

const chaveSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    armario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Armario",
      required: true,
    },

    status: {
      type: String,
      enum: ["disponivel", "emprestada", "extraviada", "manutencao"],
      default: "disponivel",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Chave", chaveSchema);
