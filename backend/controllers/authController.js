import jwt from "jsonwebtoken";
import { Blacklist } from "../models/Blacklist.js";

/* Controle de Autenticação */

/*  Validação do refreshToken */

export async function checkRefresh(req, res) {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ message: "Refresh não encontrado" });
  }

    // Atribuindo novo accessToken pelo refresh
    try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const isvalidToken = await Blacklist.findOne({ userid:decoded.id });
    if(!isvalidToken) { return res.status(403).json({ message: "Erro: Token revogado"}); }

    const newaccessToken = jwt.sign(
      {
        id: decoded.id,
        email: decoded.email,
        power: decoded.power
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.cookie("accessToken", newaccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
    });
    res.status(200).json({ message: "Novo acessToken bem-sucedido"});
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return res.status(403).json({ message: "Token invalido ou expirado" });
  }
}
