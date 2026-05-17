import { Startup } from "../models/startup.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

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
    category,
    address,
    other,
    website,
  } = req.body;

  const founder = req.user._id;

  if (
    [companyname, funding, capitalRaised, category, address, website].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // const imageLocalPath = req.files?.image[0]?.path;
  // const videoLocalPath = req.files?.video[0]?.path;
  // const legalDocumentLoacalPath = req.files?.legalDocument[0]?.path;

  // if (!imageLocalPath || !videoLocalPath || !legalDocument) {
  //   throw new ApiError(400, "ImageLocal file is required");
  // }

  // uploading to cloudinary
  // const image = await uploadOnCloudinary(imageLocalPath);
  // const video = await uploadOnCloudinary(videoLocalPath);
  // const legalDocument = await uploadOnCloudinary(legalDocumentLoacalPath);

  // if (!image || !video || !legalDocument) {
  //   throw new ApiError(400, "Image file is required");
  // }

  //creating object and saving to database
  const startup = await Startup.create({
    founder,
    pitch: {
      basics: {
        companyname,
        category,
        address,
        links: {
          website,
        },
        description,
      },
    },
    raise: {
      fundingGoals: {
        maximumRaise: funding,
        capitalRaisedPreviously: capitalRaised,
      },
    },
    other,
  });

  const createdStartup = await Startup.findById(startup._id);

  if (!createdStartup) {
    throw new ApiError(500, "Something went wrong while registring the user.");
  }

  req.user.isFounder = true;
  await req.user.save();

  return res
    .status(201)
    .json(
      new ApiResponse(200, createdStartup, "Startup Registred Succesfully")
    );
});

const getStatups = asyncHandler(async (req, res) => {
  const startups = await Startup.find();

  return res
    .status(201)
    .json(new ApiResponse(200, startups, "Investor Registred Succesfully"));
});

