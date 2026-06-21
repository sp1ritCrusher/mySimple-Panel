import { provider_sendEmail } from "../utils/api.js";
import { EmailError } from "../errors/AppError.js";
import * as userRepository from "../repositories/userRepository.js";
import * as codeRepository from "../repositories/codeRepository.js";

export const emailHandler = {
  forgot: (email, code) => ({
    to: email,
    from: "mySimple Panel <onboarding@resend.dev>",
    subject: "Código de confirmação - mySimple Panel",
    html: `Olá, verificamos que você esqueceu sua senha
      Sua conta necessita de uma pequena verificação, insira esse código em nosso site para dar continuidade a recuperação da sua senha:
      
      Código: ${code.code}`,
  }),
  register: (email, code) => ({
    to: email,
    from: "mySimple Panel <onboarding@resend.dev>",
    subject: "Código de confirmação - mySimple Panel",
    html: `Seja muito bem-vindo, agradecemos a sua preferência! 
      Sua conta necessita de uma pequena verificação, insira esse código em nosso site para dar continuidade ao seu registro:
      
      Código: ${code.code}`,
  }),
  merge: (email, code) => ({
    to: email,
    from: "mySimple Panel <onboarding@resend.dev>",
    subject: "Código de confirmação - mySimple Panel",
    html: `Olá, agradecemos a sua preferência! 
      Para validar a integração de autenticação, insira esse código em nosso site para dar continuidade:
      
      Código: ${code.code}`,
  }),
};

export async function sendEmail(email, context) {
  let msg;
  let email_req;
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new EmailError({
      message: "Erro: usuário não identificado",
      status: 404,
      code: "USER_NOT_FOUND",
    });
  }
  const code = await codeRepository.findOne({ user_id: user.id });
  if (!code) {
    throw new EmailError({
      message: "Erro, código de verificação não encontrado",
      status: 404,
      code: "CODE_NOT_FOUND",
    });
  }
  try {
    switch (context) {
      case "register":
        msg = emailHandler.register(email, code);
        email_req = await provider_sendEmail(msg);
        break;
      case "forgot":
        msg = emailHandler.forgot(email, code);
        email_req = await provider_sendEmail(msg);
        break;
      case "merge":
        msg = emailHandler.merge(email, code);
        email_req = await provider_sendEmail(msg);
        break;
        default:
          throw new Error("Contexto inválido");
      }
  return email_req;
} catch(error) {
  console.log(error);
  throw new EmailError({ message: error.message, status: error.status, code: error.code })
}
}
