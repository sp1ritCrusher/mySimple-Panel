import { User } from "../models/User.js";

export const loginUser = async (req, res) => {

      const { email, password } = req.body;
    
      const user = await User.findOne({ email });
      try {
        if (!user) {
          return res.status(404).json({ message: "Usuário não encontrado" });
        }
    
        if (user.password !== password) {
          return res.status(401).json({ message: "Senha invalida" });
        }
    
        res.status(200).json({ message: "Login bem-sucedido", user });
      } catch (error) {
        console.error("Erro ao logar:", error);
        res.status(500).json({ message: "Erro ao logar:", error });
      }

};

export const registerUser = async (req, res) => {
  try {
    const { name, password, email, phone } = req.body;
    const existingUser = await User.findOne({ $or:[{ email }, { name }]  });
    if(existingUser) { return res.status(400).json({message: " Usuario ja cadastrado"}); }
    const newUser = new User({ name, password, email, phone });
    await newUser.save();

    res
      .status(201)
      .json({ message: "Usuario criado com sucesso", user: newUser });
  } catch (error) {

    console.error("Erro ao registrar:", error);
    res.status(500).json({ message: "Erro ao registrar:", error });
  }
};

export const getUser = async (req, res) => {
  try {
    const { email } = req.body;

    const findUser = await User.findOne({ email });
    if(!findUser) {
        return res.status(404).json({message: "User not found"});
    }
    res.status(200).json({ message: "User found", user: findUser });
  } catch (error) {
    console.error("Error finding user", error);
    res.status(500).json({ message: "Error finding user", error });
  }
};