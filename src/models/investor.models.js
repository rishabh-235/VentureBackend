import mongoose, { Schema } from "mongoose";

const investmentSchema = new Schema({
  investedIn: {
    type: Schema.Types.ObjectId,
    refrence: "Startup",
    required: true,
  },
  amountInvested: {
    type: Number,
  },
});

const investorSchema = new Schema(
  {
    legalfirstname: {
      type: String,
      trim: true,
    },
    legallastname: {
      type: String,
      trim: true,
    },
    legalmiddlename: {
      type: String,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    panCard: {
      type: String,
      unique: true,
    },
    aadhaar: {
      type: String,
      unique: true,
    },
    nationality: {
      type: String,
    },
    dob:{
      type:Date
    },
    birthcountry: {
      type: String,
    },
    birthcity: {
      type: String,
    },
    investedAmount: {
      type: Number,
      default: 0,
    },
    networth: {
      type: Number,
      default: 0,
    },
    annualincome: {
      type: Number,
      default: 0,
    },
    investmentlimit: {
      type: Number,
      default: 0,
    },
    accreditedinvestor:{
      type:String,
    },
    investment: [investmentSchema],
  },
  {
    timestamps: true,
  }
);

export const Investor = mongoose.model("Investor", investorSchema);
