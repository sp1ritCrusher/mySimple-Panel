import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import { Log } from "../models/Logs.js"
import { getDifferences, getIp } from "../utils/utils.js";

/* Rota admimistrativa */

/*  Indice de usuarios - listando TODOS  */

export const getUsers = async (req, res) => {
  try {
    const data = await User.find();
    if (!data) {
      return res.status(404).json({ message: "Nenhum usuario encontrado" });
    }
    res.status(200).json({ message: "Usuarios encontrados", user: data });
  } catch (error) {
    console.error("Erro: ", error);
    res.status(500).json({ message: "Erro ", error });
  }
};




/*  Edição de usuário  */

export const editUser = async (req, res) => {
  try {
    const user = await User.findById(req.body.id);
    //Autorização de admin atraves do refreshToken
    const requester = jwt.verify(req.cookies.accessToken,process.env.JWT_SECRET);
    if (requester.power !== "admin") {
      return res.status(400).json({ message: "Erro,você não é um admin" });
    }
    //validation pra email ja existente
    const existingEmail = await User.findOne({ email: req.body.email} );
    if (existingEmail && user.email !== req.body.email ) {
      return res.status(400).json({ message: "Esse email já pertence a outro usuário" });
    }

    const updateuser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updateuser) {
      return res.status(404).json({ message: "Erro ao encontrar este usuario" });
    }

    const diff = getDifferences(user, updateuser);
    const setObj = []
    if(diff.name) {
    setObj.push(`Mudou o nome de ${diff.name.current} para ${diff.name.new}`);
    }
    if(diff.email) {
    setObj.push(`Mudou o email de ${diff.email.current} para ${diff.email.new}`);
    }
    if(diff.phone) {
    setObj.push(`Mudou o telefone de ${diff.phone.current} para ${diff.phone.new}`);
    }
    await Log.create({
      type: "admin",
      actioner: `${requester.name}`,
      target: `${user.name}`,
      action: `O administrador ${requester.name} editou o usuário ${user.name}`,
      data: setObj,
      session: requester.session,
      ip: getIp(req)
    });
    res.status(200).json({ message: "Usuario Atualizado com sucesso" });
  } catch(error) {
    console.log(error);
  res.status(500).json({ message: "Erro ao atualizar usuario"});
}

};

/*  Remoção de usuário  */

export const removeUser = async (req,res) => {
  //validando a identidade do requisidor
    const requester = jwt.verify(req.cookies.accessToken,process.env.JWT_SECRET);
    try{ 
      //pegando user pelo params
      const user = await User.findById(req.params.id).select("-password");
      //impedindo de apagar a si mesmo
      if(user._id.toString() == requester.id) {
        return res.status(400).json({message:"Voce não pode apagar a si mesmo"});
      }
      //impedindo de apagar outro admin
      if(user.power === "admin") {
        return res.status(400).json({message:"Erro, voce nao pode apagar esse usuário"});
      }
      const removeUser = await User.findByIdAndDelete(req.params.id);
      if(!removeUser) {
        return res.status(400).json({message: "Erro ao deletar usuário"});
      }
      await Log.create({
      type: "admin",
      actioner: `${requester.name}`,
      target: `${user.name}`,
      action: `O administrador ${requester.name} removeu o usuário ${user.name}`,
      session: requester.session,
      ip: getIp(req)
    });
      res.status(200).json({message:"Usuario deletado com sucesso"}, removeUser);
    } catch(error) {
      res.status(500).json({message: "Error"});
    }
}