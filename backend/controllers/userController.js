import { User } from "../models/User.js";
import { Blacklist } from "../models/Blacklist.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
/* Controles de usuário */


/* Autenticação - login */

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  try {
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Senha invalida" });
    }
    //valida e remove sessão dupla
    const alreadyLogged = await Blacklist.findOne({ userid: user._id });
    if (alreadyLogged) {
      await Blacklist.findOneAndDelete({ userid: user._id });
      res.clearCookie("sessionId", {
        sameSite: "lax",
        secure: false,
      });
    }

    //atribuição de refresh/access tokens
    const accessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        power: user.power
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    const refreshToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        power: user.power
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    //adiciona os dados na blacklist
    const salt = await bcrypt.genSalt(10);
    const uuid = uuidv4();
    const hashedToken = await bcrypt.hash(refreshToken, salt);
    const addBlacklist = new Blacklist({
      userid: user._id,
      token: hashedToken,
      sessionId: uuid,
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
    res.cookie("sessionId", uuid, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 3 * 60 * 60 * 1000,
    });
    res.status(200).json({ message: "Login bem-sucedido", user});
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
    const power = "user";
    const hashedPass = await bcrypt.hash(password, salt);
    const existingUser = await User.findOne({ $or: [{ email }, { name }] });
    if (existingUser) {
      return res.status(400).json({ message: " Usuario ja cadastrado" });
    }
    const newUser = new User({ name, password: hashedPass, email, phone, power: power, registeredProducts: 0});
    await newUser.save();

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
    const token = req.cookies.refreshToken;
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const deleteHashed = await Blacklist.findOneAndDelete({
      userid: decoded.id,
    });
    if (!deleteHashed) {
      res.status(401).json({ message: "Erro, refresh não encontrado" });
    }
    //remoção dos cookies
    res.clearCookie("accessToken", {
      sameSite: "lax",
      secure: false,
    });
    res.clearCookie("refreshToken", {
      sameSite: "lax",
      secure: false,
    });
    res.clearCookie("sessionId", {
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
    const user = jwt.verify(req.cookies.refreshToken,process.env.JWT_REFRESH_SECRET);
    const updateUser = await User.findByIdAndUpdate(user.id, { name: req.body.name, email: req.body.email, phone: req.body.phone}) ;
    res.status(200).json({message: "Usuario atualizado com sucesso", data: updateUser});
  } catch(error) {
    res.status(500).json({message: "Erro ao atualizar os dados"}, error);
  }
}