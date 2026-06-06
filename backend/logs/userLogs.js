import { CodeError, LogError, RegisterError } from "../errors/AppError.js";
import { getDifferences, validateUser, validateSession} from "../utils/utils.js";
import { LogDomains } from "../logs/logDomains.js";
import * as userRepository from "../repositories/userRepository.js";
import * as logRepository from "../repositories/logRepository.js";
import * as sessionRepository from "../repositories/sessionRepository.js";

export async function user_Session(userid, ip, session, provider, context) {
const user = await userRepository.findById(userid);
validateUser(user, LogError);
switch(context) {
case "logout": {
    return logRepository.createLog({
    type: "info",
    domain: LogDomains.AUTH,
    description: "user-logout",
    actioner: user.name,
    action: `Usuário ${user.name} realizou logout via ${provider}`,
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
    action: `Usuário ${user.name} realizou login ${provider}`,
    ip,
    session
    });
    break;
}
}

export async function user_oAuth_validation(userid, session, ip, provider) {

    const user = await userRepository.findById(userid);
    validateUser(user, RegisterError);
    return logRepository.createLog({
        type: "info",
        domain: "auth",
        description: "user-oauth-validation",
        actioner: user.name,
        action: `Iniciou sessão via provedor externo`,
        data: [`Provedor: ${provider}`],
        ip,
        session
  });
}

export async function user_Register(userid, ip) {
  const user = await userRepository.findById(userid);
  validateUser(user, RegisterError);
    return logRepository.createLog({
        type: "info",
        domain: "user",
        description: "user-register",
        actioner: user.name,
        action: "Realizou solicitação de cadastro",
        data: [`Nome: ${user.name}`, `E-mail: ${user.email}`, `Telefone: ${user.phone}`],
        ip,
        session: null
  });
}

export async function user_validateCode(userid, context, ip, session) {

  const user = await userRepository.findById(userid);
  validateUser(user, CodeError);
  const contextMessages = {
    forgot: "Código de recuperação de senha",
    register: "Código de registro",
    merge: "Código de mesclagem de provedores para autenticação"
  };
  const data = [contextMessages[context]];
  data.push(`Sessão atribuída: ${session}`);

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

export async function user_recoverPassword(userid, session, ip) {
  const user = await userRepository.findById(userid);
  validateUser(user, LogError);
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
}

export async function user_changePassword(userid, session, ip) {
  const user = await userRepository.findById(userid);
  validateUser(user, LogError);
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