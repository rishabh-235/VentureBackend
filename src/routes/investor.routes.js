import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {getInvestors, registerInvestor } from "../controllers/investor.controllers.js";

const router = Router();

router.route("/register").post(
    verifyJWT,
    registerInvestor
)

router.route("/topinvestors").get(
    getInvestors
)

export default router;