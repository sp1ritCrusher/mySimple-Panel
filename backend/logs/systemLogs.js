import { LogError } from "../errors/AppError.js";
import { LogDomains } from "../logs/logDomains.js";
import * as userRepository from "../repositories/userRepository.js";
import * as logRepository from "../repositories/logRepository.js";

export async function system_sentEmail(userid, response, ip) {
  const user = await userRepository.findById(userid);
  if(!user) {
  throw new LogError({ 
    message: `Usuário não encontrado`,
    status: 404,
    code: "NOT_FOUND" });
  }
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