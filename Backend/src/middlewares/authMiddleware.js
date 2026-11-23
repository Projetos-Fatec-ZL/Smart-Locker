const jwt = require("jsonwebtoken");

const autenticar = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        mensagem: "Token não informado.",
      });
    }

    const [, token] = authHeader.split(" ");

    if (!token) {
      return res.status(401).json({
        mensagem: "Token inválido.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.usuario = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      mensagem: "Token inválido ou expirado.",
    });
  }
};

module.exports = autenticar;