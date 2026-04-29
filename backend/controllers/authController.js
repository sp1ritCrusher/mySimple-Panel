import * as authServices from "../services/authServices.js";
import { AuthError, AppError } from "../errors/AppError.js";
import * as systemLog from "../logs/systemLogs.js";
import * as sessionRepository from "../repositories/sessionRepository.js";
import jwt from "jsonwebtoken";

/* Controle de Autenticação */

/*  Validação do refreshToken */

export async function checkRefresh(req, res) {
  const token = req.cookies.refreshToken;
  if (!token) {
      throw new AuthError({ 
      message: "Refresh não encontrado",
      status: 401,
      code: "UNAUTHORIZED" });
  }
  
    // Atribuindo novo accessToken pelo refresh
    try {
      const newaccessToken = await authServices.renew_accessToken(token);
      res.cookie("accessToken", newaccessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 1000,
      });
      return res.status(200).json({ message: "Novo accessToken bem-sucedido" });
    } catch (error) {
      console.error("Erro: ", error);
      //systemLog.error_log(error, getIp(req));
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
}
