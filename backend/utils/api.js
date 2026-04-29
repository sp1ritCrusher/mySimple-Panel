import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function provider_sendEmail(msg) {
  try {
    await sgMail.send(msg);
    console.log("Email enviado com sucesso");
    return { success: true };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return { success: false, error };
  }
}
