import jwt from "jsonwebtoken";
import { Blacklist } from "../models/Blacklist.js";

export async function checkRefresh(req, res) {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ message: "Refresh não encontrado" });
  }

    try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const isvalidToken = await Blacklist.findOne({ userid:decoded.id });
    if(!isvalidToken) { res.status(403).json({ message: "Erro: Token revogado"}); }

    const newaccessToken = jwt.sign(
      {
        id: decoded.id,
        email: decoded.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "10s" }
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
