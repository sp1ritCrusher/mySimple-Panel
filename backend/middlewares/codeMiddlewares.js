import { CodeError } from "../errors/AppError.js";
import jwt from "jsonwebtoken";

export async function validateIntention(req, res, next) {
  try {
    if (!req.cookies.intentionToken) {
      throw new CodeError({
        message: "ERRO: Token de intenção inválido",
        status: 401,
        code: "UNAUTHORIZED"
      });
    }
    const decoded = jwt.verify(req.cookies.intentionToken, process.env.CHANGE_PASSWORD_SECRET);
    req.decoded = decoded;
    next();
  } catch (error) {
    next(error)
  }
}
