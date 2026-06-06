import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as logRepository from "../repositories/logRepository.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function exportAndClearLogs() {
  try {
    const logs = await logRepository.findAny();

    if (logs.length === 0) return;

    const content = logs.map((l) => JSON.stringify(l)).join("\n");

    const exportDir = path.join(__dirname, "..", "exports", "logs");
    fs.mkdirSync(exportDir, { recursive: true });

    const filePath = path.join(exportDir, `logs_${Date.now()}.txt`);
    fs.writeFileSync(filePath, content, "utf8");

    await logRepository.deleteAll();

    console.log(`Exportados ${logs.length} logs para ${filePath}`);
  } catch (error) {
    console.error("Erro ao exportar/limpar logs:", error);
  }
}
