import { describe, it, expect, vi, beforeEach } from "vitest";

beforeEach(() => {
  vi.resetAllMocks()
});

vi.mock("../repositories/userRepository.js", () => ({
  findById: vi.fn(),
  findByEmail: vi.fn(),
  findOne: vi.fn(),
  findConflicts: vi.fn(),
  create: vi.fn(),
  update: vi.fn()
}));

vi.mock("../services/authServices.js", () => ({
    authenticate: vi.fn()
}));


vi.mock("../repositories/authRepository.js", () => ({
  create: vi.fn(),
  findOne: vi.fn()
}));

vi.mock("../repositories/sessionRepository.js", () => ({
  findOne: vi.fn(),
  remove: vi.fn(),
  create: vi.fn()
}));

vi.mock("../config/redis.js", () => ({
  default: {
    set: vi.fn()
  }
}));

vi.mock("bcrypt", () => ({
  default: {
    compare: vi.fn(),
    genSalt: vi.fn(),
    hash: vi.fn()
  }
}));

import jwt from "jsonwebtoken";
import * as userRepository from "../repositories/userRepository.js";
import * as authRepository from "../repositories/authRepository.js";
import * as authServices from "../services/authServices.js";
import * as sessionRepository from "../repositories/sessionRepository.js";
import redisClient from "../config/redis.js";
import bcrypt from "bcrypt";
import { oauthProviders } from "../config/providers.js";
import { findUserByEmail, createUser, getUser_byId, logoutUser, oAuth_loginUser, updateUser, authProvider_redirect, local_loginUser, changePassword, resetPassword } from "../services/userServices.js";

describe("findUserByEmail", () => {

    it("deve lançar erro quando usuário não existir", async () => {
    
        userRepository.findByEmail.mockResolvedValue(null);
    
        await expect(findUserByEmail("anything")).rejects.toThrow();
    
    });
});

describe("createUser", () => {

    it("deve lançar erro quando usuário já existir", async () => {
    
        userRepository.findByEmail.mockResolvedValue({ id: 1, email: "teste@email.com", provider: ["local"] });

        const newUser = { 
            context: "local",
            name: "Lucas",
            email: "teste@email.com",
            phone: "123456789",
            password: "123456789",
            provider_sub: "sub-1234"
        }
    
        await expect(createUser(newUser)).rejects.toMatchObject({ code: "USER_ALREADY_REGISTERED" });
    
    });

    it("deve lançar erro quando usuário tiver registro google", async () => {

        userRepository.findByEmail.mockResolvedValue({ id: 1, email: "teste@email.com", provider: ["google"] });

        const newUser = { 
            context: "local",
            name: "Lucas",
            email: "teste@email.com",
            phone: "123456789",
            password: "123456789",
            provider_sub: "sub-1234"
        }
    
        await expect(createUser(newUser)).rejects.toMatchObject({ code: "USER_GOOGLE_REGISTERED" });
    
    });

    
    it("deve persistir senha quando usuário tiver registro google", async () => {

        userRepository.findByEmail.mockResolvedValue({ id: 1, email: "teste@email.com", provider: ["google"] });

        const newUser = { 
            context: "local",
            name: "Lucas",
            email: "teste@email.com",
            phone: "123456789",
            password: "123456789",
            provider_sub: "sub-1234"
        }
    
        await expect(createUser(newUser)).rejects.toMatchObject({ code: "USER_GOOGLE_REGISTERED" });
        expect(redisClient.set).toHaveBeenCalledTimes(1);

    });

    it("deve conter contexto válido", async () => {

    userRepository.findByEmail.mockResolvedValue({ id: 1, email: "teste@email.com", provider: ["google"] });

    const newUser = { 
        context: null,
        name: "Lucas",
        email: "teste@email.com",
        phone: "123456789",
        password: "123456789",
        provider_sub: "sub-1234"
        }
    
        await expect(createUser(newUser)).rejects.toMatchObject({ code: "INVALID_CONTEXT" });
    
    });

    it("deve criar usuário com dados válidos", async () => {

    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue({ id: 1 });
    bcrypt.genSalt.mockResolvedValue("salt");
    bcrypt.hash.mockResolvedValue("hashedPassword");

    const newUser = { 
        context: "local",
        name: "Lucas",
        email: "teste@email.com",
        phone: "123456789",
        password: "123456789",
        provider_sub: "sub-1234"
        }
    const result = await createUser(newUser);

    expect(result).toBeDefined();
    expect(userRepository.create).toHaveBeenCalledWith(
    expect.objectContaining({
      email: "teste@email.com",
      power: "user"
    })
  );

    });

    it("deve conter senha em registro local", async () => {

    userRepository.findByEmail.mockResolvedValue(null);

    const newUser = { 
        context: "local",
        name: "Lucas",
        email: "teste@email.com",
        phone: "123456789",
        password: null,
        provider_sub: "sub-1234"
        }
    
    await expect(createUser(newUser)).rejects.toMatchObject({ code: "INVALID_PASSWORD" });
    
    });
    it("se usuario nao tiver registro local criar conta google", async () => {

    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue({ id: 1 });
    
    const new_googleUser = { 
        context: "google",
        name: "Lucas",
        email: "teste@email.com",
        provider_sub: "sub-1234"
    }
    
    const result = await createUser(new_googleUser);

    expect(result).toBeDefined();

    });
    it("deve criar authProvider ao registrar usuário google", async () => {

    userRepository.findByEmail.mockResolvedValue(null);
    authRepository.create.mockResolvedValue({ user_id: 1 })
    userRepository.create.mockResolvedValue({ id: 1 });
    

    const new_googleUser = { 
        context: "google",
        name: "Lucas",
        email: "teste@email.com",
        provider_sub: "sub-1234"
    }
    
    const result = await createUser(new_googleUser);

    expect(result).toBeDefined();
    expect(authRepository.create).toHaveBeenCalledTimes(1);

    });
});

