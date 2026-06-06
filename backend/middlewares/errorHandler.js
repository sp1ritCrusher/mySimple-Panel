import { AppError, RegisterError } from "../errors/AppError.js";

export function errorHandler(err, req, res, next) {
  console.error("Erro capturado:", err);

  if (err instanceof RegisterError) {
    return res.status(err.status).json({
      code: err.code,
      message: err.message,
      userid: err.userid
    });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({
      code: err.code,
      message: err.message,
    });
  }


  res.status(500).json({
    code: "INTERNAL_SERVER_ERROR",
    message: "Erro interno no servidor",
  });
}