import express from "express";
import { getUser, registerUser, loginUser, logoutUser, editData } from "../controllers/userController.js"
import { addProduct, getProductById, getProducts, updateProduct, deleteProduct } from "../controllers/productController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { checkRefresh } from "../controllers/authController.js";
import { editUser, getUsers, removeUser } from "../controllers/adminController.js";
import { getLogs, getLog } from "../controllers/logController.js";
import { changePassword } from "../controllers/systemController.js"; 

const router = express.Router();
//system routes
router.post("/changePassword", changePassword);
//user routes
router.post("/register", registerUser);
router.post("/login", loginUser);
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
