import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
/* Verificação e proteção de rotas */

export const verifyToken = (req, res, next) => {
    const token = req.cookies.accessToken;
    if(!token) {
        return res.status(401).json({ message: "Token não encontrado"});
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Erro ao verificar token:", error)
        return res.status(403).json( { message: "Token invalido ou expirado"});
    }
}