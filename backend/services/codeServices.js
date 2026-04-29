import jwt from "jsonwebtoken";
import { CodeError } from "../errors/AppError.js";
import * as userRepository from "../repositories/userRepository.js";
import * as codeRepository from "../repositories/codeRepository.js";

export async function validateCode(token, code) {
    const getCode = await codeRepository.findOne({code: code});
    const decoded = jwt.verify(token, process.env.CHANGE_PASSWORD_SECRET);
    const user = await userRepository.findById(decoded.userid);
    if (!getCode) {
      throw new CodeError({ 
        message: "Código inválido/não encontrado",
        status: 404,
        code: "NOT_FOUND" });
    }
    if (getCode.user_id !== user.id) {
      throw new CodeError({ 
        message: "Código inválido/não encontrado",
        status: 404,
        code: "NOT_FOUND" });
    }
    if (decoded.context === "register") {
      await userRepository.update(user.id, { status: "verified" });
      await codeRepository.deleteOne({ user_id: getCode.user_id });
    } else if (decoded.context === "forgot") {
      await userRepository.update(user.id, { status: "pending_password_reset" });
      await codeRepository.deleteOne({ user_id: getCode.user_id });
    }
    return user;
}

