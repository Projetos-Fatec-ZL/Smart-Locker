
const express = require("express");
const router = express.Router();

const {
  entrarNaMinhaLista,
  consultarMinhaLista,
  cancelarMinhaLista,
} = require("../controllers/ListaEsperaController");

const autenticar = require("../middlewares/authMiddleware");
const autorizarPerfil = require("../middlewares/perfilMiddleware");

// acesso exclusivo para funcionários autenticados
router.use(autenticar, autorizarPerfil("funcionario"));

router.post("/", entrarNaMinhaLista);
router.get("/", consultarMinhaLista);
router.patch("/:id/cancelar", cancelarMinhaLista);

module.exports = router;
