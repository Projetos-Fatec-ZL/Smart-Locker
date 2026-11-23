
require("dotenv").config();

const mongoose = require("mongoose");
const Funcionario = require("../src/models/Funcionario");

const atualizarSenha = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const cpf = process.env.ADMIN_CPF.replace(/\D/g, "");
    const senha = process.env.ADMIN_SENHA;

    if (!senha || senha.length < 6) {
      throw new Error("Configure uma senha válida no .env.");
    }

    const admin = await Funcionario.findOne({
      cpf,
      perfil: "admin",
    });

    if (!admin) {
      throw new Error("Administrador não encontrado.");
    }

    admin.senha = senha;
    await admin.save();

    console.log("Senha administrativa atualizada com sucesso!");
  } catch (error) {
    console.error("Erro:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

atualizarSenha();
