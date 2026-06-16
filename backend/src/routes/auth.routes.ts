import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { upload } from "../middlewares/upload.middleware";

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post("/register", upload.single("profileImage"), authController.register);
authRoutes.post("/login", authController.login);

export { authRoutes };