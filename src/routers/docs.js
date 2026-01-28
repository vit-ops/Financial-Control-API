import { Router } from "express";
import { verificToken } from "../middlewares/auth.middleware.js";
import {GetCollectionVerific, verifyCollectionAdd, VerifyRenameCollection} from "../middlewares/docs.middleware.js"
import { getcollection, addCollection, deleteCollection, renameCollection} from "../controllers/docs.controller.js";
const router = Router();

router.get("/get/collection/:name", verificToken, GetCollectionVerific, getcollection);

router.post("/post/collection/:name", verificToken, verifyCollectionAdd, addCollection);

router.delete("/delete/collection/:name", verificToken, GetCollectionVerific, deleteCollection);

router.patch("/patch/collection/:name", verificToken, VerifyRenameCollection, renameCollection);

export default router;