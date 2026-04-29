import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { AuthError, RegisterError } from "../errors/AppError.js";
import * as authServices from "./authServices.js";
import * as userRepository from "../repositories/userRepository.js";
import * as sessionRepository from "../repositories/sessionRepository.js";
import * as codeRepository from "../repositories/codeRepository.js";

export async function createUser({ name, email, phone, password }) {
  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(password, salt);
  const existingUser = await userRepository.findOne({ $or: [{ email }, { name }] });
  if (existingUser) {
    throw new RegisterError({
      message: "Erro, usuário já cadastrado",
      status: 409,
      code: "USER_ALREADY_REGISTERED",
    });
  }
  const newUser = await userRepository.create({
    name,
    password_hash: hashedPass,
    email,
    phone,
    power: "user",
    registeredProducts: 0,
    status: "pending_email_verification",
  });
  return newUser;
}

export async function logoutUser(token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const session = await sessionRepository.findOne({ user_id: decoded.id });
  if (!session) {
    throw new AuthError({
      message: "Erro, sessão não encontrada",
      status: 404,
      code: "TOKEN_NOT_FOUND",
    });
  }
  await sessionRepository.remove({ user_id: decoded.id });
  return;
}

export async function updateUser(user, newData) {
  const updateUser = await userRepository.update(user, newData, {
    new: true,
  });
  return updateUser;
}

export async function loginUser(email, password) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new AuthError({
      message: "Usuário não encontrado",
      status: 401,
      code: "USER_NOT_FOUND",
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
  const auth = await authServices.authenticate(user.id);
  return auth;
}

export async function changePassword(userid, newPass) {
  const user = await userRepository.findById(userid);
  if(user.status === "pending_password_reset") {
    await userRepository.update(user.id, { status: "verified" });
  } else {
    await userRepository.update(user.id, { password_hash: newPass });
  }
  return user;
}

export async function forgotPass_process(user) {
  const nano = nanoid(6);
  const findCode = await codeRepository.findOne({ user_id: user.id });
    if (findCode) {
        await codeRepository.deleteOne(findCode.code);
    }
    const intentionToken = jwt.sign(
      {
        userid: user.id,
        context: "forgot",
      },
      process.env.CHANGE_PASSWORD_SECRET,
      { expiresIn: "15m" }
    );
    await codeRepository.create({ code: nano, user_id: user.id, context: "forgot" });
    return { intentionToken };
}
