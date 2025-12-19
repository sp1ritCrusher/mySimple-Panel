import jwt from "jsonwebtoken";
import { Blacklist } from "../models/Blacklist.js";
import { Log } from "../models/Logs.js"
import { v4 as uuidv4 } from "uuid";
import { getIp } from "../utils/utils.js";
import { User } from "../models/User.js";

/* Controle de Autenticação */

/*  Validação do refreshToken */

export async function checkRefresh(req, res) {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ message: "Refresh não encontrado" });
  }

    // Atribuindo novo accessToken pelo refresh
    try {
    const uuid = uuidv4();
    const refresh = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(refresh.id);
    const isvalidToken = await Blacklist.findOne({ userid: refresh.id });
    if(!isvalidToken) {
      await Log.create({ 
        type: "auth",
        actioner: `${user.name}`,
        target: `${user.name}`,
        action: `O usuário ${user.name} teve seu refresh Token revogado`,
        ip: getIp(req)
      });
      return res.status(403).json({ message: "Erro: Token revogado"}); 
      }
    const newaccessToken = jwt.sign(
      {
        name: user.name,
        id: user.id,
        email: user.email,
        power: user.power,
        session: uuid
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
    res.status(200).json({ message: "Novo accessToken bem-sucedido"});
    await Log.create({
        type: "auth",
        actioner: `${user.name}`,
        action: `O usuário ${user.name} gerou um novo access Token`,
        data: `Nova sessão: ${uuid}`,
        ip: getIp(req)
    });
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return res.status(403).json({ message: "Token invalido ou expirado" });
  }
}
