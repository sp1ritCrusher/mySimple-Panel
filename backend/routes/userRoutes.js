import express from "express";
import { getUser, registerUser, loginUser } from "../controllers/userController.js"
import { verifyToken } from "../middlewares/verifyToken.js";
import { checkRefresh } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", verifyToken, getUser);
router.get("/refresh", checkRefresh);
export default router;
