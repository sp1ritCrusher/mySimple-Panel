import 'dotenv/config';
import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import cron from "node-cron"; 
import { errorHandler } from "./middlewares/errorHandler.js";
import { exportAndClearLogs } from "./jobs/logJobs.js";

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_ORIGINS = (process.env.FRONTEND_URL || "http://localhost:5173,http://127.0.0.1:5500")
  .split(",")
  .map((o) => o.trim());

app.use(cors({
  origin(origin, callback) {
    if (!origin || FRONTEND_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS bloqueado para origem: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use("/", userRoutes);
app.use(errorHandler);

cron.schedule("0 0 */7 * *", exportAndClearLogs);

const HOST = process.env.HOST || "localhost";
app.listen(PORT, HOST, () =>
  console.log(`Server running on http://${HOST}:${PORT}`)
);

export default app;