const editStartup = asyncHandler(async (req, res) => {
  const founderId = req.user._id;
  
  try {
    // Find existing startup
    let startup = await Startup.findOne({ founder: founderId });

    if (!startup) {
      throw new ApiError(404, "Startup not found! Please register your startup first.");
    }

    // Extract data from different sections
    const basicData = req.body.basic?.textData || {};
    const contractData = req.body.contract?.textData || {};
    const pitchData = req.body.pitch?.textData || {};
    const highlightsData = req.body.highlights?.textData || {};
    const perksData = req.body.perks?.textData || {};
    const fundingData = req.body.fundingGoals?.textData || {};
    const discoverabilityData = req.body.discoverability?.textData || {};
    const extraData = req.body.extra?.textData || {};

    // Process highlights and perks arrays
    const highlights = Object.values(highlightsData).filter(val => val && val.trim() !== '');
    const perksArray = Object.entries(perksData)
      .filter(([key, value]) => value && value.trim() !== '')
      .map(([key, value]) => ({ investOver: 0, toReceive: value }));

    // Build update object with proper data structure
    const updateData = {};

    // Update basics
    if (Object.keys(basicData).length > 0) {
      updateData['pitch.basics'] = {
        ...startup.pitch?.basics,
        companyname: basicData.companyname || startup.pitch?.basics?.companyname,
        description: basicData.tagline || startup.pitch?.basics?.description,
        address: basicData.city || startup.pitch?.basics?.address,
        category: startup.pitch?.basics?.category || 'Other',
        links: {
          website: basicData.website || startup.pitch?.basics?.links?.website || '',
          twitter: basicData.twitter || startup.pitch?.basics?.links?.twitter || '',
          linkedin: basicData.linkedin || startup.pitch?.basics?.links?.linkedin || '',
          instagram: basicData.instagram || startup.pitch?.basics?.links?.instagram || '',
          youtube: basicData.youtube || startup.pitch?.basics?.links?.youtube || '',
          facebook: basicData.facebook || startup.pitch?.basics?.links?.facebook || '',
          blog: basicData.blog || startup.pitch?.basics?.links?.blog || '',
        }
      };
    }

    // Update highlights
    if (highlights.length > 0) {
      updateData['pitch.highlights'] = highlights;
    }

    // Update pitch content
    if (Object.keys(pitchData).length > 0) {
      updateData['pitch.pitch'] = {
        pitch_title: pitchData.pitch_title || startup.pitch?.pitch?.pitch_title || '',
        htmlData: pitchData.htmldata || pitchData.htmlData || startup.pitch?.pitch?.htmlData || ''
      };
    }

    // Update contract terms
    if (Object.keys(contractData).length > 0) {
      updateData['terms.contract'] = {
        ...startup.terms?.contract,
        contractName: contractData.contractName || startup.terms?.contract?.contractName || '',
        valuation_cap: parseFloat(contractData.valuation_cap) || startup.terms?.contract?.valuation_cap || 0,
        discount: parseFloat(contractData.discount) || startup.terms?.contract?.discount || 0,
        interest_rate: parseFloat(contractData.interest_rate) || startup.terms?.contract?.interest_rate || 0,
        payback: parseFloat(contractData.payback) || startup.terms?.contract?.payback || 0,
        investor_revenue_per: parseFloat(contractData.investor_revenue_per) || startup.terms?.contract?.investor_revenue_per || 0,
        simple_interest_rate: parseFloat(contractData.simple_interest_rate) || startup.terms?.contract?.simple_interest_rate || 0,
        repayment: contractData.repayment || startup.terms?.contract?.repayment || '',
        loan_term: parseFloat(contractData.loan_term) || startup.terms?.contract?.loan_term || 0,
        pre_money_valuation: parseFloat(contractData.pre_money_valuation) || startup.terms?.contract?.pre_money_valuation || 0,
        investor_advise: contractData.investor_advise || startup.terms?.contract?.investor_advise || '',
        terms_to_vip: contractData.terms_to_vip || startup.terms?.contract?.terms_to_vip || ''
      };
    }

    // Update perks
    if (perksArray.length > 0) {
      updateData['terms.perks'] = perksArray;
    }

    // Update funding goals
    if (Object.keys(fundingData).length > 0) {
      updateData['raise.fundingGoals'] = {
        ...startup.raise?.fundingGoals,
        maximumRaise: parseFloat(fundingData.maximum_raise) || startup.raise?.fundingGoals?.maximumRaise || 0,
        minimumRaise: parseFloat(fundingData.minimum_raise) || startup.raise?.fundingGoals?.minimumRaise || 0
      };
    }

    // Update discoverability
    if (Object.keys(discoverabilityData).length > 0) {
      updateData['raise.discoverability'] = {
        access: discoverabilityData.access || startup.raise?.discoverability?.access || '',
        venturelistURL: discoverabilityData.venturlistURL ? [discoverabilityData.venturlistURL] : startup.raise?.discoverability?.venturelistURL || []
      };
    }

    // Update extra settings
    if (Object.keys(extraData).length > 0) {
      updateData['raise.extra'] = {
        investor_massage: extraData.investor_massage || startup.raise?.extra?.investor_massage || '',
        anlytics: {
          google_anlytics: extraData.google_anlytics || startup.raise?.extra?.anlytics?.google_anlytics || '',
          google_tag_manager: extraData.google_tag_manager || startup.raise?.extra?.anlytics?.google_tag_manager || '',
          facebookTracking: {
            pixel_id: extraData.pixel_id || startup.raise?.extra?.anlytics?.facebookTracking?.pixel_id || '',
            conversion_token: extraData.conversion_token || startup.raise?.extra?.anlytics?.facebookTracking?.conversion_token || '',
            registered_Domain: extraData.registered_Domain || startup.raise?.extra?.anlytics?.facebookTracking?.registered_Domain || '',
            test_event_code: extraData.test_event_code || startup.raise?.extra?.anlytics?.facebookTracking?.test_event_code || ''
          }
        }
      };
    }

    // Update the startup
    const updatedStartup = await Startup.findByIdAndUpdate(
      startup._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('founder', 'firstname lastname email');

    if (!updatedStartup) {
      throw new ApiError(500, "Failed to update startup");
    }

    return res.status(200).json(
      new ApiResponse(200, updatedStartup, "Startup updated successfully")
    );

  } catch (error) {
    console.error("Error updating startup:", error);
    throw new ApiError(500, error.message || "Error updating startup");
  }
});

const getMyStartup = asyncHandler(async (req, res) => {
  try {
    const founderId = req.user._id;
    
    const startup = await Startup.findOne({ founder: founderId }).populate('founder', 'firstname lastname email');
    
    if (!startup) {
      return res.status(404).json(new ApiResponse(404, null, "No startup found for this founder"));
    }
    
    return res.status(200).json(new ApiResponse(200, startup, "Startup fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Error fetching startup data");
  }
});

const getStartupById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid startup ID");
    }
    
    const startup = await Startup.findById(id).populate('founder', 'firstname lastname email avatar');
    
    if (!startup) {
      throw new ApiError(404, "Startup not found");
    }
    
    return res.status(200).json(new ApiResponse(200, startup, "Startup fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Error fetching startup data");
  }
});

const uploadFile = asyncHandler(async (req, res) => {
  try {
    const founderId = req.user._id;
    
    // Check if file was uploaded
    const files = req.files;
    if (!files || Object.keys(files).length === 0) {
      throw new ApiError(400, "No file uploaded");
    }

    // Get the file type and file
    const fileType = Object.keys(files)[0]; // 'image', 'video', or 'logo'
    const file = files[fileType][0];
    
    if (!file || !file.path) {
      throw new ApiError(400, "File upload failed");
    }

    // Upload to Cloudinary
    const uploadResult = await uploadOnCloudinary(file.path);
    
    if (!uploadResult || !uploadResult.url) {
      throw new ApiError(500, "Failed to upload file to cloud storage");
    }

    // Find and update the startup with the new file URL
    const startup = await Startup.findOne({ founder: founderId });
    
    if (startup) {
      const updateField = `pitch.basics.${fileType}`;
      await Startup.findByIdAndUpdate(startup._id, {
        $set: { [updateField]: uploadResult.url }
      });
    }

    return res.status(200).json(
      new ApiResponse(200, { 
        url: uploadResult.url, 
        fileType,
        publicId: uploadResult.public_id 
      }, "File uploaded successfully")
    );

  } catch (error) {
    console.error("File upload error:", error);
    throw new ApiError(500, error.message || "File upload failed");
  }
});

export { registerStartup, getStatups, editStartup, getMyStartup, getStartupById, uploadFile };
