import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
connectDB();
app.use("/", userRoutes);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