describe("logoutUser", () => {

    it("deve conter usuário válido", async () => {
        userRepository.findById.mockResolvedValue(null);
        await expect(logoutUser(1)).rejects.toThrow();
    });
    it("deve conter sessão", async () => {
        userRepository.findById.mockResolvedValue({
            id: 1
        });
        sessionRepository.findOne.mockResolvedValue(null);
        await expect(logoutUser(1)).rejects.toThrow();
    });
    it("deve remover sessão", async () => {
        userRepository.findById.mockResolvedValue({id: 1});
        sessionRepository.findOne.mockResolvedValue({session_id: 1});

        const result = await logoutUser(1);

        expect(result).toBeDefined();
        expect(sessionRepository.remove).toHaveBeenCalledWith({ user_id: 1 });
    });
    it("deve retornar dados da sessão removida", async () => {

        userRepository.findById.mockResolvedValue({
        id: 1
        });

        sessionRepository.findOne.mockResolvedValue({
            session_id: "sessao-123",
            provider: "local"
        });

        const result = await logoutUser(1);

        expect(result).toEqual({
            session_id: "sessao-123",
            provider: "local"
        });

        });
});

describe("updateUser", () => {
    it("deve conter usuário válido", async () => {
        userRepository.findById.mockResolvedValue(null);
        await expect(logoutUser(1)).rejects.toThrow();
    });
    it("deve conter sessão", async () => {
        userRepository.findById.mockResolvedValue({
            id: 1
        });
        sessionRepository.findOne.mockResolvedValue(null);
        await expect(logoutUser(1)).rejects.toThrow();
    });
    it("deve lançar erro quando email ou telefone pertencerem a outro usuário", async () => {
        sessionRepository.findOne.mockResolvedValue({session_id: 1});
        userRepository.findById.mockResolvedValue({
            id: 1,
            email: "lucas@email.com",
            phone: "111111111"
        });

        userRepository.findConflicts.mockResolvedValue([
        {
            id: 2,
            email: "novo@email.com",
            phone: "222222222"
        }
        ]);

        const newData = {
            email: "novo@email.com",
            phone: "222222222"
        };

        await expect(updateUser(1, newData)).rejects.toMatchObject({ code: "DATA_CONFLICT" });

    });
    it("deve informar quais campos estão em conflito", async () => {
        sessionRepository.findOne.mockResolvedValue({session_id: 1});
        userRepository.findById.mockResolvedValue({
            id: 1,
            email: "lucas@email.com",
            phone: "111111111"
        });

        userRepository.findConflicts.mockResolvedValue([
        {
            id: 2,
            email: "novo@email.com",
            phone: "222222222"
        }
        ]);

    const newData = {
        email: "novo@email.com",
        phone: "222222222"
    };

  await expect(updateUser(1, newData)).rejects.toMatchObject({ 
    code: "DATA_CONFLICT",
    message: expect.stringContaining("Email")
  });

});
});
describe("authProvider_redirect", () => {

  it("deve montar corretamente a URL de redirecionamento", async () => {
    const url = await authProvider_redirect("google");

    const expectedUrl =
      oauthProviders.google.authUrl +
      "?" +
      new URLSearchParams(oauthProviders.google.params);

    expect(url).toBe(expectedUrl);
  });

  it("deve lançar erro para provider inválido", async () => {
    await expect(
      authProvider_redirect("providerInexistente")
    ).rejects.toMatchObject({
      code: "INVALID_PROVIDER",
      status: 404
    });
  });

});

