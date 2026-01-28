import { Router } from "express";

import dashcontroller from "../controllers/dash.controller.js";
import { verificToken } from "../middlewares/auth.middleware.js";

const router = Router();



router.get("/", verificToken, dashcontroller);




export default router;