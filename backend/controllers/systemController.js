import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import { Log } from "../models/Logs.js"

/* Controles de sistema */


/* Mudança de senha */
export const changePassword = async (req, res) => {
  try {
    //compara e valida currentPass, hasheia e atualiza newPass
    const user = await User.findById(req.body.userid);
    const token = jwt.verify(req.cookies.accessToken,process.env.JWT_SECRET);
    const currentPass = req.body.current;
    const checkPass = await bcrypt.compare(currentPass, user.password);
     if (!checkPass) {
      return res.status(404).json({ message: "Senha incorreta" });
    }
    const salt = await bcrypt.genSalt(10);
    const newPass = await bcrypt.hash(req.body.newPass, salt);
    await User.findByIdAndUpdate(user._id, { password: newPass });
    res.status(200).json({ message: "Senha alterada com sucesso" });
    await Log.create({
        type: "user",
        actioner: `${user.name}`,
        action: `O usuário ${user.name} alterou sua senha`,
        session: token.session,
        ip: getIp(req)
    })

  } catch (error) {
    return res.status(404).json({ message: `Erro: ${error}` });
  }
};
