import mongoose, { Schema } from "mongoose";

const StartupSchema = new Schema({
    companyname: {
        type: String,
        required: true,
        unique: true,
    },
    founder:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    description:{
        type: String,
        required: true,
    },
    website: String,
    investors: [
        {
            type: Schema.Types.ObjectId,
            refrence: "Investor"
        }
    ],
    video: {
        type: String //cloudinary
    },
    image: {
        type: String, //cloudinary
        required: true,
    },
    funding:{
        type: Number,
        required: true,
    },
    // valuation: {
    //     type: Number,
    //     required: true
    // },
    capitalRaised: {
        type: Number,
        default: 0,
    },
    industry: [{
        type: String,
        required: true,
    }],
    address:{
        type: String,
        required: true,
    },
    legalDocument: [{
        type: String,
        required: true
    }],
    other:{
        type: String
    }
},{timestamps: true})

export const Startup = mongoose.model("Startup", StartupSchema);