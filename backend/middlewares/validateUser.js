import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { AuthError } from "../errors/AppError.js"
import * as userRepository from "../repositories/userRepository.js";
import * as codeRepository from "../repositories/codeRepository.js";

export async function validateUser(req, res, next) {
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
      res.cookie("intentionToken", intentionToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 1000,
        path: "/",
      });
    }
  }
  next();
}
