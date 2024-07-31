import mongoose, { Schema } from "mongoose";

const investmentSchema = new Schema(
  {
      investedIn:{
          type: Schema.Types.ObjectId,
          refrence: "Startup",
          required: true
      },
      amountInvested:{
          type: Number
      },
  }
)

const investorSchema = new Schema(
  {
    user:{
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    panCard: {
      type: String,
      required: true,
      unique: true
    },
    aadhar: {
      type: String,
      required: true,
      unique: true
    },
    bio: {
      type: String,
    },
    about: {
      type: String,
    },
    experties: [String],
    website: {
      type: String,
    },
    offPlatformInvestment: [String],
    investedAmount:{
      type: Number,
      default: 0
    },
    investment:[
      investmentSchema
    ]
  },
  {
    timestamps: true,
  }
);

export const Investor = mongoose.model("Investor", investorSchema);
