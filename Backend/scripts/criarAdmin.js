
require("dotenv").config();

const mongoose = require("mongoose");
const Funcionario = require("../src/models/Funcionario");

const criarAdmin = async () => {
  try {
    const { MONGO_URI, ADMIN_NOME, ADMIN_CPF, ADMIN_SENHA, ADMIN_SETOR } =
      process.env;

    if (!MONGO_URI || !ADMIN_NOME || !ADMIN_CPF || !ADMIN_SENHA || !ADMIN_SETOR) {
      throw new Error("Configure os dados do administrador no .env.");
    }

    if (ADMIN_SENHA.length < 6) {
      throw new Error("A senha deve ter pelo menos 6 caracteres.");
    }

    const cpf = ADMIN_CPF.replace(/\D/g, "");

    if (cpf.length !== 11) {
      throw new Error("O CPF deve conter 11 números.");
    }

    await mongoose.connect(MONGO_URI);

    const existente = await Funcionario.findOne({ cpf });

    if (existente) {
      throw new Error("Já existe um funcionário com esse CPF. Escolha outro.");
    }

    const admin = new Funcionario({
      nome: ADMIN_NOME,
      cpf,
      senha: ADMIN_SENHA,
      setor: ADMIN_SETOR,
      status: "ativo",
      perfil: "admin",
    });

    await admin.save();

    console.log("Administrador criado com sucesso!");
    console.log("CPF:", cpf);
  } catch (error) {
    console.error("Erro:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

criarAdmin();
