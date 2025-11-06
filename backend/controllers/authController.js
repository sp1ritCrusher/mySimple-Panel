import jwt from "jsonwebtoken";

export async function checkRefresh(req, res) {
  const token = req.cookies.refreshToken;
  console.log("Token bruto:", token);
  console.log("JWT_REFRESH_SECRET:", process.env.JWT_REFRESH_SECRET);
  if (!token) {
    return res.status(401).json({ message: "Refresh não encontrado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    console.log("Decoded:", decoded);
    const newaccessToken = jwt.sign(
      {
        id: decoded.id,
        email: decoded.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "10s" }
    );
    console.log("Novo token", newaccessToken);
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
