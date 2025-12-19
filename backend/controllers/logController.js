import { Log } from "../models/Logs.js"
import fs from "fs";
import path from "path";

export const getLogs = async (req, res) => {
  try {
    const result = await Log.find().sort({ date: -1 });
    res.status(200).json({ message: "Logs encontrados", logs: result });
  } catch (error) {
    console.error("Erro: ", error);
    res.status(500).json({ message: "Erro ", error });
  }
};

export const getLog = async(req, res) => {
  const log = req.params.id;
  try{
    const result = await Log.findById(log);
    return res.status(200).json({ message: `log: ${log} encontrado`, log: result })
  } catch(error) {
    return res.status(500).json({message: "Erro", error})
  }
};

export async function exportAndClearLogs() {
  try {
    const logs = await Log.find();

    if (logs.length === 0) return;

    const content = logs.map(l => JSON.stringify(l)).join("\n");

    const filePath = path.join(__dirname, "logs", `logs_${Date.now()}.txt`);

    fs.writeFileSync(filePath, content, "utf8");

    await Log.deleteMany({});
    
    console.log(`Exportados ${logs.length} logs para ${filePath}`);
  } catch (err) {
    console.error("Erro ao exportar/apagar logs:", err);
  }
}
