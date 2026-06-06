import express from "express";
//middlewares
import { verifyToken } from "../middlewares/authMiddlewares.js";
import { isAdmin } from "../middlewares/adminMiddlewares.js";
import { checkRefresh, validateUser } from "../middlewares/authMiddlewares.js";
import { validateIntention } from "../middlewares/codeMiddlewares.js";

//controllers
import { changePassword, resetPassword, getUser, registerUser, loginUser, logoutUser, editData, oAuth_loginUser } from "../controllers/userController.js"
import { addProduct, getProductById, getProducts, updateProduct, deleteProduct } from "../controllers/productController.js";
import { renew_accessToken } from "../controllers/authController.js";
import { editUser, getUsers, removeUser, admin_getUser } from "../controllers/adminController.js";
import { getLogs, getLog } from "../controllers/logController.js";
import { validateCode, resendCode } from "../controllers/codeController.js";
import { system_Callback, resolveUser_Intention, oAuthCallback_Receiving } from "../controllers/systemController.js";

const router = express.Router();
//security code routes
router.post("/validateCode", validateIntention, validateCode);
router.get("/resendCode", validateIntention, resendCode);
//system routes
router.get("/callback/oauth", oAuthCallback_Receiving);
router.post("/callback", system_Callback);
router.post("/resolveIntention", resolveUser_Intention);
//auth routes
router.post("/auth/local", validateUser, loginUser);
router.post("/auth/google", oAuth_loginUser);
router.get("/refresh", checkRefresh, renew_accessToken);
//user routes
router.post("/register", registerUser);
router.post("/changePassword", verifyToken, changePassword);
router.post("/recoverPassword", verifyToken, resetPassword);
router.get("/users", verifyToken, getUser);
router.get("/users/:id", verifyToken, getUser);
router.get("/logout", verifyToken, logoutUser);
router.post("/edit", verifyToken, editData);
//products route
router.get("/products", verifyToken, getProducts);
router.post("/products/addproduct", verifyToken, addProduct);
router.get("/products/:id", verifyToken,getProductById);
router.put("/products/:id", verifyToken, updateProduct);
router.delete("/products/:id", verifyToken, deleteProduct);
//admin routes
router.get("/userControl", verifyToken, isAdmin, getUsers);
router.get("/userControl/:id", verifyToken, isAdmin, admin_getUser);
router.put("/userControl/:id", verifyToken, isAdmin, editUser);
router.delete("/userControl/:id", verifyToken, isAdmin, removeUser);
//log routes (admin only)
router.get("/logs", verifyToken, isAdmin, getLogs);
router.get("/logs/:id", verifyToken, isAdmin, getLog);

export default router;
