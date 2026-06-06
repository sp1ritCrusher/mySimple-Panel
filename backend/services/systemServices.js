import * as userRepository from "../repositories/userRepository.js";
import * as codeServices from "../services/codeServices.js";
import { SystemError } from "../errors/AppError.js";

const callbackHandlers = {
  USER_GOOGLE_REGISTERED: async (user) => {
    const setCode = await codeServices.setCode_byIntention(user.id, "merge");
    return { message: "Usuário registrado pelo Google", intentionToken: setCode };
  },
  USER_LOCAL_REGISTERED: async(user) => {
    const setCode = await codeServices.setCode_byIntention(user.id, "merge");
    return { message: "Usuário registrado localmente", intentionToken: setCode };
  },
  PROVIDER_NOT_VALIDATED: async(user) => {
    const setCode = await codeServices.setCode_byIntention(user.id, "validate_provider");
    return { message: "Provedor não validado", intentionToken: setCode };
  }
};

export async function get_callbackResponse(userid, code) {
  const user = await userRepository.findById(userid);
  if (!user) throw new SystemError({ message: "Usuário não encontrado", status: 404, code: "USER_NOT_FOUND" });

  const handler = callbackHandlers[code];
  if (!handler) throw new SystemError({ message: "Código inválido", status: 400, code: "INVALID_CODE" });

  return await handler(user);
}