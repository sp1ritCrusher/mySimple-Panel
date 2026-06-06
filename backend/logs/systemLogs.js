import { LogError, SystemError } from "../errors/AppError.js";
import { LogDomains } from "../logs/logDomains.js";
import { validateUser } from "../utils/utils.js";
import * as userRepository from "../repositories/userRepository.js";
import * as logRepository from "../repositories/logRepository.js";

export async function systemCode_Request(userid, context, ip) {
  const user = await userRepository.findById(userid);
  validateUser(user, LogError);

  const contextMessages = {
  forgot: "Código de recuperação de senha",
  register: "Código de registro",
  merge: "Código de mesclagem de provedores para autenticação"
  };
  const data = [contextMessages[context]];

  return logRepository.createLog({
      type: "info",
      domain: LogDomains.SYSTEM,
      description: "sent-code",
      actioner: user.name,
      action: `O sistema gerou um código de verificação para o usuário ${user.name}`,
      data: data,
      ip,
  });
}

export async function system_resendCode(userid, context, ip) {
  
  const user = await userRepository.findById(userid);
  validateUser(user, LogError);

  const contextMessages = {
    forgot: "Código de recuperação de senha",
    register: "Código de registro",
    merge: "Código de mesclagem de provedores para autenticação"
  };
  const data = [contextMessages[context]];
  
      return logRepository.createLog({
        type: "info",
        domain: LogDomains.SYSTEM,
        description: "resend-code",
        actioner: user.name,
        action: `O sistema reenviou um código de verificação para o usuário ${user.name}`,
        data: data,
        ip,
  });
}

export async function system_sentEmail(userid, response, ip) {
  const user = await userRepository.findById(userid);
  validateUser(user, LogError);
  const data = [];
  if(response.success === true) {
    data.push("E-mail enviado com sucesso");
  } else if(response.success === false){
    data.push("Falha ao enviar email");
  }
      return logRepository.createLog({
        type: "info",
        domain: LogDomains.SYSTEM,
        description: "sent-email",
        actioner: user.name,
        action: `O servidor solicitou um envio de email para ${user.name}`,
        data: data,
        ip,
  });
}

export async function error_log(error, ip) {
  await logRepository.createLog({
    type: "error",
    domain: LogDomains.SYSTEM,
    description: "unexpected-error",
    actioner: "system",
    action: error.message,
    data: [error.stack || "No stack trace available"],
    ip
  });
}