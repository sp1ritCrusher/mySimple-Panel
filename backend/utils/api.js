import { Resend } from 'resend';
import { EmailError } from '../errors/AppError.js';

export async function provider_sendEmail(msg) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send(msg);
    if (error) {
      throw new EmailError({
        message: "Erro no provedor de email",
        status: 500,
        code: "EXTERNAL_SERVER_ERROR"})
    }
    return data;
}
