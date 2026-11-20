
const mongoose = require("mongoose");

const armarioSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    tipo: {
      type: String,
      required: true,
      enum: ["feminino", "masculino"],
    },

    status: {
      type: String,
      enum: ["livre", "ocupado", "manutencao"],
      default: "livre",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Armario", armarioSchema);
