import { Investor } from "../models/investor.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";

const registerInvestor = asyncHandler(async (req, res) => {
  // Destructure necessary fields from the request body
  const { aadhar, panCard, bio, about, experties, website } = req.body;

  // Get the user from the request, typically attached by authentication middleware
  const userId = req.user._id;

  try {
    // Create a new investor entry in the database
    const investor = await Investor.create({
      aadhar,
      panCard,
      user: userId,
      bio,
      about,
      experties,
      website,
    });

    // Find the created investor to ensure it was saved successfully
    const createdInvestor = await Investor.findById(investor._id).populate('user');

    if (!createdInvestor) {
      throw new ApiError(500, "Something went wrong while registering the user.");
    }

    // Update the user document to set the isInvestor flag to true
    const user = await User.findById(userId);
    user.isInvestor = true;
    await user.save();

    // Return the created investor as a response
    return res.status(201).json(new ApiResponse(201, createdInvestor, "Investor Registered Successfully"));
  } catch (error) {
    // Handle any errors that occurred during the process
    return res.status(error.statusCode || 500).json(new ApiResponse(error.statusCode || 500, null, error.message));
  }
});


const getInvestors = asyncHandler(async(req, res) => {
    const investors = await Investor.find().populate('user', 'avatar fullname');  
    return res
      .status(201)
      .json(
        new ApiResponse(200, investors, "Investor Registred Succesfully")
      );
})

export { registerInvestor, getInvestors };