describe("oAuth_loginUser", () => {

it("deve criar usuário google e autenticar quando usuário não existir", async () => {
  userRepository.findByEmail.mockResolvedValue(null);

  userRepository.create.mockResolvedValue({ id: 1 });

  authServices.authenticate.mockResolvedValue({
    accessToken: "token"
  });

  const result = await oAuth_loginUser({
    provider: "google",
    name: "Lucas",
    email: "lucas@email.com",
    providerId: "google123"
  });

    expect(userRepository.create).toHaveBeenCalledWith({
        name: "Lucas",
        email: "lucas@email.com",
        power: "user",
        status: "verified",
        provider: JSON.stringify(["google"])
    });

  expect(authServices.authenticate)
    .toHaveBeenCalledWith(1, "google");

    expect(result).toEqual({
        accessToken: "token"
    });
});

it("deve lançar USER_LOCAL_REGISTERED quando usuário local tentar login Google", async () => {

  userRepository.findByEmail.mockResolvedValue({
    id: 1,
    provider: ["local"]
  });

  authRepository.findOne.mockResolvedValue(null);

  await expect(
    oAuth_loginUser({
      provider: "google",
      name: "Lucas",
      email: "lucas@email.com",
      providerId: "google123"
    })
  ).rejects.toMatchObject({
    code: "USER_LOCAL_REGISTERED"
  });

  expect(authRepository.create).toHaveBeenCalledWith({
    user_id: 1,
    provider: "google",
    provider_sub: "google123",
    status: "pending_code_validation"
  });

});

it("deve lançar PROVIDER_NOT_VALIDATED quando provider estiver pendente", async () => {

  userRepository.findByEmail.mockResolvedValue({
    id: 1,
    provider: ["local", "google"]
  });

  authRepository.findOne.mockResolvedValue({
    status: "pending_code_validation",
    provider_sub: "google123"
  });

  await expect(
    oAuth_loginUser({
      provider: "google",
      name: "Lucas",
      email: "lucas@email.com",
      providerId: "google123"
    })
  ).rejects.toMatchObject({
    code: "PROVIDER_NOT_VALIDATED"
  });

});

it("deve autenticar usuário quando provider estiver ativo e provider_sub for válido", async () => {

  userRepository.findByEmail.mockResolvedValue({
    id: 1,
    provider: ["google"]
  });

  authRepository.findOne.mockResolvedValue({
    status: "active",
    provider_sub: "google123"
  });

  authServices.authenticate.mockResolvedValue({
    accessToken: "token",
    refreshToken: "refresh"
  });

  const result = await oAuth_loginUser({
    provider: "google",
    name: "Lucas",
    email: "lucas@email.com",
    providerId: "google123"
  });

  expect(authServices.authenticate)
    .toHaveBeenCalledWith(1, "google");

  expect(result).toEqual({
    accessToken: "token",
    refreshToken: "refresh"
  });

});

it("deve lançar INVALID_CREDENTIALS quando providersub for divergente", async () => {

  userRepository.findByEmail.mockResolvedValue({
    id: 1,
    provider: ["google"]
  });

  authRepository.findOne.mockResolvedValue({
    status: "active",
    provider_sub: "google123"
  });

 await expect(
    oAuth_loginUser({
      provider: "google",
      name: "Lucas",
      email: "lucas@email.com",
      providerId: "123google"
    })
  ).rejects.toMatchObject({
    code: "INVALID_CREDENTIALS"
  });

});
});

