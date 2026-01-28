import { Router } from "express";
import { Login, Register } from "../controllers/auth.controller.js";
import { validateLogin, validateRegister } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", validateLogin, Login);

router.post("/register", validateRegister, Register);

export default router;
