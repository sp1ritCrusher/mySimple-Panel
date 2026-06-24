import { describe, it, expect, vi, beforeEach } from "vitest";

beforeEach(() => {
  vi.resetAllMocks()
});

vi.mock("../repositories/userRepository.js", () => ({
    findById: vi.fn(),
    findConflicts: vi.fn(),
    update: vi.fn(),
    deleteById: vi.fn()
}))

import * as userRepository from "../repositories/userRepository.js";
import { editUser, removeUser } from "../services/adminServices.js";

describe("editUser", () => {
    it("Deve conter usuário válido", async () => {
        userRepository.findById.mockResolvedValue(null);
        const data = { 
            name: "usuario",
            email: "usuario@email.com",
            phone: "01234567890"
        }
        await expect(editUser(1, { data: data })).rejects.toMatchObject({ code: "INVALID_USER" });
    });
    it("deve lançar erro quando email ou telefone pertencerem a outro usuário", async () => {
        userRepository.findById.mockResolvedValue({ id: 1, email: "lucas@email.com", phone: "111111111" });
        userRepository.findConflicts.mockResolvedValue([{ email: "usuario@email.com", phone: "01234567890" }]);
        const data = { 
            name: "usuario",
            email: "usuario@email.com",
            phone: "01234567890"
        }
        await expect(editUser(1, { data: data })).rejects.toMatchObject({ code: "DATA_CONFLICT" });

    });
    it("deve atualizar e retornar usuário", async () => {
        userRepository.findById.mockResolvedValue({ id: 1, email: "lucas@email.com", phone: "111111111" });
        userRepository.findConflicts.mockResolvedValue([{ email: null, phone: null }]);
        userRepository.update.mockResolvedValue({ name: "usuario", email: "usuario@email.com", phone: "01234567890" });
        const data = { 
            name: "usuario",
            email: "usuario@email.com",
            phone: "01234567890"
        }
        const result = await editUser(1, { data: data });
        expect(userRepository.update).toHaveBeenCalledWith(1, { name: "usuario", email: "usuario@email.com", phone: "01234567890" });
        expect(result).toEqual({ name: "usuario", email: "usuario@email.com", phone: "01234567890" });
    })
});

describe("removeUser", () => {
    it("Deve conter requisidor válido", async () => {
        userRepository.findById.mockResolvedValue(null);
        await expect(removeUser(1, 1)).rejects.toMatchObject({ code: "INVALID_USER" });
    });
    it("Deve conter usuário válido", async () => {
        userRepository.findById.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 2 });
        await expect(removeUser(1, 2)).rejects.toMatchObject({ code: "INVALID_USER" });
    });
    it("Deve impedir auto remoção", async () => {
        userRepository.findById.mockResolvedValueOnce({id: 1}).mockResolvedValueOnce({ id: 1 });
        await expect(removeUser(1, 1)).rejects.toMatchObject({ code: "BAD_REQUEST" });
    });
    it("Deve remover usuário", async () => {
        userRepository.findById.mockResolvedValueOnce({id: 1}).mockResolvedValueOnce({ id: 2 });
        userRepository.deleteById.mockResolvedValue({ id: 2})
        await expect(removeUser(1, 2)).toBeDefined();
    });
});