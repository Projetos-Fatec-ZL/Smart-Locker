
const mongoose = require("mongoose");

const achadoPerdidoSchema = new mongoose.Schema(
  {
    objeto: {
      type: String,
      required: true,
      trim: true,
    },

    codigo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    descricao: {
      type: String,
      required: true,
      trim: true,
    },

    local: {
      type: String,
      required: true,
      trim: true,
    },

    data: {
      type: Date,
      required: true,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["encontrado", "entregue"],
      default: "encontrado",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AchadoPerdido", achadoPerdidoSchema);
