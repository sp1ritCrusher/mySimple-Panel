import { describe, it, expect, vi, beforeEach } from "vitest";

beforeEach(() => {
  vi.resetAllMocks()
});

vi.mock("../repositories/codeRepository.js", () => ({
    create: vi.fn(),
    findOne: vi.fn(),
    deleteOne: vi.fn()
}));

vi.mock("../repositories/userRepository.js", () => ({
    findById: vi.fn(),
    getProvider: vi.fn(),
    update: vi.fn(),
    addProvider: vi.fn()
}))

vi.mock("../repositories/authRepository.js", () => ({
  findOne: vi.fn(),
  update: vi.fn()
}));

vi.mock("../services/mailServices.js", () => ({
    sendEmail: vi.fn()
}));

vi.mock("../config/redis.js", () => ({
  default: {
    get: vi.fn()
  }
}));


import * as codeRepository from "../repositories/codeRepository.js";
import * as authRepository from "../repositories/authRepository.js";
import * as userRepository from "../repositories/userRepository.js";
import * as mailServices from "../services/mailServices.js";
import redisClient from "../config/redis.js";
import jwt from "jsonwebtoken";
import { generateCode, validateCode, getCurrentProvider, resendCode, mergeProviders, setCode_byIntention } from "../services/codeServices.js";


describe("generateCode", () => {
    it("Deve validar usuário", async () => {
        userRepository.findById.mockResolvedValue(null);
        await expect(generateCode(1, "context")).rejects.toMatchObject({ code: "INVALID_USER" });
    });
    it("Deve gerar um código nano", async () => {
        userRepository.findById.mockResolvedValue({id: 1});
        codeRepository.create.mockResolvedValue({ id: 1, code: "ABC123" });
        const result = await generateCode(1, "context");
        expect(result).toBeDefined();
        expect(codeRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        user_id: 1,
        context: "context",
        code: expect.any(String)
    }));
    });
});

describe("validateCode", () => {
    it("Deve conter código válido", async () => {
        codeRepository.findOne.mockResolvedValue(null);
        userRepository.findById.mockResolvedValue({id: 1});
        await expect(validateCode(1, "context", "code")).rejects.toMatchObject({ code: "NOT_FOUND" });
    });
    it("Deve conter usuário válido", async () => {
        codeRepository.findOne.mockResolvedValue({ code: "012345" });
        userRepository.findById.mockResolvedValue(null);
        await expect(validateCode(1, "context", "code")).rejects.toMatchObject({ code: "INVALID_USER" });
    });
    it("Deve verificar provedor", async () => {
        codeRepository.findOne.mockResolvedValue({ user_id: 1 });
        userRepository.findById.mockResolvedValue({ id: 1 });
        userRepository.getProvider.mockResolvedValue({provider: "google"});

        const result = await validateCode(1, "forgot", "code");
        expect(result).toBeDefined();
    });
    it("deve conter contexto válido", async () => {
        codeRepository.findOne.mockResolvedValue({ user_id: 1 });
        userRepository.findById.mockResolvedValue({ id: 1 });
        userRepository.getProvider.mockResolvedValue(null);
        await expect(validateCode(1, null, "code")).rejects.toMatchObject({ code: "INVALID_CONTEXT" });
    });
    it("Se contexto for 'validate_provider' mudar estado no banco para 'active'", async () => {
        codeRepository.findOne.mockResolvedValue({ user_id: 1 });
        userRepository.findById.mockResolvedValue({ id: 1 });
        userRepository.getProvider.mockResolvedValue({ provider: "google" });
        authRepository.findOne.mockResolvedValue({ id: 1 });
        const result = await validateCode(1, "validate_provider", "code");
        expect(result).toBeDefined();
        expect(authRepository.update).toHaveBeenCalledWith(1, expect.objectContaining({
            status: "active"
        }));
    });
    it("Se contexto for 'register' mudar estado no banco para 'verified'", async () => {
        codeRepository.findOne.mockResolvedValue({ user_id: 1 });
        userRepository.findById.mockResolvedValue({ id: 1 });
        userRepository.getProvider.mockResolvedValue(null);
        const result = await validateCode(1, "register", "code");
        expect(result).toBeDefined();
        expect(userRepository.update).toHaveBeenCalledWith(1, expect.objectContaining({
            status: "verified"
        }));
    });
    it("Se contexto for 'forgot' mudar estado no banco para 'pending_password_reset'", async () => {
        codeRepository.findOne.mockResolvedValue({ user_id: 1 });
        userRepository.findById.mockResolvedValue({ id: 1 });
        userRepository.getProvider.mockResolvedValue(null);
        const result = await validateCode(1, "forgot", "code");
        expect(result).toBeDefined();
        expect(userRepository.update).toHaveBeenCalledWith(1, expect.objectContaining({
            status: "pending_password_reset"
        }));
    });
});

