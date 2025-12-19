import { User } from "../models/User.js";
import { Blacklist } from "../models/Blacklist.js";
import { Log } from "../models/Logs.js"
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { getDifferences, getIp } from "../utils/utils.js";
/* Controles de usuário */

/* Autenticação - login */

export const loginUser = async (req, res) => {
  const uuid = uuidv4();
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  const token = req.cookies.accessToken;
  try {
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await Log.create({
        type: "auth",
        log: `Alguém digitou a senha errada para ${user.name}`,
        ip: getIp(req)
      })
      return res.status(401).json({ message: "Senha invalida" });
    }
    //valida e remove sessão dupla
    const alreadyLogged = await Blacklist.findOne({ userid: user._id });
    if (alreadyLogged) {
      await Blacklist.findOneAndDelete({ userid: user._id });
        await Log.create({
        type: "auth",
        log: `Sessão reiniciada para ${user.name}`,
        ip: getIp(req),
        session: uuid
      })
    }

    //atribuição de refresh/access tokens
    const accessToken = jwt.sign(
      {
        name: user.name,
        id: user._id,
        email: user.email,
        power: user.power,
        session: uuid
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    const refreshToken = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    //adiciona os dados na blacklist
    const salt = await bcrypt.genSalt(10);
    const addBlacklist = new Blacklist({
      userid: user._id,
      session: uuid,
    });
    await addBlacklist.save();

    //Atribuição de cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ message: "Login bem-sucedido", user});
    await Log.create({
        type: "auth",
        actioner: `${user.name}`,
        action: `O usuário ${user.name} realizou login`,
        data: `Sessão atribuída: ${uuid}`,
        ip: getIp(req)
    });
  } catch (error) {
    console.error("Erro ao logar:", error);
    res.status(500).json({ message: "Erro ao logar:", error });
  }
};

/* Registro de usuário */

export const registerUser = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const { name, password, email, phone } = req.body;
    const setObj = [];
    const hashedPass = await bcrypt.hash(password, salt);
    const existingUser = await User.findOne({ $or: [{ email }, { name }] });
    if (existingUser) {
      return res.status(400).json({ message: " Usuario ja cadastrado" });
    }
    const newUser = new User({ name, password: hashedPass, email, phone, power: "user", registeredProducts: 0});
    await newUser.save();
    setObj.push(
      `ID: ${newUser._id}`,
      `Nome: ${name}`,
      `Email: ${email}`,
      `Telefone: ${phone}`,
    )
    await Log.create({
        type: "user",
        actioner: `${name}`,
        data: setObj,
        action: `Usuário ${name} realizou cadastro`,
        ip: getIp(req)
    })
    res
      .status(201)
      .json({ message: "Usuario criado com sucesso", user: newUser });
  } catch (error) {
    console.error("Erro ao registrar:", error);
    res.status(500).json({ message: "Erro ao registrar:", error });
  }
};

/* Listagem de usuário */


export const getUser = async (req, res) => {
  //reutilização em rotas pra roles diferentes(user/admin)
  const id = req.params.id || req.user.id;
  try {
    const findUser = await User.findById(id).select("-password");
    if (!findUser) {
      return res.status(404).json({ message: "Usuario não encontrado" });
    }
    res.status(200).json({ message: "Usuário encontrado:", user: findUser });
  } catch (error) {
    console.error("Erro ao encontrar usuário", error);
    res.status(500).json({ message: "Erro ao encontrar usuário", error });
  }
};

/* Logout - encerramento de sessão */

export const logoutUser = async (req, res) => {
  try {
    //Identifica user pelo refresh e apaga os dados da blacklist
    const token = jwt.verify(req.cookies.accessToken, process.env.JWT_SECRET);
    const decoded = jwt.verify(req.cookies.refreshToken, process.env.JWT_REFRESH_SECRET);
    const deleteHashed = await Blacklist.findOneAndDelete({
      userid: decoded.id,
    });
    if (!deleteHashed) {
      res.status(401).json({ message: "Erro, refresh não encontrado" });
    }
    await Log.create({
        type: "auth",
        actioner: `${decoded.name}`,
        action: `O usuário ${decoded.name} realizou logout`,
        session: token.session,
        ip: getIp(req)
    })
    //remoção dos cookies
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
    console.log("Erro ao deslogar: ", error);
    res.status(500).json({ message: "Erro ao deslogar", error });
  }
};

/* Atualização de dados do usuário */

export const editData = async(req,res) => {
  try {
    const decoded = jwt.verify(req.cookies.accessToken,process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    const updateUser = await User.findByIdAndUpdate(user.id, req.body, {
      new: true,
    });
    const setObj = [];
    const diff = getDifferences(user,updateUser);
    if(diff.name) {
      setObj.push(`Mudou o nome de "${user.name}" para "${updateUser.name}"`)
    }
    if(diff.email) {
      setObj.push(`Mudou o email de "${user.email}" para "${updateUser.email}"`)
    }
    if(diff.phone) {
      setObj.push(`Mudou o telefone de "${user.phone}" para "${updateUser.phone}"`)
    }
    await Log.create({
        type: "user",
        actioner: `${user.name}`,
        action: `O usuário ${user.name} editou seus dados`,
        data: setObj,
        session: decoded.session,
        ip: getIp(req)
    })
    return res.status(200).json( { message: "Usuario atualizado com sucesso", data: updateUser });
  } catch(error) {
    return res.status(500).json({message: "Erro ao atualizar os dados"}, error);
  }
};