
require("dotenv").config();

const mongoose = require("mongoose");
const Armario = require("../src/models/Armario");
const Chave = require("../src/models/Chave");

async function sincronizarChaves() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI não configurada no .env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("Conectado ao MongoDB!");
    console.log("Iniciando sincronização...\n");

    const armarios = await Armario.find().sort({ codigo: 1 });

    let criadas = 0;
    let existentes = 0;
    let pendentes = 0;

    for (const armario of armarios) {
      const codigoArmario = String(armario.codigo || "")
        .trim()
        .toUpperCase();

      if (!codigoArmario) {
        console.log("Armário sem código. Verificar registro.");
        pendentes++;
        continue;
      }

      // verifica se o armario ja possui uma chave
      const chaveDoArmario = await Chave.findOne({
        armario: armario._id,
      });

      if (chaveDoArmario) {
        console.log(
          `${codigoArmario}: já possui a chave ${chaveDoArmario.codigo}.`
        );
        existentes++;
        continue;
      }

      // gera o codigo da chave
      const codigoChave = `CH-${codigoArmario}`;

      // evita criar uma chave com codigo duplicado
      const chaveComMesmoCodigo = await Chave.findOne({
        codigo: codigoChave,
      });

      if (chaveComMesmoCodigo) {
        console.log(
          `${codigoArmario}: código ${codigoChave} já pertence a outro registro. Verificar manualmente.`
        );
        pendentes++;
        continue;
      }

      // cria a chave que esta faltando
      await Chave.create({
        codigo: codigoChave,
        armario: armario._id,
        status: "disponivel",
      });

      console.log(`${codigoArmario}: chave ${codigoChave} criada!`);
      criadas++;
    }

    console.log("\n===== RESULTADO DA SINCRONIZAÇÃO =====");
    console.log(`Armários encontrados: ${armarios.length}`);
    console.log(`Chaves criadas: ${criadas}`);
    console.log(`Chaves que já existiam: ${existentes}`);
    console.log(`Pendências para verificar: ${pendentes}`);
    console.log("======================================");
  } catch (error) {
    console.error("ERRO NA SINCRONIZAÇÃO:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Conexão com MongoDB encerrada.");
  }
}

sincronizarChaves();
