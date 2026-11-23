
const autorizarPerfil = (...perfisPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        mensagem: "Usuário não autenticado.",
      });
    }

    if (!perfisPermitidos.includes(req.usuario.perfil)) {
      return res.status(403).json({
        mensagem: "Você não tem permissão para acessar este recurso.",
      });
    }

    next();
  };
};

module.exports = autorizarPerfil;
