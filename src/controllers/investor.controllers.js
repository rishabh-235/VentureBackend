import { Investor } from "../models/investor.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";

const registerInvestor = asyncHandler(async (req, res) => {
  // Destructure necessary fields from the request body
  const {
    aadhar,
    panCard,
    website,
    networth,
    annualincome,
    investmentlimit,
    legalfirstname,
    legallastname,
    legalmiddlename,
    dob,
    nationality,
    birthcountry,
    birthcity,
  } = req.body;

  // Get the user from the request, typically attached by authentication middleware
  const userId = req.user._id;

  try {
    // Create a new investor entry in the database
    const investor = await Investor.create({
      aadhar,
      panCard,
      user: userId,
      website,
      networth,
      annualincome,
      investmentlimit,
      legalfirstname,
      legallastname,
      legalmiddlename,
      dob,
      nationality,
      birthcountry,
      birthcity,
    });

    // Find the created investor to ensure it was saved successfully
    const createdInvestor = await Investor.findById(investor._id).populate(
      "user"
    );

    if (!createdInvestor) {
      throw new ApiError(
        500,
        "Something went wrong while registering the user."
      );
    }

    // Update the user document to set the isInvestor flag to true
    const user = await User.findById(userId);
    user.isInvestor = true;
    user.investorid = investor._id;
    await user.save();

    // Return the created investor as a response
    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          createdInvestor,
          "Investor Registered Successfully"
        )
      );
  } catch (error) {
    // Handle any errors that occurred during the process
    return res
      .status(error.statusCode || 500)
      .json(new ApiResponse(error.statusCode || 500, null, error.message));
  }
});

const getInvestors = asyncHandler(async (req, res) => {
  const investors = await Investor.find().populate("user", "avatar fullname");
  return res
    .status(201)
    .json(new ApiResponse(200, investors, "Investor Registred Succesfully"));
});

const updateInvestor = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    // If user is not an investor, register them first
    if (!req.user.isInvestor) {
      return registerInvestor(req, res);
    }

    let {
      aadhaar,
      panCard,
      website,
      networth,
      annualincome,
      investmentlimit,
      legalfirstname,
      legallastname,
      legalmiddlename,
      dob,
      nationality,
      birthcountry,
      birthcity,
      accreditedinvestor,
    } = req.body;

    // Remove any undefined or null values
    const updateData = {};
    Object.keys(req.body).forEach((key) => {
      if (
        req.body[key] !== undefined &&
        req.body[key] !== null &&
        req.body[key] !== ""
      ) {
        updateData[key] = req.body[key];
      }
    });

    // Handle empty dob field
    if (dob === "") {
      const preInvestor = await Investor.findById(req.user?.investorid);
      updateData.dob = preInvestor?.dob;
    }

    const updatedInvestor = await Investor.findByIdAndUpdate(
      req.user.investorid,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("user", "firstname lastname email avatar");

    if (!updatedInvestor) {
      throw new ApiError(404, "Investor profile not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedInvestor,
          "Investor profile updated successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error updating investor profile");
  }
});

export { registerInvestor, getInvestors, updateInvestor };
