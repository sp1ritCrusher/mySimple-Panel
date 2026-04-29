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
  try {
    const requester = jwt.verify(req.cookies.accessToken,process.env.JWT_SECRET);
    if(requester.power !== "admin") {
      throw new AdminError ({
        message: "Acesso negado",
        status: 403,
        code: "FORBIDDEN"
      });
    }
    const data = await userRepository.getUsers();
    if (!data) {
      return res.status(404).json({ message: "Nenhum usuario encontrado" });
    }
    res.status(200).json({ message: "Usuarios encontrados", user: data });
    } catch (error) {
      console.error("Erro: ", error);
      systemLog.error_log(error, getIp(req));
      if (error instanceof AppError) {
        return res.status(error.status).json({
          code: error.code,
          message: error.message 
        }); 
    } 
    return res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      message: "Erro interno no servidor" 
    });
    }
};




/*  Edição de usuário  */

export const editUser = async (req, res) => {
  try {
    const target = await userRepository.findById(req.body.id);
    const requester = jwt.verify(req.cookies.accessToken, process.env.JWT_SECRET);
    const findSession = await sessionRepository.findOne({ user_id: requester.id });
    if (requester.power !== "admin") {
      throw new AdminError({ 
        message: "Acesso negado",
        status: 403,
        code: "FORBIDDEN" });
      }
    const updatedTarget = await adminService.editUser(req.body.id, {
      data: req.body,
    });
    await adminLog.admin_editUser(target, req.body, requester.id, requester.session, getIp(req));
    res.status(200).json({
        message: "Usuario Atualizado com sucesso",
        newData: updatedTarget,
      });
  } catch (error) {
    console.error("Erro: ", error);
    systemLog.error_log(error, getIp(req));
    if (error instanceof AppError) {
      return res.status(error.status).json({
        code: error.code,
        message: error.message,
      });
    }
    return res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      message: "Erro interno no servidor",
    });
  }
};

/*  Remoção de usuário  */

export const removeUser = async (req,res) => {
  //validando a identidade do requisidor
    const requester = jwt.verify(req.cookies.accessToken,process.env.JWT_SECRET);
    console.log(requester);
    if(requester.power !== "admin") {
      throw new AdminError({ 
        message: "Acesso negado",
        status: 403,
        code: "FORBIDDEN" });
      }
    try{ 
      console.log("PARAMS", req.params.id);
      await adminLog.admin_removeUser(req.params.id, requester.id, requester.session, getIp(req));
      const removeUser = await adminService.removeUser(requester, req.params.id);
      res.status(200).json({message:"Usuario deletado com sucesso", removeUser}, );
    } catch(error) {
      console.error("Erro: ", error);
      systemLog.error_log(error, getIp(req));
      if (error instanceof AppError) {
        return res.status(error.status).json({
          code: error.code,
          message: error.message,
        });
      }
      return res.status(500).json({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro interno no servidor",
      });
    }
}