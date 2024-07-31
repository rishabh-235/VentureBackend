import { instance } from "../utils/razorpay.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const checkout = async (req, res) => {
    const options = {
        amount: Number(req.body.amount * 100),
        currency: "INR",
    };
    const order = await instance.orders.create(options);

    return res
    .status(200)
    .json(
      new ApiResponse(200, order, "order created successfully!")
    );
};

const paymentVarification = async (req, res) => {

    return res
    .status(200)
    .json(
      new ApiResponse(200, order, "Verified!")
    );
};

export { checkout, paymentVarification };