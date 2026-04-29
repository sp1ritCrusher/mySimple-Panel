import jwt from "jsonwebtoken";
import * as sessionRepository from "../repositories/sessionRepository.js";
/* Verificação e proteção de rotas */

export const verifyToken = async (req, res, next) => { 
    const token = req.cookies.accessToken;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const session = await sessionRepository.findOne({ session_id: decoded.session });
    if(!token || !session ) {
        return res.status(401).json({ message: "ERRO: Sessão/Token inválidos" });
    }
    try {
        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.status).json({
                code: error.code,
                message: error.message,
            });
    }
    return res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      message: "Erro interno no servidor",
    });
  }
};
