import jwt from "jsonwebtoken";
import { AppError, AuthError, CodeError, ProductError, RegisterError } from "../errors/AppError.js";
import { OAUTH_REDIRECT_URI } from "../config/appUrl.js";
import * as authServices from "../services/authServices.js";
import * as authRepository from "../repositories/authRepository.js";

export function getDifferences(currentData, newData) {
      const diff = {};
        for (const key in newData) {
        if (newData[key] !== currentData[key]) {
        diff[key] = { 
          current: currentData[key],
          new: newData[key]
        }
        delete diff.id;
      }
    }
    return diff;
}



export function getIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded ? forwarded.split(",")[0].trim() : req.socket.remoteAddress;
  return ip || "0.0.0.0";
}

function cookieBaseOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };
}

export function set_accessToken_cookie(res, token) {
  res.cookie("accessToken", token, {
    ...cookieBaseOptions(),
    maxAge: 60 * 60 * 1000,
  });
}

export function setAuthCookies(res, auth) {
  res.cookie("accessToken", auth.accessToken, {
    ...cookieBaseOptions(),
    maxAge: 60 * 60 * 1000,
  });
  res.cookie("refreshToken", auth.refreshToken, {
    ...cookieBaseOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuth_Cookies(res) {
  const base = cookieBaseOptions();
  res.clearCookie("accessToken", base);
  res.clearCookie("refreshToken", base);
}

export function setIntention_token(res, token) {
  res.cookie("intentionToken", token, {
    ...cookieBaseOptions(),
    maxAge: 60 * 60 * 1000,
    path: "/",
  });
}

export async function callGoogle_provider(code) {
 const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_KEY,
      redirect_uri: OAUTH_REDIRECT_URI,
      grant_type: "authorization_code"
    })
  });
    const tokens = await response.json();
    const decoded = jwt.decode(tokens.id_token);
    if(response.ok) {
    return decoded;
    } else {
    throw new AppError({ message:"Erro no provedor", status: 400, code: "PROVIDER_EXTERNAL_ERROR"})
    }
}

export async function validateUser(user, ErrorClass) {
    if(!user) { 
        throw new ErrorClass({
            message: "Erro, usuário inexistente/inválido",
            status: 404,
            code: "INVALID_USER"
        })
    }
}

export async function ensureCode(code) {
    if(!code) { 
      throw new CodeError({ 
        message: "Código inválido/não encontrado",
        status: 404,
        code: "NOT_FOUND" });
    }
}

export async function validateProductPermission(user, product) {
      if(user.id !== product.user_id && user.power !== "admin") {
        throw new ProductError({
          message: "Você não está autorizado a editar esse produto",
          status: 403,
          code: "FORBIDDEN"
        })
      }
}

export async function validateProduct(product) {
  if(!product) {
      throw new ProductError({ 
        message: "Produto não encontrado",
        status: 404,
        code: "PRODUCT_NOT_FOUND" });
  }
}


export async function validateSession(session) {
  if(!session) {
      throw new AuthError({ 
        message: "Sessão não encontrada",
        status: 404,
        code: "SESSION_NOT_FOUND" });
  }
}

export async function validatePassword(password) {
  if(!password || password === null) {
    throw new RegisterError({
      message: "Senha inválida",
      status: 403,
      code: "INVALID_PASSWORD"
    })
  }
}

export function getConflictingFields(users, userid, data) {
    const conflicts = new Set();

    for (const user of users) {

        if (user.id === userid) continue;

        if (user.email === data.email) {
            conflicts.add("Email");
        }

        if (user.phone === data.phone) {
            conflicts.add("Telefone");
        }
    }

    return [...conflicts];
}

export async function validateGoogleProviderLink(user, provider, providerId) {
      if(user.provider.includes("local") && !user.provider.includes("google")) {
        if(!provider) {
        await authRepository.create({
        user_id: user.id,
        provider: "google",
        provider_sub: providerId,
        status: "pending_code_validation"
        });
        }
        throw new AuthError({
          message: "Esse usuário já está registrado localmente",
          status: 401,
          code: "USER_LOCAL_REGISTERED",
          userid: user.id
        });
      }
      }

export async function validateProviderStatus(provider, user) {
      if(provider.status === "pending_code_validation") {
        throw new AuthError({
          message: "Erro: provedor não validado",
          status: 401,
          code: "PROVIDER_NOT_VALIDATED",
          userid: user.id
        })
      }
}

export async function validateProvider(provider) {
  if(provider !== "google" && provider !== "local") {
    throw new AuthError({ 
        message: "Provider Inválido",
        status: 404,
        code: "INVALID_PROVIDER" });
  }
}

export async function ensure_authProvider(provider) {
  if(!provider) {
    throw new AuthError({ 
      message: "Provider Inválido",
      status: 404,
      code: "INVALID_PROVIDER" });
  }
}