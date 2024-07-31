import { Router } from "express";
import {checkout , paymentVarification}from "../controllers/payment.controller.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const router = Router();

router.route("/buyShares").post(checkout);
router.route("/paymentverification").post( paymentVarification);
router.route("/getkey").get((req, res)=>{
    res.status(200).json(new ApiResponse(200, {key:process.env.RAZORPAY_API_KEY}, "valid API key"));
})

export default router;