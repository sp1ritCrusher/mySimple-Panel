import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
export const loginUser = async (req, res) => {

      const { email, password } = req.body;
    
      const user = await User.findOne({ email });
      try {
        if (!user) {
          return res.status(404).json({ message: "Usuário não encontrado" });
        }
        //hash check
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(401).json({ message: "Senha invalida" });
        }
        //jwt sign
        const accessToken = jwt.sign({
          id: user._id, 
          email: user.email}, process.env.JWT_SECRET,
          { expiresIn: "10s"}
        );
          const refreshToken = jwt.sign({
          id: user._id, 
          email: user.email}, process.env.JWT_REFRESH_SECRET,
          { expiresIn: "7d"}
        );
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
      } catch (error) {
        console.error("Erro ao logar:", error);
        res.status(500).json({ message: "Erro ao logar:", error });
      }

};

export const registerUser = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const { name, password, email, phone } = req.body;
    const hashedPass = await bcrypt.hash(password, salt);
    const existingUser = await User.findOne({ $or:[{ email }, { name }]  });
    if(existingUser) { return res.status(400).json({message: " Usuario ja cadastrado"}); }
    const newUser = new User({ name, password: hashedPass, email, phone });
    await newUser.save();

    res.status(201).json({ message: "Usuario criado com sucesso", user: newUser });
  } catch (error) {

    console.error("Erro ao registrar:", error);
    res.status(500).json({ message: "Erro ao registrar:", error });
  }
};

export const getUser = async (req, res) => {
  try {
    const findUser = await User.findById(req.user.id).select("-password");
    console.log(findUser);
    if(!findUser) {
        return res.status(404).json({message: "User not found"});
    }
    res.status(200).json({ message: "User found", user: findUser });
  } catch (error) {
    console.error("Error finding user", error);
    res.status(500).json({ message: "Error finding user", error });
  }
};