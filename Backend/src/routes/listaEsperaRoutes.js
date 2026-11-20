
const express = require("express");
const router = express.Router();

const {
  cadastrarNaLista,
  listarListaEspera,
  buscarRegistroPorId,
  atualizarRegistro,
  excluirRegistro,
} = require("../controllers/ListaEsperaController");

// adiciona funcionario na lista de espera
router.post("/", cadastrarNaLista);

// lista os registros da fila
router.get("/", listarListaEspera);

// busca um registro pelo id
router.get("/:id", buscarRegistroPorId);

// atualiza um registro da fila
router.put("/:id", atualizarRegistro);

// remove um registro da fila
router.delete("/:id", excluirRegistro);

module.exports = router;
