const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/db");

// importa as rotas do sistema
const funcionarioRoutes = require("./src/routes/funcionarioRoutes");
const armarioRoutes = require("./src/routes/armarioRoutes");
const chaveRoutes = require("./src/routes/chaveRoutes");
const listaEsperaRoutes = require("./src/routes/listaEsperaRoutes");
const achadoPerdidoRoutes = require("./src/routes/achadoPerdidoRoutes");

// Carrega as variáveis do arquivo .env
dotenv.config();

// Conecta ao Banco de Dados
connectDB();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());


// registra as rotas da api
app.use("/api/funcionarios", funcionarioRoutes);
app.use("/api/armarios", armarioRoutes);
app.use("/api/chaves", chaveRoutes);
app.use("/api/lista-espera", listaEsperaRoutes);
app.use("/api/achados-perdidos", achadoPerdidoRoutes);


// Rota de teste
app.get("/", (req, res) => {
  res.json({ message: "API do Smart Locker rodando com sucesso!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
