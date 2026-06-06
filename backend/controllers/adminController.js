import jwt from "jsonwebtoken";
import { getIp } from "../utils/utils.js"
import * as userRepository from "../repositories/userRepository.js";
import * as adminService from "../services/adminServices.js";
import * as adminLog from "../logs/adminLogs.js";
import * as systemLog from "../logs/systemLogs.js";
import * as sessionRepository from "../repositories/sessionRepository.js";
import { AdminError, AppError } from "../errors/AppError.js";

/* Rota admimistrativa */

/*  Indice de usuarios - listando TODOS  */

export const getUsers = async (req, res) => {
    const data = await userRepository.getUsers();
    res.status(200).json({ message: "Usuarios encontrados", user: data });
};

export const admin_getUser = async(req, res) => {
    const user = req.params.id;
    const data = await userRepository.findById(user);
    res.status(200).json({ message: "Usuarios encontrados", user: data });
}

/*  Edição de usuário  */

export const editUser = async (req, res) => {
    const requester = req.user;
    const target = await userRepository.findById(req.body.id);
    const updatedTarget = await adminService.editUser(req.body.id, { data: req.body });
    await adminLog.admin_editUser(target, req.body, requester.id, requester.session, getIp(req));
    res.status(200).json({ message: "Usuario Atualizado com sucesso", newData: updatedTarget });
};

/*  Remoção de usuário  */

export const removeUser = async (req,res) => {
      const requester = req.user;
      await adminLog.admin_removeUser(req.params.id, requester.id, requester.session, getIp(req));
      const removeUser = await adminService.removeUser(requester, req.params.id);
      res.status(200).json({message:"Usuario deletado com sucesso", removeUser}, );
    } 