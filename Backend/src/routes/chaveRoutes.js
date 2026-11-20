
const express = require("express");
const router = express.Router();

const {
  cadastrarChave,
  listarChaves,
  buscarChavePorId,
  atualizarChave,
  excluirChave,
} = require("../controllers/ChaveController");

// cadastra uma chave
router.post("/", cadastrarChave);

// lista as chaves
router.get("/", listarChaves);

// busca uma chave pelo id
router.get("/:id", buscarChavePorId);

// atualiza uma chave
router.put("/:id", atualizarChave);

// exclui uma chave
router.delete("/:id", excluirChave);

module.exports = router;
