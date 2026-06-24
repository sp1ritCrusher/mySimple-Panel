import { describe, it, expect, vi, beforeEach } from "vitest";

beforeEach(() => {
  vi.resetAllMocks()
});

vi.mock("../repositories/userRepository.js", () => ({
    findById: vi.fn()
}))

vi.mock("../services/codeServices.js", () => ({
    setCode_byIntention: vi.fn()
}))

import * as userRepository from "../repositories/userRepository.js";
import * as codeServices from "../services/codeServices.js";
import { get_callbackResponse } from "../services/systemServices.js";

describe("get_callbackResponse", () => {

    it("deve conter usuário válido", async () => {
        userRepository.findById.mockResolvedValue(null);

        await expect(get_callbackResponse(1, "USER_GOOGLE_REGISTERED")).rejects.toMatchObject({ code: "USER_NOT_FOUND" });
    });

    it("deve conter código válido", async () => {
        userRepository.findById.mockResolvedValue({ id: 1 });

        await expect(get_callbackResponse(1, "teste")).rejects.toMatchObject({ code: "INVALID_CODE" });
    });

    it("deve retornar callback USER_GOOGLE_REGISTERED", async () => {
        userRepository.findById.mockResolvedValue({ id: 1 });

        codeServices.setCode_byIntention.mockResolvedValue("token");

        const result = await get_callbackResponse(
            1,
            "USER_GOOGLE_REGISTERED"
        );

        expect(codeServices.setCode_byIntention).toHaveBeenCalledWith(1, "merge");

        expect(result).toEqual({
            message: "Usuário registrado pelo Google",
            intentionToken: "token"
        });
    });

    it("deve retornar callback USER_LOCAL_REGISTERED", async () => {
        userRepository.findById.mockResolvedValue({ id: 1 });

        codeServices.setCode_byIntention.mockResolvedValue("token");

        const result = await get_callbackResponse(
            1,
            "USER_LOCAL_REGISTERED"
        );

        expect(codeServices.setCode_byIntention).toHaveBeenCalledWith(1,"merge");

        expect(result).toEqual({
            message: "Usuário registrado localmente",
            intentionToken: "token"
        });
    });

    it("deve retornar callback PROVIDER_NOT_VALIDATED", async () => {
        userRepository.findById.mockResolvedValue({ id: 1 });

        codeServices.setCode_byIntention.mockResolvedValue("token");

        const result = await get_callbackResponse(
            1,
            "PROVIDER_NOT_VALIDATED"
        );

        expect(codeServices.setCode_byIntention).toHaveBeenCalledWith(1,"validate_provider");

        expect(result).toEqual({
            message: "Provedor não validado",
            intentionToken: "token"
        });
    });

});