describe("resendCode", () => {
    it("Deve conter usuário válido", async () => {
        userRepository.findById.mockResolvedValue(null);
        await expect(resendCode(1, "context")).rejects.toMatchObject({ code: "INVALID_USER" });
    });
    it("Deve remover código anterior", async () => {
        userRepository.findById.mockResolvedValue({ id: 1 });

        try {
        await resendCode(1, "context");
        } catch {}

    expect(codeRepository.deleteOne).toHaveBeenCalledWith({
        user_id: 1
    });
});
});

describe("getCurrentProvider", () => {
    it("se não existir em users_providers retornar local", async () => {
        userRepository.getProvider.mockResolvedValue(null);
        const result = await getCurrentProvider(1);
        expect(result).toEqual("local");
    });
    it("se provider for google retornar 'google'", async () => {
        userRepository.getProvider.mockResolvedValue({provider: "google"});
        const result = await getCurrentProvider(1);
        expect(result).toEqual("google");
    });
});

describe("mergeProviders", () => {
    it("deve conter usuário válido", async () => {
        userRepository.findById.mockResolvedValue(null);
        await expect(mergeProviders(1)).rejects.toMatchObject({ code: "INVALID_USER" });
    });
    it("deve conter provider válido", async () => {
        userRepository.findById.mockResolvedValue({ id: 1 });
        authRepository.findOne.mockResolvedValue(null);
        await expect(mergeProviders(1)).rejects.toMatchObject({ code: "INVALID_PROVIDER" });
    });
    it("Se usuário tiver registro local-only adicionar 'google' na coluna JSONB users.providers e atualizar status na tabela users_providers pra 'active'", async () => {
        userRepository.findById.mockResolvedValue({id: 1, provider: "local"});
        authRepository.findOne.mockResolvedValue({id: 1});
        const result = await mergeProviders(1);
        expect(result).toBeDefined();
        expect(userRepository.addProvider).toHaveBeenCalledWith(1, "google");
        expect(authRepository.update).toHaveBeenCalledWith(1, { status: "active" });
    });
    it("Se usuário tiver registro google-only adicionar 'local' na coluna JSONB users.providers e definir senha persistida", async () => {
        userRepository.findById.mockResolvedValue({id: 1, provider: "google"});
        authRepository.findOne.mockResolvedValue({id: 1});
        redisClient.get.mockResolvedValue("hashed_pass");
        const result = await mergeProviders(1);
        expect(result).toBeDefined();
        expect(userRepository.addProvider).toHaveBeenCalledWith(1, "local");
        expect(userRepository.update).toHaveBeenCalledWith(1, { password_hash: "hashed_pass" });
    });
    it("Se usuário tiver registro google e local retornar null", async () => {
        userRepository.findById.mockResolvedValue({id: 1, provider: ["google", "local"]});
        authRepository.findOne.mockResolvedValue({id: 1});
        const result = await mergeProviders(1);
        expect(result).toEqual(null);
    });
});

describe("setCode_byIntention", () => {
    it("deve conter usuário válido", async () => {
        userRepository.findById.mockResolvedValue(null);
        await expect(setCode_byIntention(1, "context")).rejects.toMatchObject({ code: "INVALID_USER" });
    });
    it("se persistir código remover no banco", async () => {
        userRepository.findById.mockResolvedValue({ id: 1 });
        codeRepository.findOne.mockResolvedValue({ user_id: 1 });
        mailServices.sendEmail.mockResolvedValue(true)
        try {
        await setCode_byIntention(1, "context");
        } catch {}

        expect(codeRepository.deleteOne).toHaveBeenCalledTimes(1);
    });
    it("deve retornar token de intenção", async () => {

        userRepository.findById.mockResolvedValue({ id: 1 });
        codeRepository.findOne.mockResolvedValue({ user_id: 1 });
        mailServices.sendEmail.mockResolvedValue(true);
        const intentionToken = jwt.sign(
        {
              userid: 1,
              context: "context"
        },
        process.env.CHANGE_PASSWORD_SECRET,
        { expiresIn: "15m" },
          );

        const result = await setCode_byIntention(1, "context");
        const payload = jwt.verify(result,process.env.CHANGE_PASSWORD_SECRET);
        expect(payload).toMatchObject({
            userid: 1,
            context: "context"
        });
    });
    it("deve gerar código de verificação", async () => {
        
        userRepository.findById.mockResolvedValue({ id: 1 });
        codeRepository.findOne.mockResolvedValue({ user_id: 1 });
        mailServices.sendEmail.mockResolvedValue(true);
        const result = await setCode_byIntention(1, "context");
        expect(result).toBeDefined();
        expect(codeRepository.create).toHaveBeenCalledWith({
            user_id: 1,
            context: "context",
            code: expect.any(String)
        })
    });
    it("deve retornar 'EXTERNAL_SERVER_ERROR' caso a API do Resend venha a falhar", async () => {
        
        userRepository.findById.mockResolvedValue({ id: 1 });
        codeRepository.findOne.mockResolvedValue({ user_id: 1 });
        mailServices.sendEmail.mockResolvedValue(false);
        await expect(setCode_byIntention(1, "context")).rejects.toMatchObject({ code: "EXTERNAL_SERVER_ERROR" })
    });
});