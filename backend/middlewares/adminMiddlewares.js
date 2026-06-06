import { AdminError } from "../errors/AppError.js";
import jwt from "jsonwebtoken";

export async function isAdmin(req, res, next) {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      throw new AdminError({
        message: "Token ausente",
        status: 401,
        code: "UNAUTHORIZED",
      });
    }
    const requester = jwt.verify(
      req.cookies.accessToken,
      process.env.JWT_SECRET,
    );
    if (requester.power !== "admin") {
      throw new AdminError({
        message: "Acesso negado",
        status: 403,
        code: "FORBIDDEN",
      });
    }
    next();
  } catch (error) {
    next(error);
  }
}
