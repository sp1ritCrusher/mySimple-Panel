import { LogError } from "../errors/AppError.js";
import { getDifferences } from "../utils/utils.js";
import { LogDomains } from "../logs/logDomains.js";
import * as userRepository from "../repositories/userRepository.js";
import * as logRepository from "../repositories/logRepository.js";

export async function product_Add(data, userid, session, ip) {
  console.log("DATA", data);
  const requester = await userRepository.findById(userid);
  if(!requester) {
  throw new LogError({ 
    message: `Requisidor nao encontrado`,
    status: 404,
    code: "NOT_FOUND" });
  }
  if(requester.power === "admin" && data.user_id !== requester.id) {
  const target = await userRepository.findById(data.user_id);
      if(!target) {
        throw new LogError({ 
        message: `Usuário não encontrado`,
        status: 404,
        code: "NOT_FOUND" });
      }
      return logRepository.createLog({
        type: "info",
        domain: LogDomains.ADMIN,
        description: "admin-add-product",
        actioner: requester.name,
        target: target.id,
        action: `Criou um novo produto para o usuário ${target.name}`,
        data: data,
        ip,
        session
  });
} else {
        return logRepository.createLog({
        type: "info",
        domain: LogDomains.PRODUCT,
        description: "user-add-product",
        actioner: requester.name,
        target: requester.id,
        action: "Criou um novo produto",
        data: data,
        ip,
        session
  });
}
}

export async function product_Edit(userid, data, newData, session, ip) {
  const requester = await userRepository.findById(userid);
  if(!requester) {
  throw new LogError({ 
    message: `Requisidor nao encontrado`,
    status: 404,
    code: "NOT_FOUND" });
  }
  const diff = getDifferences(data, newData);
  const setData = [];
    if(diff.name) {
    setData.push(`Mudou o nome de ${diff.name.current} para ${diff.name.new}`)
    }
    if(diff.description) {
    setData.push(`Mudou a descrição de ${diff.description.current} para ${diff.description.new}`)
    }
    if(diff.price) {
    setData.push(`Mudou o preço de ${diff.price.current} R$ para ${diff.price.new}`)
    }
    if(diff.ammount) {
    setData.push(`Mudou a quantidade de ${diff.ammount.current} para ${diff.ammount.new}`)
    }
  if(requester.power === "admin" && data.user_id !== requester.id) {
    const target = await userRepository.findById(data.user_id);
    if(!target) {
      throw new LogError({ 
        message: `Usuário não encontrado`,
        status: 404,
        code: "NOT_FOUND" });
      }
        return logRepository.createLog({
        type: "info",
        domain: LogDomains.PRODUCT,
        description: "admin-edit-product",
        actioner: requester.name,
        target: target.id,
        action: `Editou o produto de ID ${data.id} do usuário ${target.name}`,
        data: setData,
        ip,
        session
  });
} else {
        return logRepository.createLog({
        type: "info",
        domain: LogDomains.PRODUCT,
        description: "user-edit-product",
        actioner: requester.name,
        target: requester.id,
        action: `Editou um produto`,
        data: setData,
        ip,
        session
  });
}
}

export async function product_Delete(userid, product, session, ip) {
    const requester = await userRepository.findById(userid);
    if(!requester) {
      throw new LogError({ 
        message: `Requisidor nao encontrado`,
        status: 404,
        code: "NOT_FOUND" });
    }
    const deletedProduct = [`Nome: ${product.name}`, `ID: ${product.id}`]
    if(requester.power === "admin" && product.user_id !== requester.id) {
      const target = await userRepository.findById(product.user_id);
      if(!target) {
        throw new LogError({ 
          message: `Usuário não encontrado`,
          status: 404,
          code: "NOT_FOUND" });
        }
      return logRepository.createLog({
        type: "info",
        domain: LogDomains.ADMIN,
        description: "admin-delete-product",
        actioner: requester.name,
        target: target.id,
        action: `Deletou um produto do usuário ${target.name}`,
        data: deletedProduct,
        ip,
        session
    });
    }
      return logRepository.createLog({
        type: "info",
        domain: LogDomains.PRODUCT,
        description: "user-delete-product",
        actioner: requester.name,
        target: requester.id,
        action: `Deletou um produto`,
        data: deletedProduct,
        ip,
        session
      });   
}