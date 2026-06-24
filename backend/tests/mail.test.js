import { describe, it, expect, vi, beforeEach } from "vitest";

beforeEach(() => {
  vi.resetAllMocks()
});

vi.mock("../repositories/userRepository.js", () => ({
    findByEmail: vi.fn()
}));

vi.mock("../repositories/codeRepository.js", () => ({
    findOne: vi.fn()
}));

vi.mock("../utils/api.js", () => ({
    provider_sendEmail: vi.fn()
}));

import * as userRepository from "../repositories/userRepository.js";
import * as codeRepository from "../repositories/codeRepository.js";
import { provider_sendEmail } from "../utils/api.js";
import { sendEmail } from "../services/mailServices.js";

describe("sendEmail", () => {
    it("deve conter usuário válido", async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(sendEmail("lucas@email.com", "register")).rejects.toMatchObject({ code: "USER_NOT_FOUND" });
    });
    it("deve conter código válido", async () => {
        userRepository.findByEmail.mockResolvedValue({ id: 1 });
        codeRepository.findOne.mockResolvedValue(null);

        await expect(sendEmail("lucas@email.com", "register")).rejects.toMatchObject({ code: "CODE_NOT_FOUND" });
    });
    it("deve enviar email de registro", async () => {

        userRepository.findByEmail.mockResolvedValue({ id: 1 });

        codeRepository.findOne.mockResolvedValue({ code: "123456" });

        provider_sendEmail.mockResolvedValue(true);

        const result = await sendEmail( "lucas@email.com", "register");

        expect(provider_sendEmail).toHaveBeenCalledTimes(1);

        expect(result).toBe(true);
    });
    it("deve enviar email de forgotpass", async () => {

        userRepository.findByEmail.mockResolvedValue({ id: 1 });

        codeRepository.findOne.mockResolvedValue({ code: "123456" });

        provider_sendEmail.mockResolvedValue(true);

        const result = await sendEmail( "lucas@email.com", "forgot");

        expect(provider_sendEmail).toHaveBeenCalledTimes(1);

        expect(result).toBe(true);
    });
    it("deve enviar email de merge", async () => {

        userRepository.findByEmail.mockResolvedValue({ id: 1 });

        codeRepository.findOne.mockResolvedValue({ code: "123456" });

        provider_sendEmail.mockResolvedValue(true);

        const result = await sendEmail( "lucas@email.com", "merge");

        expect(provider_sendEmail).toHaveBeenCalledTimes(1);

        expect(result).toBe(true);
    });
    it("deve conter contexto válido", async () => {

        userRepository.findByEmail.mockResolvedValue({ id: 1 });

        codeRepository.findOne.mockResolvedValue({ code: "123456" });

        await expect(sendEmail("lucas@email.com", "teste")).rejects.toBeDefined();
    });
    it("deve lançar EmailError caso provider falhe", async () => {

        userRepository.findByEmail.mockResolvedValue({ id: 1 });

        codeRepository.findOne.mockResolvedValue({ code: "123456" });

        provider_sendEmail.mockRejectedValue(new Error("Erro externo"));

        await expect(sendEmail("lucas@email.com", "register")).rejects.toBeDefined();
    });
});