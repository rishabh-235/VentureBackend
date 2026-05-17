import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { getStatups, registerStartup, editStartup, getMyStartup, getStartupById, uploadFile} from "../controllers/startup.controller.js";

const router = Router();

router.route("/register").post(verifyJWT,registerStartup)
router.route("/topfounders").get(getStatups)
router.route("/editpitch").post(verifyJWT,editStartup)
router.route("/mystartup").get(verifyJWT,getMyStartup)
router.route("/upload").post(verifyJWT,upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'logo', maxCount: 1 }
]),uploadFile)
router.route("/:id").get(getStartupById)


export default router;