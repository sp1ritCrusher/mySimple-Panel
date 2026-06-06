import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { AuthError } from "../errors/AppError.js";
import { callGoogle_provider, validateUser } from "../utils/utils.js";
import * as userRepository from "../repositories/userRepository.js";
import * as sessionRepository from "../repositories/sessionRepository.js";
import * as authRepository from "../repositories/authRepository.js";
import * as userService from "../services/userServices.js";

export async function validateProvider_code(provider, code) {
  switch(provider) {
    case "google":
      const googleUser = await callGoogle_provider(code);

      if (googleUser.email_verified) {
        const auth = await userService.oAuth_loginUser({
          provider: "google",
          name: googleUser.name,
          email: googleUser.email,
          providerId: googleUser.sub
        });

        return { auth, provider: "google" };
      }

      throw new AuthError({
        message: "Email não verificado",
        status: 400,
        code: "EMAIL_NOT_VERIFIED"
      });
  }
}



export async function authenticate(userid, provider) {
  const uuid = uuidv4();
  const user = await userRepository.findById(userid);
  validateUser(user, AuthError);
  const alreadyAuth = await sessionRepository.findOne({ user_id: user.id });
  if (alreadyAuth) {
    await sessionRepository.remove({ user_id: user.id });
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
      provider
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  await sessionRepository.create({ user_id: user.id, provider, session_id: uuid })
  return { user, accessToken, refreshToken, session: uuid };
}

export async function renew_accessToken(token, provider) {
  const uuid = uuidv4();
  const refresh = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await userRepository.findById(refresh.id);
  validateUser(user, AuthError);
  const session = await sessionRepository.findOne({ user_id: refresh.id });
  const newAccessToken = jwt.sign(
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
    if(session) {
    await sessionRepository.remove({ user_id: user.id });
    await sessionRepository.create({ user_id: user.id, provider, session_id: uuid });
  }
  return newAccessToken;
}
