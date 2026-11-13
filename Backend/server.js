const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/db");

// Carrega as variáveis do arquivo .env
dotenv.config();

// Conecta ao Banco de Dados
connectDB();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Rota de teste
app.get("/", (req, res) => {
  res.json({ message: "API do Smart Locker rodando com sucesso!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
