import { getIp } from "../utils/utils.js";
import { AppError } from "../errors/AppError.js";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import * as userRepository from "../repositories/userRepository.js";
import * as authServices from "../services/authServices.js";
import * as codeServices from "../services/codeServices.js";
import * as userService from "../services/userServices.js";
import * as mailService from "../services/mailServices.js";
import * as userLog from "../logs/userLogs.js";
import * as systemLog from "../logs/systemLogs.js";
import * as codeRepository from "../repositories/codeRepository.js";

export async function validateCode(req, res) {
  try {
    if(!req.cookies.intentionToken) {
          return res.status(403).json({ message: "Erro, sessão expirada" });
    }
    const decoded = jwt.verify(req.cookies.intentionToken, process.env.CHANGE_PASSWORD_SECRET);
    const validateCode = await codeServices.validateCode(req.cookies.intentionToken, req.body.code);
    const auth = await authServices.authenticate(validateCode.id);
    await userLog.user_validateCode(decoded.userid, decoded.context, getIp(req), auth.session);
    res.cookie("accessToken", auth.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
    });
    res.cookie("refreshToken", auth.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ message: "Codigo verificado com sucesso" });
    } catch (error) {
      systemLog.error_log(error, getIp(req));
      console.error("Erro: ", error);
      if (error instanceof AppError) {
        return res.status(error.status).json({
          code: error.code,
          message: error.message 
        }); 
      } 
      return res.status(500).json({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro interno no servidor" 
      });
  }
}

export async function resendCode(req, res) {
  try {
  const token = req.cookies.intentionToken;
  if(!token) {
    throw new AppError({ 
      message: "Sessão expirada",
      status: 401,
      code: "UNAUTHORIZED" });
  }
  const nano = nanoid(6);
  const decoded = jwt.verify(token, process.env.CHANGE_PASSWORD_SECRET);
  const user = await userRepository.findById(decoded.userid);
  await codeRepository.deleteOne({ user_id: decoded.userid });
  if(decoded.context === "forgot") {
    const passForgot_request = await userService.forgotPass_process(user);
    //email_response = await mailService.sendEmail(user.email, "forgot");
      res.cookie("intentionToken", passForgot_request.intentionToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
      path: "/",
    });
  } else if(decoded.context === "register") {
    await codeRepository.create({ user_id: user.id, code: nano, context: "register" });
    //email_response = await mailService.sendEmail(user.email, "register");
  }
  //await systemLog.system_sentEmail(decoded.userid, email_response, getIp(req));
  await userLog.user_resendCode(decoded.userid, decoded.context, getIp(req));
  return res.status(200).json({message: "Código Reenviado com sucesso"});
} catch(error) {
      systemLog.error_log(error, getIp(req));
      console.error("Erro: ", error);
      if (error instanceof AppError) {
        return res.status(error.status).json({
          code: error.code,
          message: error.message 
        }); 
      } 
      return res.status(500).json({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro interno no servidor" 
      });
}
};