
const express = require("express");
const router = express.Router();

const {
  listarAchadosDisponiveis,
} = require("../controllers/AchadoPerdidoController");

const autenticar = require("../middlewares/authMiddleware");
const autorizarPerfil = require("../middlewares/perfilMiddleware");

// acesso exclusivo para funcionarios autenticados
router.use(autenticar, autorizarPerfil("funcionario"));

router.get("/", listarAchadosDisponiveis);

module.exports = router;
