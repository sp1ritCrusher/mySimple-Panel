import { provider_sendEmail } from "../utils/api.js";
import * as userRepository from "../repositories/userRepository.js";
import * as codeRepository from "../repositories/codeRepository.js";

export async function sendEmail(email, context) {
    let msg;
    let email_req;
    const user_inQuestion = await userRepository.findByEmail(email);
    if(!user_inQuestion || !email) {
        throw new Error({ message:"Erro: usuário não identificado" });
    }
    const code = await codeRepository.findOne({ userid: user_inQuestion._id });
    if(!code) {
        throw new Error({message: "Erro, código de verificação não encontrado"});
    }

    switch (context) { 
    case "register": 
    msg = {
      to: email,
      from: "lucasgiulerm555@gmail.com",
      subject: "Código de confirmação - mySimple Panel",
      text: `Seja muito bem-vindo, agradecemos a sua preferência! 
        Sua conta necessita de uma pequena verificação, insira esse código em nosso site para dar continuidade ao seu registro:
        
        Código: ${code.code}`,
    };
    email_req = await provider_sendEmail(msg);
    break; 
    case "forgot": 
    msg = {
      to: email,
      from: "lucasgiulerm555@gmail.com",
      subject: "Código de confirmação - mySimple Panel",
      text: `Seja muito bem-vindo, agradecemos a sua preferência! 
        Sua conta necessita de uma pequena verificação, insira esse código em nosso site para dar continuidade ao seu registro:
        
        Código: ${code.code}`,
    };
    email_req = await provider_sendEmail(msg);
    break; 
    default: throw new Error("Contexto inválido"); 
}
    if(email_req.success === false) {
     throw new Error({ message: "Erro ao enviar email"});
    }
    return email_req;
}