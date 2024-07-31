import { Startup } from "../models/startup.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const registerStartup = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty for all
  // check if user already exist: username, email
  // check for images, check for avatar
  // upload them to cloudinary
  // create user object - creation entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res.

  const {
    companyname,
    description,
    funding,
    capitalRaised,
    industry,
    address,
    other,
    website,
  } = req.body;

  const founder = req.user._id;
  console.log(req.body)

  if (
    [companyname, funding, capitalRaised, industry, address, website].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  console.log(req.files)

  // const imageLocalPath = req.files?.image[0]?.path;
  // const videoLocalPath = req.files?.video[0]?.path;
  // const legalDocumentLoacalPath = req.files?.legalDocument[0]?.path;

  // if (!imageLocalPath || !videoLocalPath || !legalDocument) {
  //   throw new ApiError(400, "ImageLocal file is required");
  // }

  // // uploading to cloudinary
  // const image = await uploadOnCloudinary(imageLocalPath);
  // const video = await uploadOnCloudinary(videoLocalPath);
  // const legalDocument = await uploadOnCloudinary(legalDocumentLoacalPath);

  // if (!image || !video || !legalDocument) {
  //   throw new ApiError(400, "Image file is required");
  // }

  //creating object and saving to database
  const startup = await Startup.create({
    image: req.body.files[0],
    legalDocument:req.body.files[1],
    companyname,
    founder,
    funding,
    address,
    capitalRaised,
    industry,
    website,
    description: description || "",
    other: other || "",
  });

  const createdStartup = await Startup.findById(startup._id);

  if (!createdStartup) {
    throw new ApiError(500, "Something went wrong while registring the user.");
  }

  user.isFounder = true
  await user.save();

  return res
    .status(201)
    .json(
      new ApiResponse(200, createdStartup, "Startup Registred Succesfully")
    );
});

const getStatups = asyncHandler(async (req, res) => {
  const startups = await Startup.find();
  // console.log(startups)

  return res
    .status(201)
    .json(
      new ApiResponse(200, startups, "Investor Registred Succesfully")
    );
});

export { registerStartup, getStatups };