import 'dotenv/config';
console.log("JWT_Secret loaded:", !!process.env.JWT_SECRET);
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import userRoutes from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";


const app = express();
const PORT = 3000;

app.use(cors({
  origin: "http://127.0.0.1:5500",
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
connectDB();
app.use("/", userRoutes);


app.listen(PORT, "127.0.0.1", () =>
  console.log(`Server running on http://127.0.0.1:${PORT}`)
);
