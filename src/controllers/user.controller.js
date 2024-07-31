import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const genrateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.genrateAccessToken();
    const refreshToken = user.genrateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      error
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
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
    fullname,
    email,
    password,
  } = req.body;

  if (
    [fullname, email, password,].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already existed");
  }

  // const avatarLocalPath = req.files?.avatar[0]?.path;

  // if (!avatarLocalPath) {
  //   throw new ApiError(400, "AvatarLocal file is required");
  // }

  //uploading to cloudinary
  // const avatar = await uploadOnCloudinary(avatarLocalPath);

  // if (!avatar) {
  //   throw new ApiError(400, "Avatar file is required");
  // }

  //creating object and saving to database
  const user = await User.create({
    fullname,
    // avatar: avatar.url,
    email: email.toLowerCase(),
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const { accessToken, refreshToken } = await genrateAccessAndRefreshTokens(
    user._id
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registring the user.");
  }

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax'
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, createdUser, "User Registred Succesfully."));
});

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email varify username or email
  // find the user
  // password verification
  // access and refresh token genration
  // send cookies

  const { email, password } = req.body;
  // console.log(req);

  //if(!(username || email)){
  if (!email) {
    throw new ApiError(400, "email is required");
  }

  // here "$or" is used to check multiple attributes in the database.
  const user = await User.findOne({email});

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  const { accessToken, refreshToken } = await genrateAccessAndRefreshTokens(
    user._id
  );

  // getting the updated current user.
  // the user variable holding the unmodified user in which refreshtoken is not updated.
  // that's why we are again accessing the database to get the updated data of the current user.
  // this method can be expensive because we are access database.
  // But this problem can be solve by other methods also.
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // the cookies can be modifid and access by any one at the frontend.
  // to avoid that to happen we make a "option" object and define these two field.
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax'
  };

  // sending these tokens to the backend as cookies.
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user,
          loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged In successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  try {
    // No need to update the user document to remove the refresh token
    // Just clear the cookies
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax'
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, "User logged out"));
  } catch (error) {
    console.error("Error logging out user:", error);
    return res.status(500).json(new ApiError(500, "Internal Server Error"));
  }
});


const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request");
  }


  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id);

    
    if (!user || incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    const { accessToken, refreshToken } = await genrateAccessAndRefreshTokens(user._id);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(new ApiResponse(200, { accessToken, refreshToken }));
  } catch (error) {
    throw new ApiError(401, error.message || "Invalid Refresh Token");
  }
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, phone, address } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        avatar: req.body.files[0],
        phone,
        address
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details update successfully"));
});

const followUser = asyncHandler(async (req, res) => {
  const followerId = req.user._id; // ID of the user initiating the follow action
  const userId = req.body.user_id; // ID of the user being followed

  // Update the user who is initiating the follow action (req.user)
  const followerUser = await User.findById(followerId);

  if (!followerUser) {
    throw new ApiError(404, "Follower not found.");
  }

  followerUser.following.push(userId); // Add the followed user to the follower's following list
  await followerUser.save(); // Save the updated follower user

  // Update the user being followed (user_id)
  const followedUser = await User.findById(userId);
  if (!followedUser) {
    throw new ApiError(404, "User being followed not found.");
  }
  followedUser.follower.push(followerId); // Add the follower to the followed user's followers list
  await followedUser.save(); // Save the updated followed user

  res.status(200).json(new ApiResponse(200, null, "User followed successfully."));
});

const unfollowUser = asyncHandler(async (req, res) => {
  const followerId = req.user._id.toString(); // ID of the user initiating the unfollow action
  const userId = req.body.user_id; // ID of the user being unfollowed

  // Update the user who is initiating the unfollow action (req.user)
  const followerUser = await User.findById(followerId);

  if (!followerUser) {
    throw new ApiError(404, "Follower not found.");
  }

  // Remove the user being unfollowed from the follower's following list
  followerUser.following = followerUser.following.filter(id => id.toString() !== userId);
  await followerUser.save(); // Save the updated follower user

  // Update the user being unfollowed (user_id)
  const followedUser = await User.findById(userId);
  if (!followedUser) {
    throw new ApiError(404, "User being unfollowed not found.");
  }

  // Remove the follower from the followed user's followers list
  followedUser.follower = followedUser.follower.filter(id => id.toString() !== followerId);
  await followedUser.save(); // Save the updated followed user

  res.status(200).json(new ApiResponse(200, null, "User unfollowed successfully."));
});

export { registerUser, loginUser, logoutUser, refreshAccessToken, updateAccountDetails, followUser, unfollowUser, genrateAccessAndRefreshTokens};