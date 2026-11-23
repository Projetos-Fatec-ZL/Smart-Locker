
const express = require("express");
const router = express.Router();

const {
  consultarMeuPerfil,
} = require("../controllers/FuncionarioController");

const autenticar = require("../middlewares/authMiddleware");
const autorizarPerfil = require("../middlewares/perfilMiddleware");

// acesso exclusivo para funcionarios autenticados
router.use(autenticar, autorizarPerfil("funcionario"));

router.get("/", consultarMeuPerfil);

module.exports = router;
