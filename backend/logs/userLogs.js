import { LogError } from "../errors/AppError.js";
import { getDifferences } from "../utils/utils.js";
import { LogDomains } from "../logs/logDomains.js";
import * as userRepository from "../repositories/userRepository.js";
import * as logRepository from "../repositories/logRepository.js";
import * as sessionRepository from "../repositories/sessionRepository.js";

export async function user_Session(user, ip, session, context) {
const findSession = await sessionRepository.findOne({ user_id: user.id });
if(!user) {
    throw new LogError({ 
      message: `Usuário não encontrado`,
      status: 404,
      code: "NOT_FOUND" });
}
switch(context) {
case "logout": {
    return logRepository.createLog({
    type: "info",
    domain: LogDomains.AUTH,
    description: "user-logout",
    actioner: user.name,
    target: user.id,
    action: `Usuário ${user.name} realizou logout`,
    data: [`Sessão: ${session}`],
    ip,
    session
    });
 break;
}
case "login":
   return logRepository.createLog({
    type: "info",
    domain: LogDomains.AUTH,
    description: "user-login",
    actioner: user.name,
    target: user.id,
    action: `Usuário ${user.name} realizou login`,
    data: [`Sessão atribuída: ${session}`],
    ip,
    session
    });
    break;
}
}

export async function user_Register(user, ip) {
  console.log(user);
  if(!user) {
    throw new LogError({ 
      message: `Usuário não encontrado`,
      status: 404,
      code: "NOT_FOUND" });
  }
    return logRepository.createLog({
        type: "info",
        domain: "user",
        description: "user-register",
        actioner: user.name,
        target: user.id,
        action: `Usuário ${user.name} realizou solicitação de cadastro`,
        data: [`Nome: ${user.name}`, `E-mail: ${user.email}`, `Telefone: ${user.phone}`],
        ip,
        session: null
  });
}

export async function user_validateCode(userid, context, ip, session) {
  const data = [];
  const user = await userRepository.findById(userid);
  if(!user || !context) {
    throw new LogError({ 
      message: `Usuário/contexto não encontrados`,
      status: 404,
      code: "NOT_FOUND" });
  }
  if(context === "forgot") {
  data.push("Mudança de senha");
  }
  else if(context === "register") {
  data.push("Validação de cadastro");
  }
      return logRepository.createLog({
        type: "info",
        domain: LogDomains.USER,
        description: "user-validation",
        actioner: user.name,
        target: user.id,
        action: `Usuário ${user.name} realizou validação de um código`,
        data: data,
        ip,
        session
  });
}

export async function user_resendCode(userid, context, ip) {
  const data = [];
  const user = await userRepository.findById(userid);
  if(!user || !context) {
    throw new LogError({ 
      message: `Usuário/contexto não encontrados`,
      status: 404,
      code: "NOT_FOUND" });
  }
  if(context === "forgot") {
  data.push("Mudança de senha");
  }
  else if(context === "register") {
  data.push("Validação de cadastro");
  }
      return logRepository.createLog({
        type: "info",
        domain: LogDomains.USER,
        description: "user-resend-code",
        actioner: user.name,
        target: user.id,
        action: `Usuário ${user.name} solicitou reenvio do código de verificação`,
        data: data,
        ip,
        session: null
  });
}

export async function user_editData(user, updatedUser, ip, session)  {
    if(!user) {
    throw new LogError({ 
      message: `Usuário não encontrados`,
      status: 404,
      code: "NOT_FOUND" });
    }
    const diff = getDifferences(user, updatedUser);
    const data = [];
    if (diff.name) {
      data.push(`Mudou o nome de "${user.name}" para "${updatedUser.name}"`);
    }
    if (diff.email) {
      data.push(
        `Mudou o email de "${user.email}" para "${updatedUser.email}"`
      );
    }
    if (diff.phone) {
      data.push(
        `Mudou o telefone de "${user.phone}" para "${updatedUser.phone}"`
      );
    }
    return logRepository.createLog({
        type: "info",
        domain: LogDomains.USER,
        description: "user-edit-data",
        actioner: user.name,
        target: user.id,
        action: `Usuário ${user.name} alterou seus dados`,
        data: data,
        ip,
        session
  });
}

export async function user_changePassword(user, session, ip) {
  if(!user) {
    throw new LogError({ 
      message: `Usuário não encontrados`,
      status: 404,
      code: "NOT_FOUND" });
  }
  if(user.status === "pending_password_reset") {
        return logRepository.createLog({
        type: "info",
        domain: LogDomains.USER,
        description: "user-forgotten-password",
        actioner: user.name,
        target: user.id,
        action: `Usuário ${user.name} esqueceu, e definiu uma nova senha`,
        ip,
        session
  });
  } else {
      return logRepository.createLog({
        type: "info",
        domain: LogDomains.USER,
        description: "user-change-password",
        actioner: user.name,
        target: user.id,
        action: `Usuário ${user.name} alterou sua senha`,
        data: null,
        ip,
        session
  });
}
}