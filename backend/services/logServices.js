import * as logRepository from "../repositories/logRepository.js";
import { LogError } from "../errors/AppError.js";

export async function getAllLogs() {
  return await logRepository.findByOrder();
}

export async function getLog(logid) {
    const result = await logRepository.findById(logid);
    if(!result) {
        throw new LogError({ 
            message: `Log ID ${logid} não encontrado`,
            status: 404,
            code: "NOT_FOUND" });
        }
    return result;
}