describe("local_loginUser", () => {
    it("Deve conter usuário válido", async() => {

        userRepository.findByEmail.mockResolvedValue(null);

        await expect(local_loginUser({ email: "email", password: "password" })).rejects.toMatchObject({
        code: "INVALID_USER"
        });
    });
    it("Não deve conter senha em branco(prevenção de má intenção via google-only login)" , async() => {

        userRepository.findByEmail.mockResolvedValue({id: 1, password_hash: null});

        await expect(local_loginUser({ email: "email", password: "password" })).rejects.toMatchObject({
        code: "INVALID_PASSWORD"
        });
    });
    it("Requisição deve conter senha coerente ao database(hashed)" , async() => {

        userRepository.findByEmail.mockResolvedValue({id: 1, password_hash: "senha"} );
        bcrypt.compare.mockResolvedValue(false);

        await expect(local_loginUser({ email: "email", password: "password" })).rejects.toMatchObject({
        code: "INVALID_PASSWORD"
        });
    });
    it("Usuário deve estar com status 'verified'(validado via código)" , async() => {

        userRepository.findByEmail.mockResolvedValue({id: 1, password_hash: "password", status: "pending_email_verification" } );
        bcrypt.compare.mockResolvedValue(true);

        await expect(local_loginUser({ email: "email", password: "password" })).rejects.toMatchObject({
        code: "USER_NOT_VERIFIED"
        });
    });
    it("deve autenticar usuário" , async() => {

        userRepository.findByEmail.mockResolvedValue({id: 1, password_hash: "password", status: "verified" } );
        bcrypt.compare.mockResolvedValue(true);
        authServices.authenticate.mockResolvedValue({
            refreshToken: "refresh",
            accessToken: "token"
        });
        const result = await local_loginUser({ email: "email", password: "password" });
        expect(authServices.authenticate).toHaveBeenCalledWith(1, "local");
        expect(result).toEqual({
            accessToken: "token",
            refreshToken: "refresh"
        });
    });
});

describe("changePassword", () => {
    it("Deve conter usuário válido", async() => {

        userRepository.findById.mockResolvedValue(null);

        await expect(changePassword(1, "currentPass", "newPass")).rejects.toMatchObject({
        code: "INVALID_USER"
        });
    });
    it("Deve conter sessão válida", async() => {

        sessionRepository.findOne.mockResolvedValue(null);
        userRepository.findById.mockResolvedValue({ id: 1 });

        await expect(changePassword(1, "currentPass", "newPass")).rejects.toMatchObject({
        code: "SESSION_NOT_FOUND"
        });
    });
    it("Senha atual informada deve ser equivalente", async() => {

        sessionRepository.findOne.mockResolvedValue({ session_id: 1});
        userRepository.findById.mockResolvedValue({ id: 1,  password_hash: "hashAtual" });
        bcrypt.compare.mockResolvedValue(false); 

        await expect(changePassword(1, "currentPass", "newPass")).rejects.toMatchObject({
        code: "UNAUTHORIZED"
        });
    });
    it("deve atualizar nova senha e mudar estado para 'verified' e retornar id da sessão", async() => {

        sessionRepository.findOne.mockResolvedValue({ session_id: 1});
        userRepository.findById.mockResolvedValue({ id: 1, password_hash: "hashAtual"});
        bcrypt.compare.mockResolvedValue(true); 
        bcrypt.genSalt.mockResolvedValue("salt");
        bcrypt.hash.mockResolvedValue("hashedPassword");
        const result = await changePassword(1, "currentPass", "newPass");
        expect(result).toEqual(1);
        expect(userRepository.update).toHaveBeenCalledWith(1, { status: "verified", password_hash: "hashedPassword" });
    });
});
describe("resetPassword", () => {
    it("Deve conter usuário válido", async() => {

        userRepository.findById.mockResolvedValue(null);

        await expect(resetPassword(1, "newPass")).rejects.toMatchObject({
        code: "INVALID_USER"
        });
    });
    it("Deve conter sessão válida", async() => {

        sessionRepository.findOne.mockResolvedValue(null);
        userRepository.findById.mockResolvedValue({ id: 1, password_hash: "hashAtual" });

        await expect(resetPassword(1, "newPass")).rejects.toMatchObject({
        code: "SESSION_NOT_FOUND"
        });
    });
    it("usuário deve conter estado para mudança de senha", async() => {

        sessionRepository.findOne.mockResolvedValue({session_id: 1});
        userRepository.findById.mockResolvedValue({ id: 1, password_hash: "hashAtual", status: null });

        await expect(resetPassword(1, "newPass")).rejects.toMatchObject({
        code: "INVALID_REQUEST"
        });
    });
    it("deve atualizar nova senha e mudar estado para 'verified' e retornar id da sessão", async() => {

        sessionRepository.findOne.mockResolvedValue({ session_id: 1});
        userRepository.findById.mockResolvedValue({ id: 1, password_hash: "hashAtual", status: "pending_password_reset"});
        bcrypt.genSalt.mockResolvedValue("salt");
        bcrypt.hash.mockResolvedValue("hashedPassword");
        const result = await resetPassword(1, "newPass")
        expect(result).toEqual(1);
        expect(userRepository.update).toHaveBeenCalledWith(1, { status: "verified", password_hash: "hashedPassword" });
    });
});