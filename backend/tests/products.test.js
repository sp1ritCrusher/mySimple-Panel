import { describe, it, expect, vi, beforeEach } from "vitest";

beforeEach(() => {
  vi.resetAllMocks()
});

vi.mock("../repositories/userRepository.js", () => ({
    findById: vi.fn()
}))

vi.mock("../repositories/productRepository.js", () => ({
    findByName: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    removebyId: vi.fn(),
    findAny: vi.fn()
}))


import { addProduct, editProduct, deleteProduct, getProducts } from "../services/productServices";
import * as userRepository from "../repositories/userRepository.js";
import * as productRepository from "../repositories/productRepository.js";

describe("addProduct", () => {
    it("deve conter usuário válido", async () => {
        userRepository.findById.mockResolvedValue(null);
        const data = { 
            name: "Produto",
            description: "Descrição",
            price: 10,
            amount: 10
        }
        await expect(addProduct({ data: data, userid: 1 })).rejects.toMatchObject({ code: "INVALID_USER" });
    });
    it("não devem contem produtos com o mesmo nome", async () => {

        userRepository.findById.mockResolvedValue(1);
        productRepository.findByName.mockResolvedValue("produto");
        const data = { 
            name: "produto",
            description: "Descrição",
            price: 10,
            amount: 10
        }
        await expect(addProduct({ data: data, userid: 1 })).rejects.toMatchObject({ code: "PRODUCT_ALREADY_EXISTS" });
    });
    it("deve criar e retornar produto válido", async () => {

        userRepository.findById.mockResolvedValue({ id: 1 });
        productRepository.findByName.mockResolvedValue(null);
        productRepository.create.mockResolvedValue({ id: 1, name: "produto" });
        const data = { 
            name: "produto",
            description: "Descrição",
            price: 10,
            amount: 10
        }
        const result = await addProduct({ data: data, userid: 1 });
        expect(result).toEqual({ id: 1, name: "produto" });
        expect(productRepository.create).toHaveBeenCalledWith({
            user_id: 1,
            name: "produto",
            description: "Descrição",
            price: 10.00,
            amount: 10, 
            code: expect.any(String)
        })
    });
});

describe("editProduct", () => {
    it("deve conter usuário válido", async () => {
        userRepository.findById.mockResolvedValue(null);
        productRepository.findById.mockResolvedValue({ id: 1, user_id: 1});
        const newData = {
            name: "novo nome",
            description: "nova descrição",
            price: 10,
            amount: 10
        }
        await expect(editProduct(1, 1, newData)).rejects.toMatchObject({ code: "INVALID_USER" });
    });
    it("deve conter produto existente", async () => {
        userRepository.findById.mockResolvedValue({ id: 1 });
        productRepository.findById.mockResolvedValue(null);
        const newData = {
            name: "novo nome",
            description: "nova descrição",
            price: 10,
            amount: 10
        }
        await expect(editProduct(1, 1, newData)).rejects.toMatchObject({ code: "PRODUCT_NOT_FOUND" });
    });
    it("deve validar permissões(userid equivalentes)", async () => {
        userRepository.findById.mockResolvedValue({ id: 1 });
        productRepository.findById.mockResolvedValue({id: 1, user_id: 2});
        const newData = {
            name: "novo nome",
            description: "nova descrição",
            price: 10,
            amount: 10
        }
        await expect(editProduct(1, 1, newData)).rejects.toMatchObject({ code: "FORBIDDEN" });
    });
    it("deve validar permissões(role admin)", async () => {
        userRepository.findById.mockResolvedValue({ id: 1, power: "admin" });
        productRepository.findById.mockResolvedValue({ id: 1, user_id: 2});
        productRepository.update.mockResolvedValue({ id: 1, name: "produto" });
        const newData = {
            name: "novo nome",
            description: "nova descrição",
            price: 10,
            amount: 10
        }
        const result = await editProduct(1, 1, newData);
        await expect(result).toBeDefined();
    });
    it("deve atualizar e retornar produto", async () => {
        userRepository.findById.mockResolvedValue({ id: 1 });
        productRepository.findById.mockResolvedValue({ id: 1, user_id: 1});
        productRepository.update.mockResolvedValue({
            id: 1,
            name: "novo nome"
        });
        const newData = {
            name: "novo nome",
            description: "nova descrição",
            price: 10,
            amount: 10
        }
        const result = await editProduct(1, 1, newData); 
        expect(result).toEqual({ id: 1, name: "novo nome" });
        expect(productRepository.update).toHaveBeenCalledWith(1, {
            name: "novo nome",
            description: "nova descrição",
            price: 10,
            amount: 10, 
        })
    });
});

describe("deleteProduct", () => {
    it("deve conter usuário válido", async () => {
        userRepository.findById.mockResolvedValue(null);
        productRepository.findById.mockResolvedValue({ id: 1, user_id: 1});
        await expect(deleteProduct(1, 1)).rejects.toMatchObject({ code: "INVALID_USER" });
    });
    it("deve conter produto existente", async () => {
        userRepository.findById.mockResolvedValue({ id: 1 });
        productRepository.findById.mockResolvedValue(null);
        await expect(deleteProduct(1, 1)).rejects.toMatchObject({ code: "PRODUCT_NOT_FOUND" });
    });
    it("deve validar permissões(userid equivalentes)", async () => {
        userRepository.findById.mockResolvedValue({ id: 1 });
        productRepository.findById.mockResolvedValue({id: 1, user_id: 2});

        await expect(deleteProduct(1, 1)).rejects.toMatchObject({ code: "FORBIDDEN" });
    });
    it("deve validar permissões(role admin)", async () => {
        userRepository.findById.mockResolvedValue({ id: 1, power: "admin" });
        productRepository.findById.mockResolvedValue({ id: 1, user_id: 2});
        productRepository.removebyId.mockResolvedValue({ id: 1 });
        const result = await deleteProduct(1, 1);
        await expect(result).toBeDefined();
    });
    it("deve remover e retornar produto", async () => {
        userRepository.findById.mockResolvedValue({ id: 1 });
        productRepository.findById.mockResolvedValue({ id: 1, user_id: 1});
        productRepository.removebyId.mockResolvedValue({ id: 1 });

        const result = await deleteProduct(1, 1); 
        expect(result).toEqual({ id: 1 });
        expect(productRepository.removebyId).toHaveBeenCalledWith(1);
    });
});
describe("getProducts", () => {
    it("deve conter usuário válido", async () => {
        userRepository.findById.mockResolvedValue(null);
        await expect(getProducts(1)).rejects.toMatchObject({ code: "INVALID_USER" });
    });
    it("deve retornar listagem de produtos referentes ao userid", async () => {
        userRepository.findById.mockResolvedValue({id: 1 });
        productRepository.findAny.mockResolvedValue({ id: 1 });
        const result = await getProducts(1);
        expect(result).toEqual( { id: 1 });
    });
});