
const express = require("express");
const router = express.Router();

const {
  login,
  primeiroAcesso,
  gerarCodigoRecuperacao,
  redefinirSenha,
} = require("../controllers/AuthController");

const autenticar = require("../middlewares/authMiddleware");
const autorizarPerfil = require("../middlewares/perfilMiddleware");

// login
router.post("/login", login);

// primeiro acesso
router.post("/primeiro-acesso", primeiroAcesso);

// funcionário redefine a própria senha com código
router.post("/redefinir-senha", redefinirSenha);

// administrador gera código para um funcionário
router.post(
  "/:id/gerar-codigo",
  autenticar,
  autorizarPerfil("admin"),
  gerarCodigoRecuperacao
);

module.exports = router;
