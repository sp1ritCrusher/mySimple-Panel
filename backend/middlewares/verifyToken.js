import jwt from "jsonwebtoken";
console.log("JWT_Secret VT loaded:", !!process.env.JWT_SECRET);
export const verifyToken = (req, res, next) => {
    const token = req.cookies.accessToken;
    if(!token) {
        return res.status(401).json({ message: "Token não encontrado"});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Erro ao verificar token:", error)
        return res.status(403).json( { message: "Token invalido ou expirado"});
    }
}