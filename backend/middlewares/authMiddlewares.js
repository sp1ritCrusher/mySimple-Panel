import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { setIntention_token } from "../utils/utils.js";
import * as sessionRepository from "../repositories/sessionRepository.js";
import * as userRepository from "../repositories/userRepository.js";
import * as codeRepository from "../repositories/codeRepository.js";
import { AuthError } from "../errors/AppError.js";

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      throw new AuthError({
        message: "Token inválido",
        status: 401,
        code: "UNAUTHORIZED",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const session = await sessionRepository.findOne({
      session_id: decoded.session,
    });
    if(!session) {
      throw new AuthError({
        message: "Sessão inválida",
        status: 401,
        code: "UNAUTHORIZED",
      });
    }
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

export async function checkRefresh(req, res, next) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      throw new AuthError({
        message: "Refresh Token não encontrado/inválido",
        status: 401,
        code: "UNAUTHORIZED",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    req.token = token;
    req.provider = decoded.provider;
    next();
  } catch (error) {
    next(error);
  }
}

export async function validateUser(req, res, next) {
try {
if(req.body.context === "local") {
const user = await userRepository.findOne({ email: req.body.email });
if (!user) {
      throw new AuthError({
        message: "Usuário não encontrado",
        status: 401,
        code: "USER_NOT_FOUND",
      });
  } 
  if(user.status === "pending_email_verification") {
    const nano = nanoid(6);
    const existingCode = await codeRepository.findOne({user_id: user.id});
    if(!existingCode) {
      await codeRepository.create({ user_id: user.id, code: nano, context: "register" }); 
      const intentionToken = jwt.sign(
      {
        userid: user.id,
        context: "register",
      },
     process.env.CHANGE_PASSWORD_SECRET,
      { expiresIn: "15m" });
    setIntention_token(res, intentionToken);
    }
  }
}
  next();
  } catch(error) {
    next(error);
  }
}

