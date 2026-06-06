import * as authServices from "../services/authServices.js";
import { AuthError, AppError } from "../errors/AppError.js";
import * as systemLog from "../logs/systemLogs.js";
import * as sessionRepository from "../repositories/sessionRepository.js";
import { set_accessToken_cookie } from "../utils/utils.js";
import jwt from "jsonwebtoken";

/* Controle de Autenticação */

/*  Validação do refreshToken */

export async function renew_accessToken(req, res) {

    const provider = req.provider;
    const token = req.token;
    const newaccessToken = await authServices.renew_accessToken(token, provider);
    set_accessToken_cookie(res, newaccessToken);
    return res.status(200).json({ message: "Novo accessToken bem-sucedido" });
    
}
