import { LogError } from "../errors/AppError.js";
import * as logServices from "../services/logServices.js";
import * as logRepository from "../repositories/logRepository.js";

export const getLogs = async (req, res) => {
    const logs = await logServices.getAllLogs();
    res.status(200).json({ message: "Logs encontrados", logs });
  }

export const getLog = async(req, res) => {
  const log = req.params.id;
  const result = await logServices.getLog(log);
  return res.status(200).json({ message: `log: ${log} encontrado`, log: result })
  } 

