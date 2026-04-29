import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { AuthError } from "../errors/AppError.js";
import * as userRepository from "../repositories/userRepository.js";
import * as sessionRepository from "../repositories/sessionRepository.js";

export async function authenticate(userid) {
  const uuid = uuidv4();
  const user = await userRepository.findById(userid);
  const alreadyAuth = await sessionRepository.findOne({ user_id: user.id });
  if (alreadyAuth) {
    const test = await sessionRepository.remove({ user_id: user.id });
    /*await Log.create({
        type: "auth",
        log: `Sessão reiniciada para ${user.name}`,
        ip: getIp(req),
        session: uuid,
      });*/
  }
  const accessToken = jwt.sign(
    {
      name: user.name,
      id: user.id,
      email: user.email,
      power: user.power,
      session: uuid,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  const refreshToken = jwt.sign(
    {
      id: user.id,
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  await sessionRepository.create({ user_id: user.id, token: accessToken, session_id: uuid })
  return { user, accessToken, refreshToken, session: uuid };
}

export async function renew_accessToken(token) {
  const uuid = uuidv4();
  const refresh = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await userRepository.findById(refresh.id);
  if (!refresh || !user) {
      throw new AuthError({ 
      message: "ERRO: Token/Usuário não encontrados",
      status: 401,
      code: "UNAUTHORIZED" });
  }
  const findSession = await sessionRepository.findOne({ user_id: refresh.id });
  const newaccessToken = jwt.sign(
    {
      name: user.name,
      id: user.id,
      email: user.email,
      power: user.power,
      session: uuid,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  if(findSession) {
    await sessionRepository.remove({ user_id: user.id });
    await sessionRepository.create({ user_id: user.id, token: newaccessToken, session_id: uuid });
  }
  return newaccessToken;
}
