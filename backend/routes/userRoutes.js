import express from "express";
//middlewares
import { verifyToken } from "../middlewares/verifyToken.js";
import { validateUser } from "../middlewares/validateUser.js";
//controllers
import {  changePassword, forgotPass, getUser, registerUser, loginUser, logoutUser, editData } from "../controllers/userController.js"
import { addProduct, getProductById, getProducts, updateProduct, deleteProduct } from "../controllers/productController.js";
import { checkRefresh } from "../controllers/authController.js";
import { editUser, getUsers, removeUser } from "../controllers/adminController.js";
import { getLogs, getLog } from "../controllers/logController.js";
import { validateCode, resendCode } from "../controllers/codeController.js";

const router = express.Router();
//security code routes
router.post("/validateCode", validateCode);
router.get("/resendCode", resendCode);
//system routes
router.post("/changePassword", changePassword);
router.post("/forgotPass", forgotPass);
//user routes
router.post("/register", registerUser);
router.post("/login", validateUser, loginUser);
router.get("/users", verifyToken, getUser);
router.get("/users/:id", verifyToken, getUser);
router.get("/logout", logoutUser);
router.post("/edit", verifyToken, editData);
//jwt route
router.get("/refresh", checkRefresh);
//products route
router.get("/products", verifyToken,getProducts);
router.post("/products/addproduct", addProduct);
router.get("/products/:id", verifyToken,getProductById);
router.put("/products/:id", verifyToken, updateProduct);
router.delete("/products/:id", verifyToken, deleteProduct);
//admin routes
router.get("/userControl", verifyToken, getUsers);
router.get("/userControl/:id", verifyToken, getUser);
router.put("/userControl/:id", verifyToken, editUser);
router.delete("/userControl/:id", verifyToken, removeUser);
//log routes
router.get("/logs", verifyToken, getLogs);
router.get("/logs/:id", verifyToken, getLog);
export default router;
