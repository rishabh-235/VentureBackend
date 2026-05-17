import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {getInvestors, registerInvestor, updateInvestor } from "../controllers/investor.controllers.js";

const router = Router();

router.route("/register").post(
    verifyJWT,
    registerInvestor
)

router.route("/topinvestors").get(
    getInvestors
)

router.route("/updateinvestor").post(verifyJWT, updateInvestor)

export default router;