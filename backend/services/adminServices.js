import { AdminError } from "../errors/AppError.js";
import * as userRepository from "../repositories/userRepository.js";

export async function editUser(userid, { data }) {
    const user = await userRepository.findById(userid);
    const existingEmail = await userRepository.findOne({ $or: [{ email: data.email }, { name: user.name }, { phone: user.phone }] });
    if (existingEmail && user.email !== data.email) {
      throw new AdminError({ 
        message: "Esse email já pertence a outro usuário",
        status: 409,
        code: "EMAIL_ALREADY_EXISTS" });
    }
    const updateuser = await userRepository.update(userid, data, {
      new: true,
    });

    if (!updateuser) {
        throw new AdminError({ 
        message: "Usuário não encontrado",
        status: 404,
        code: "NOT_FOUND" });
    }
    return updateuser;
  }

export async function removeUser(requester, userid) {
    const user = await userRepository.findById(userid);
    if(!user) {
        throw new AdminError({ 
        message: "Usuário não encontrado",
        status: 404,
        code: "NOT_FOUND" });
    }
    if (user.id == requester.id) {
        throw new AdminError({ 
        message: "Você não pode apagar a si mesmo",
        status: 400,
        code: "BAD_REQUEST" });
    }
    const removeUser = await userRepository.deletebyId(userid);
    if (!removeUser) {
        throw new AdminError({ 
        message: "Erro ao deletar usuário",
        status: 400,
        code: "BAD_REQUEST" });
    }
    return removeUser;
}
