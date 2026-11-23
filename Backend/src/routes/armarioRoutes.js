
const express = require("express");
const router = express.Router();

const {
  cadastrarArmario,
  listarArmarios,
  buscarArmarioPorId,
  atualizarArmario,
  excluirArmario,
} = require("../controllers/ArmarioController");

const autenticar = require("../middlewares/authMiddleware");
const autorizarPerfil = require("../middlewares/perfilMiddleware");

// protege todas as rotas para administradores
router.use(autenticar, autorizarPerfil("admin"));

// cadastra um armario
router.post("/", cadastrarArmario);

// lista os armarios
router.get("/", listarArmarios);

// busca um armario pelo id
router.get("/:id", buscarArmarioPorId);

// atualiza um armario
router.put("/:id", atualizarArmario);

// exclui um armario
router.delete("/:id", excluirArmario);

module.exports = router;
