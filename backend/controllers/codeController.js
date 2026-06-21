import { getIp, setAuthCookies, setIntention_token } from "../utils/utils.js";
import { AppError } from "../errors/AppError.js";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import * as userRepository from "../repositories/userRepository.js";
import * as authServices from "../services/authServices.js";
import * as codeServices from "../services/codeServices.js";
import * as userService from "../services/userServices.js";
import * as userLog from "../logs/userLogs.js";
import * as systemLog from "../logs/systemLogs.js";
import * as codeRepository from "../repositories/codeRepository.js";

export async function validateCode(req, res) {
  const decoded = req.decoded;
  const validateCode = await codeServices.validateCode(decoded.userid, decoded.context, req.body.code);
  const auth = await authServices.authenticate(decoded.userid, validateCode);
  await userLog.user_validateCode(decoded.userid, decoded.context, getIp(req), auth.session);
  setAuthCookies(res, auth);
  return res.status(200).json({ message: "Código validado com sucesso " });
}

export async function resendCode(req, res) {
    const decoded = req.decoded;
    const resendCode = await codeServices.setCode_byIntention(decoded.userid, decoded.context);
    setIntention_token(res, resendCode);
    await systemLog.system_resendCode(decoded.userid, decoded.context, getIp(req));
    return res.status(200).json({ message: "Código Reenviado com sucesso" });
  } 
