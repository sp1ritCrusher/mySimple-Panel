import * as userLog from "../logs/userLogs.js"
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { getIp } from "../utils/utils.js";
import * as userService from "../services/userServices.js";
import * as userRepository from "../repositories/userRepository.js";
import * as codeRepository from "../repositories/codeRepository.js";
import { nanoid } from "nanoid";
import { UserError } from "../errors/AppError.js";
import * as systemLog from "../logs/systemLogs.js";
import { AppError } from "../errors/AppError.js";

/* Controles de usuário */

/* Autenticação - login */

export const loginUser = async (req, res) => {
  try {
    const login = await userService.loginUser(req.body.email, req.body.password);
    await userLog.user_Session(login.user, getIp(req), login.session, "login");
    res.cookie("accessToken", login.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
    });
    res.cookie("refreshToken", login.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ message: "Login bem-sucedido" });
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


/* Registro de usuário */

export const registerUser = async (req, res) => {
  try {
    const { name, password, email, phone } = req.body;
    const newUser = await userService.createUser({name, password, email, phone});
    await userLog.user_Register(newUser, getIp(req));
    const nano = nanoid(6);
    const context_Token = jwt.sign(
      {
        userid: newUser.id,
        context: "register"
      },
      process.env.CHANGE_PASSWORD_SECRET, { expiresIn: "15m" }
    );
    await codeRepository.create({
       user_id: newUser.id,
       code: nano,
       context: "register" });
      res.cookie("intentionToken", context_Token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
      path: "/",
    });
      //await mailService.sendEmail(newUser.email, "register");
      res.status(201).json({ message: "Solicitação de cadastro concluida com sucesso", user: newUser });
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

/* Listagem de usuário */

export const getUser = async (req, res) => {
  //reutilização em rotas pra roles diferentes(user/admin)
  const id = req.params.id || req.user.id;
  try {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new UserError({
        message: "Usuário não verificado",
        status: 401,
        code: "USER_NOT_VERIFIED",
      });
    }
    res.status(200).json({ message: "Usuário encontrado:", user: user });
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

/* Logout - encerramento de sessão */

export const logoutUser = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await userService.logoutUser(token);
    await userLog.user_Session(decoded, getIp(req), decoded.session, "logout");

    res.clearCookie("accessToken", {
      sameSite: "lax",
      secure: false,
    });
    res.clearCookie("refreshToken", {
      sameSite: "lax",
      secure: false,
    });

    res.status(200).json({ message: "Sucesso ao deslogar" });
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

/* Atualização de dados do usuário */

export const editData = async (req, res) => {
  try {
    const decoded = jwt.verify(req.cookies.accessToken, process.env.JWT_SECRET);
    const user = await userRepository.findById(decoded.id);
    const updateUser = await userService.updateUser(user.id, req.body);
    await userLog.user_editData(user, updateUser, getIp(req), decoded.session);
    return res.status(200).json({ message: "Usuario atualizado com sucesso", updateUser });
  } catch (error) {
    systemLog.error_log(error, getIp(req));
    console.error("Erro: ", error);
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

export const changePassword = async (req, res) => {
  try {
    //compara e valida currentPass, hasheia e atualiza newPass
    const token = jwt.verify(req.cookies.accessToken, process.env.JWT_SECRET);
    const user = await userRepository.findById(token.id);
    const salt = await bcrypt.genSalt(10);
    const newPass = await bcrypt.hash(req.body.newPass, salt);
    const checkPass = await bcrypt.compare(req.body.current, user.password_hash);
    if(user.status === "pending_password_reset") {
      await userLog.user_changePassword(user, token.session, getIp(req));
      await userService.changePassword(user.id, newPass);
      return res.status(200).json({message: `Nova senha definida para ${user.name}`})
    }
    if (!checkPass) {
       throw new UserError({
        message: "Senha Incorreta",
        status: 400,
        code: "BAD_REQUEST",
      });
    }
    await userService.changePassword(user.id, newPass);
    await userLog.user_changePassword(user, token.session, getIp(req));
    res.status(200).json({ message: "Senha alterada com sucesso" });
  } catch (error) {
    systemLog.error_log(error, getIp(req));
    console.error("Erro: ", error);
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

export const forgotPass = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await userRepository.findByEmail(email);
    const passForgot_request = await userService.forgotPass_process(user);
    //await mailService.sendEmail(user.email, "forgot");
    res.cookie("intentionToken", passForgot_request.intentionToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
      path: "/",
    });
    return res.status(200).json({ message: "Email enviado com sucesso" });
  } catch (error) {
    systemLog.error_log(error, getIp(req));
    console.error("Erro: ", error);
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
