
const express = require("express");
const router = express.Router();

const {
  cadastrarAchado,
  listarAchados,
  buscarAchadoPorId,
  atualizarAchado,
  excluirAchado,
} = require("../controllers/AchadoPerdidoController");

const autenticar = require("../middlewares/authMiddleware");
const autorizarPerfil = require("../middlewares/perfilMiddleware");

// protege todas as rotas para administradores
router.use(autenticar, autorizarPerfil("admin"));

// cadastra um objeto encontrado
router.post("/", cadastrarAchado);

// lista os objetos encontrados
router.get("/", listarAchados);

// busca um objeto pelo id
router.get("/:id", buscarAchadoPorId);

// atualiza um objeto
router.put("/:id", atualizarAchado);

// exclui um objeto
router.delete("/:id", excluirAchado);

module.exports = router;
