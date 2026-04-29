import fs from "fs";
import path from "path";
import { LogError } from "../errors/AppError.js";
import * as logRepository from "../repositories/logRepository.js"

export const getLogs = async (req, res) => {
  try {
    const result = await logRepository.findByOrder();
    if(!result) {
      throw new LogError({ 
        message: `Erro ao encontrar logs`,
        status: 404,
        code: "NOT_FOUND" });
      }
    res.status(200).json({ message: "Logs encontrados", logs: result });
  } catch (error) {
      console.error("Erro: ", error);
      if (error instanceof AppError) {
        return res.status(error.status).json({
          code: error.code,
          message: error.message,
        });
      }
      return res.status(500).json({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro interno no servidor",
      });
}
}

export const getLog = async(req, res) => {
  const log = req.params.id;
  try{
    const result = await logRepository.findById(log);
    if(!result) {
      throw new LogError({ 
        message: `Log ID ${log} não encontrado`,
        status: 404,
        code: "NOT_FOUND" });
      }
    return res.status(200).json({ message: `log: ${log} encontrado`, log: result })
  } catch(error) {
      console.error("Erro: ", error);
      if (error instanceof AppError) {
        return res.status(error.status).json({
          code: error.code,
          message: error.message,
        });
      }
      return res.status(500).json({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro interno no servidor",
      });
  }
};

export async function exportAndClearLogs() {
  try {
    const logs = await logRepository.findAny();

    if (logs.length === 0) return;

    const content = logs.map(l => JSON.stringify(l)).join("\n");

    const filePath = path.join(__dirname, "logs", `logs_${Date.now()}.txt`);

    fs.writeFileSync(filePath, content, "utf8");

    await Log.deleteMany({});
    
    console.log(`Exportados ${logs.length} logs para ${filePath}`);
  } catch (error) {
      console.error("Erro: ", error);
      if (error instanceof AppError) {
        return res.status(error.status).json({
          code: error.code,
          message: error.message,
        });
      }
      return res.status(500).json({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro interno no servidor",
      });
  }
}
