import * as userRepository from "../repositories/userRepository.js"
import * as userServices from "../services/userServices.js";
import * as codeServices from "../services/codeServices.js";
import * as systemServices from "../services/systemServices.js";
import * as authServices from "../services/authServices.js";
import * as systemLogs from "../logs/systemLogs.js";
import * as userLogs from "../logs/userLogs.js";
import { setIntention_token, setAuthCookies, getIp } from "../utils/utils.js";

const FRONTEND_ORIGIN = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")[0]
  .trim();

function oauthPopupScript(payload) {
  const json = JSON.stringify(payload);
  return `<script>
    if (window.opener) {
      window.opener.postMessage(${json}, ${JSON.stringify(FRONTEND_ORIGIN)});
    }
    window.close();
  </script>`;
}

export async function oAuthCallback_Receiving(req, res) {
  try {
    const { provider, code } = req.query;
    const requestAuth = await authServices.validateProvider_code(provider, code);
    await userLogs.user_oAuth_validation(
      requestAuth.auth.user.id,
      requestAuth.auth.session,
      getIp(req),
      provider
    );
    setAuthCookies(res, requestAuth.auth);
    res.send(oauthPopupScript({ context: provider, success: true }));
  } catch (error) {
    return res.send(
      oauthPopupScript({
        code: error.code,
        userid: error.userid ?? null,
      })
    );
  }
}

export async function system_Callback(req, res) {

    const userid = req.body.userid;
    const code = req.body.code;
    const result = await systemServices.get_callbackResponse(userid, code);
    setIntention_token(res, result.intentionToken);
    res.status(200).json(result.message);

}

export const resolveUser_Intention = async (req, res) => {

    const { email, context } = req.body;
    const user = await userServices.findUserByEmail(email);
    const validateIntention = await codeServices.setCode_byIntention(user.id, context);
    setIntention_token(res, validateIntention);
    systemLogs.systemCode_Request(user.id, context, getIp(req));
    return res.status(200).json({ message: "Token de intenção gerado com sucesso" }); 

  }