import { describe, it, expect, vi, beforeEach } from "vitest";

beforeEach(() => {
  vi.resetAllMocks()
});

vi.mock("../repositories/logRepository.js", () => ({
    findByOrder: vi.fn(),
    findById: vi.fn()
}))

import * as logRepository from "../repositories/logRepository.js";
import { getAllLogs, getLog } from "../services/logServices.js";

describe("getAllLogs", () => {

    it("deve retornar todos os logs", async () => {
        logRepository.findByOrder.mockResolvedValue([
            { id: 1 },
            { id: 2 }
        ]);

        const result = await getAllLogs();

        expect(result).toEqual([
            { id: 1 },
            { id: 2 }
        ]);

        expect(logRepository.findByOrder).toHaveBeenCalledTimes(1);
    });

});

describe("getLog", () => {

    it("deve conter log válido", async () => {
        logRepository.findById.mockResolvedValue(null);

        await expect(getLog(1)).rejects.toMatchObject({ code: "NOT_FOUND" });
    });

    it("deve retornar log", async () => {
        logRepository.findById.mockResolvedValue({id: 1, action: "remove-user" });

        const result = await getLog(1);

        expect(result).toEqual({ id: 1, action: "remove-user" });

        expect(logRepository.findById).toHaveBeenCalledWith(1);
    });

});