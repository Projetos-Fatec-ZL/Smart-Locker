
const express = require("express");
const router = express.Router();

const {
  cadastrarFuncionario,
  listarFuncionarios,
  buscarFuncionarioPorId,
  atualizarFuncionario,
  excluirFuncionario,
} = require("../controllers/FuncionarioController");

// cadastra um funcionario
router.post("/", cadastrarFuncionario);

// lista os funcionarios
router.get("/", listarFuncionarios);

// busca um funcionario pelo id
router.get("/:id", buscarFuncionarioPorId);

// atualiza um funcionario
router.put("/:id", atualizarFuncionario);

// exclui um funcionario
router.delete("/:id", excluirFuncionario);

module.exports = router;
