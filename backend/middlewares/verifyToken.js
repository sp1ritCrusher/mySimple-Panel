import jwt from "jsonwebtoken";

/* Verificação e proteção de rotas */

export const verifyToken = (req, res, next) => {
    const token = req.cookies.accessToken;
    const sessionId = req.cookies.sessionId;
    if(!token || !sessionId) {
        return res.status(401).json({ message: "Token não encontrado/sessao nao iniciada"});
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