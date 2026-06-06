import jwt from "jsonwebtoken";
import redisClient from "../config/redis.js";
import { nanoid } from "nanoid";
import { CodeError } from "../errors/AppError.js";
import { validateUser, ensureCode } from "../utils/utils.js";
import * as userRepository from "../repositories/userRepository.js";
import * as codeRepository from "../repositories/codeRepository.js";
import * as authRepository from "../repositories/authRepository.js";


export async function generateCode(userid, context) {
    const nano = nanoid(6);
    return await codeRepository.create({
      user_id: userid,
      code: nano,
      context });
}

export async function validateCode(userid, context, code) {
    const codeRecord = await codeRepository.findOne({ code });
    const user = await userRepository.findById(userid);
    validateUser(user, CodeError);
    const currentProvider = await getCurrentProvider(user.id);
    ensureCode(codeRecord);
    if (codeRecord.user_id !== user.id) {
      throw new CodeError({ 
        message: "Código inválido/não encontrado",
        status: 404,
        code: "NOT_FOUND" });
    }
    switch(context) {
      case "validate_provider":
        const provider = await authRepository.findOne({ user_id: user.id });
        await authRepository.update(provider.id, { status: "active"});
        await codeRepository.deleteOne({ user_id: codeRecord.user_id });
        return currentProvider;
      case "register":
        await userRepository.update(user.id, { status: "verified" });
        await codeRepository.deleteOne({ user_id: codeRecord.user_id });
        return currentProvider;
      case "merge":
        await mergeProviders(user.id);
        await codeRepository.deleteOne({ user_id: codeRecord.user_id });
        return currentProvider;
      case "forgot":
        await userRepository.update(user.id, { status: "pending_password_reset" });
        await codeRepository.deleteOne({ user_id: codeRecord.user_id });
        return currentProvider;
      default:
        throw new CodeError({
          message: "Contexto inválido",
          status: 400,
          code: "INVALID_CONTEXT"
      });
    }
}

export async function resendCode(userid, context) {

   const user = await userRepository.findById(userid);
   validateUser(user, CodeError);
   await codeRepository.deleteOne({ user_id: user.id });
   return await setCode_byIntention(user.id, context);
}
export async function getCurrentProvider(userid) {
  const user = await userRepository.getProvider(userid);
  if(!user) {
    return "local";
  }
  if(user.provider === "google") {
    return "google";
  }
}

export async function mergeProviders(userid) {
  const user = await userRepository.findById(userid);
  validateUser(user, CodeError);
  const provider = await authRepository.findOne({ user_id: user.id });
  if(user.provider.includes("local") && !user.provider.includes("google")) {
    await userRepository.addProvider(userid, "google");
    await authRepository.update(provider.id, { status: "active"});
    return "google";
  }
  if(user.provider.includes("google") && !user.provider.includes("local")) {
    const password = await redisClient.get(`tempPass:${user.id}`);
    await userRepository.addProvider(userid, "local");
    await userRepository.update(userid, { password_hash: password })
    return "local";
  }
    if(user.provider.includes("google") && user.provider.includes("local")) {
    return null;
  }
  }

export async function setCode_byIntention(userid, context) {

  const user = await userRepository.findById(userid);
  validateUser(user, CodeError);
  const codeRecord = await codeRepository.findOne({ user_id: user.id });
  if (codeRecord) {
    await codeRepository.deleteOne({ code: codeRecord.code });
  }
  const intentionToken = jwt.sign(
    {
      userid: user.id,
      context
    },
    process.env.CHANGE_PASSWORD_SECRET,
    { expiresIn: "15m" },
  );
  await generateCode(user.id, context);
  return intentionToken;
}