import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import redisClient from "../config/redis.js";
import { nanoid } from "nanoid";
import { AuthError, RegisterError, UserError } from "../errors/AppError.js";
import { oauthProviders } from "../config/providers.js";
import { validateSession, validateUser, getConflictingFields } from "../utils/utils.js";
import * as codeServices from "./codeServices.js";
import * as authServices from "./authServices.js";
import * as userRepository from "../repositories/userRepository.js";
import * as sessionRepository from "../repositories/sessionRepository.js";
import * as codeRepository from "../repositories/codeRepository.js";
import * as authRepository from "../repositories/authRepository.js";

export async function findUserByEmail(email) {

    const user = await userRepository.findByEmail(email);
    validateUser(user, UserError);
    return user;
}

export async function createUser({ context, name, email, phone, password, provider_sub }) {
  switch(context) {
    //LOCAL REGISTER
    case "local":
      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(password, salt);
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser && existingUser.provider.includes("google")) {
        await redisClient.set(`tempPass:${existingUser.id}`, hashedPass, { EX: 300 });
          throw new RegisterError({
            message: "Erro, usuário já cadastrado através do Google",
            status: 409,
            code: "USER_GOOGLE_REGISTERED",
            userid: existingUser.id
          });
    } 
    if (existingUser) {
        throw new RegisterError({
          message: "Erro, usuário já cadastrado",
          status: 409,
          code: "USER_ALREADY_REGISTERED",
          userid: existingUser.id
        });
      }
      const newUser = await userRepository.create({
        name,
        password_hash: hashedPass,
        email,
        phone,
        power: "user",
        status: "pending_email_verification",
        provider: JSON.stringify(["local"])
      });
    return newUser;
  // GOOGLE REGISTER
  case "google": 

    const googleUser = await userRepository.create({
      name,
      email,
      power: "user",
      status: "verified",
      provider: JSON.stringify(["google"])
    });
    await authRepository.create({
      user_id: googleUser.id,
      provider: "google",
      provider_sub,
      status: "active"
    });
    return googleUser;
  }
}

export async function logoutUser(userid) {
  const user = await userRepository.findById(userid);
  validateUser(user, UserError);
  const session = await sessionRepository.findOne({ user_id: user.id });
  validateSession(session);
  await sessionRepository.remove({ user_id: user.id });
  return { session_id: session.session_id, provider: session.provider };
}

export async function getUser_byId(userid) {
  const user = await userRepository.findById(userid);
  validateUser(user, UserError);
  return user;
}

export async function updateUser(userid, newData) {
  const user = await userRepository.findById(userid);
  validateUser(user, UserError);
  const session = await sessionRepository.findOne({ user_id: user.id });
  validateSession(session);
  const conflictingUsers = await userRepository.findConflicts({ email: newData.email, phone: newData.phone });
  const conflicts = getConflictingFields(conflictingUsers, userid, newData);
    if (conflicts.length) {
        throw new UserError({
            message: `Os seguintes campos já pertencem a outro usuário: ${conflicts.join(", ")}`,
            status: 409,
            code: "DATA_CONFLICT"
        });
    }  
  const updatedData = await userRepository.update(user.id, newData, { new: true, });
  return { updatedData, session: session.session_id };
}

export async function authProvider_redirect(provider) {
  const providerConfig = oauthProviders[provider];
  if (!providerConfig) throw new AuthError({ message: "Provider inválido", status: 404, code: "INVALID_PROVIDER" });
  const redirectUrl = providerConfig.authUrl + "?" + new URLSearchParams(providerConfig.params);
  console.log(redirectUrl);
  return redirectUrl;
}

export async function oAuth_loginUser({ provider, name, email, providerId }) {
  switch(provider) {
    case "google":
    const user = await userRepository.findByEmail(email);
      if(!user) {
        const newUser = await createUser({ context: "google", name, email, provider_sub: providerId });
        const auth = await authServices.authenticate(newUser.id, "google");
        return auth;
      }
    const userProvider = await authRepository.findOne({ user_id: user.id });
    if(user.provider.includes("local") && !user.provider.includes("google")) {
      if(!userProvider) {
      await authRepository.create({
      user_id: user.id,
      provider: "google",
      provider_sub: providerId,
      status: "pending_code_validation"
      });
      }
      throw new AuthError({
        message: "Esse usuário já está registrado localmente",
        status: 401,
        code: "USER_LOCAL_REGISTERED",
        userid: user.id
      });
    }
    if(userProvider.status === "pending_code_validation") {
      throw new AuthError({
        message: "Erro: provedor não validado",
        status: 401,
        code: "PROVIDER_NOT_VALIDATED",
        userid: user.id
      })
    }
    if(userProvider.status === "active" && userProvider.provider_sub === providerId) {
    const auth = await authServices.authenticate(user.id, "google");
    return auth;
    } else {
      throw new AuthError({
        message: "Credenciais inválidas",
        status: 405,
        code: "INVALID_CREDENTIALS",
        userid: user.id
      })
    }
  }
}

export async function local_loginUser({ email, password }) {
  const user = await userRepository.findByEmail(email);
  validateUser(user);
  if(!user.password_hash) {
      throw new AuthError({
      message: "ERRO: Senha Inválida",
      status: 401,
      code: "INVALID_PASSWORD",
    });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AuthError({
        message: "ERRO: Senha Inválida",
        status: 401,
        code: "INVALID_PASSWORD",
      });
    }
    if (user.status === "pending_email_verification") {
      throw new AuthError({
        message: "Usuário não verificado",
        status: 401,
        code: "USER_NOT_VERIFIED",
      });
    }
    const auth = await authServices.authenticate(user.id, "local");
    return auth;
  }

export async function changePassword(userid, currentPass, newPass) {
  const user = await userRepository.findById(userid);
  validateUser(user, UserError);
  const salt = await bcrypt.genSalt(10);
  const new_hashedPass = await bcrypt.hash(newPass, salt);
  const session = await sessionRepository.findOne({ user_id: user.id });
  validateSession(session);
  const checkPass = await bcrypt.compare(currentPass, user.password_hash);
  if (!checkPass) {
      throw new UserError({
        message: "Senha Incorreta",
        status: 401,
        code: "UNAUTHORIZED",
      });
  }
  await userRepository.update(user.id, { status: "verified", password_hash: new_hashedPass });
  return session.session_id;
}

export async function resetPassword(userid, newPass) {

  const user = await userRepository.findById(userid);
  validateUser(user, UserError);
  const session = await sessionRepository.findOne({ user_id: user.id });
  validateSession(session);
  const salt = await bcrypt.genSalt(10);
  const new_hashedPass = await bcrypt.hash(newPass, salt);
  if(user.status !== "pending_password_reset") {
    throw new UserError({
      message: "ERRO: Esse usuário não requere recuperação de senha",
      status: 401,
      code: "INVALID_REQUEST"
    })
  }
  await userRepository.update(user.id, {status: "verified", password_hash: new_hashedPass});
  return session.session_id;
}
