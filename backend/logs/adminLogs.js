import { LogDomains } from "../logs/logDomains.js";
import { LogError } from "../errors/AppError.js";
import { getDifferences } from "../utils/utils.js";
import * as userRepository from "../repositories/userRepository.js";
import * as logRepository from "../repositories/logRepository.js";

export async function admin_removeUser(target, admin, session, ip) {
  const getAdmin = await userRepository.findById(admin);
  const user = await userRepository.findById(target);
  if(!user) {
    throw new LogError({ 
      message: `Usuário não encontrados`,
      status: 404,
      code: "NOT_FOUND" });
  }
  return logRepository.createLog({
        type: "info",
        domain: LogDomains.ADMIN,
        description: "admin-remove-user",
        actioner: getAdmin.name,
        target: user.id,
        action: `Removeu o usuário ${user.name}`,
        data: null, 
        ip,
        session
  });
}

export async function admin_editUser(target, newData, admin, session, ip ) {
    const diff = getDifferences(target, newData);
    const getAdmin = await userRepository.findById(admin);
    if(!getAdmin) {
    throw new LogError({ 
      message: `Administrador inválido!`,
      status: 404,
      code: "NOT_FOUND" });
    }
    if(!target) {
    throw new LogError({ 
      message: `Usuário inválido`,
      status: 404,
      code: "NOT_FOUND" });
    }
    const data = [];
    if (diff.name) {
      data.push(`Mudou o nome de "${target.name}" para "${newData.name}"`);
    }
    if (diff.email) {
      data.push(
        `Mudou o email de "${target.email}" para "${newData.email}"`
      );
    }
    if (diff.phone) {
      data.push(
        `Mudou o telefone de "${target.phone}" para "${newData.phone}"`
      );
    }
    return logRepository.createLog({
        type: "info",
        domain: LogDomains.ADMIN,
        description: "admin-edit-user",
        actioner: getAdmin.name,
        target: target.id,
        action: `Alterou os dados de ${target.name}`,
        data: data,
        ip,
        session
  });
}