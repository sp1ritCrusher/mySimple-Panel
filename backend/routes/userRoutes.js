import express from "express";
import { getUser, registerUser, loginUser } from "../controllers/userController.js"

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/users", getUser);

export default router;
