import { instance } from "../utils/razorpay.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import crypto from 'crypto';

const checkout = async (req, res) => {
  const options = {
    amount: Number(req.body.amount * 100),
    currency: "INR",
  };
  const order = await instance.orders.create(options);

  return res
    .status(200)
    .json(new ApiResponse(200, order, "order created successfully!"));
};

const paymentVarification = async (req, res) => {
  const { razorpay_order_id, razorpay_signature, razorpay_payment_id } = req.body;

  function generateSignature(razorpay_order_id, razorpay_payment_id, secret) {
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    return hmac.digest("hex");
  }

  const secret = process.env.RAZORPAY_API_SECRET;

  const generated_signature = generateSignature(
    razorpay_order_id,
    razorpay_payment_id,
    secret
  );

  let response = {};

  if (generated_signature == razorpay_signature) {
    res.redirect("http://localhost:3000/pitch");
  } else {
    response = { "signatureValid": "false" };
    return res.status(200).json(new ApiResponse(200, response, "Verified!"));
  }

  
};

export { checkout, paymentVarification };
