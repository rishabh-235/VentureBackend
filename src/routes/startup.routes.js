import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { getStatups, registerStartup } from "../controllers/startup.controller.js";

const router = Router();

router.route("/register").post(
    verifyJWT,
    registerStartup
)

router.route("/topfounders").get(
    getStatups
)


export default router;