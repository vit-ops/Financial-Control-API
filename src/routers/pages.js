import { Router } from "express";

import homeController from "../controllers/home.controller.js"
import { verificToken } from "../middlewares/auth.middleware.js";

const router = Router();



router.get("/", verificToken, homeController);




export default router;