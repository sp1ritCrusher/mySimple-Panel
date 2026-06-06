import * as userLog from "../logs/userLogs.js"
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { getIp, setAuthCookies, setIntention_token, clearAuth_Cookies, callGoogle_provider } from "../utils/utils.js";
import * as userService from "../services/userServices.js";
import * as userRepository from "../repositories/userRepository.js";
import * as codeRepository from "../repositories/codeRepository.js";
import * as codeServices from "../services/codeServices.js";
import { nanoid } from "nanoid";
import { UserError } from "../errors/AppError.js";
import * as systemLog from "../logs/systemLogs.js";
import { AppError } from "../errors/AppError.js";

/* Controles de usuário */

/* Autenticação - login */

export const loginUser = async (req, res) => {

      const login = await userService.local_loginUser({ email: req.body.email, password: req.body.password });
      console.log("LOGIN", login);
      await userLog.user_Session(login.user.id, getIp(req), login.session, "local", "login");
      setAuthCookies(res, login);
      return res.status(200).json({ message: "Login bem-sucedido" });

}

export async function oAuth_loginUser(req, res) {

    const provider = req.body.provider;
    const redirectUrl = await userService.authProvider_redirect(provider);
    return res.status(200).json({ context: provider, url: redirectUrl });

}


/* Registro de usuário */

export const registerUser = async (req, res) => {

    const { name, password, email, phone } = req.body;
    const newUser = await userService.createUser({ context: "local", name, password, email, phone});
    const setCode = await codeServices.setCode_byIntention(newUser.id, "register");
    await userLog.user_Register(newUser.id, getIp(req));
    await systemLog.systemCode_Request(newUser.id, "register", getIp(req));
    setIntention_token(res, setCode);
    //await mailService.sendEmail(newUser.email, "register");
    res.status(201).json({ message: "Solicitação de cadastro concluida com sucesso", user: newUser });
  } 

/* Listagem de usuário */

export const getUser = async (req, res) => {
  const user = req.user;
  const findUser = await userService.getUser_byId(user.id);
  res.status(200).json({ message: "Usuário encontrado:", user: findUser });
  }

/* Logout - encerramento de sessão */

export const logoutUser = async (req, res) => {
    const user = req.user;
    const logout = await userService.logoutUser(user.id);
    console.log("LOGOUT", logout);
    await userLog.user_Session(user.id, getIp(req), logout.session_id, logout.provider, "logout");
    clearAuth_Cookies(res);
    res.status(200).json({ message: "Sucesso ao deslogar" });
  } 

/* Atualização de dados do usuário */

export const editData = async (req, res) => {
    const user = req.user;
    const newData = req.body;
    const updateUser = await userService.updateUser(user.id, newData);
    await userLog.user_editData(user, updateUser.updatedData, getIp(req), updateUser.session);
    return res.status(200).json({ message: "Usuario atualizado com sucesso", data: updateUser.updatedData });
  } 

export const changePassword = async (req, res) => {
    const user = req.user;
    const currentPass = req.body.current;
    const newPass = req.body.newPass;
    const updatedPassword = await userService.changePassword(user.id, currentPass, newPass);
    await userLog.user_changePassword(user.id, updatedPassword, getIp(req));
    return res.status(200).json({ message: "Senha alterada com sucesso" });
  }

  export const resetPassword = async (req,res) => {

    const user =  req.user;
    const newPass = req.body.newPass;
    const resetPass = await userService.resetPassword(user.id, newPass);
    await userLog.user_recoverPassword(user.id, resetPass, getIp(req));
    return res.status(200).json({ message: "Senha alterada com sucesso"});

  }
