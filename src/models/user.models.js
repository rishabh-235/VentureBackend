import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
    },
    password: {
      type: String,
    },
    phone: {
      type: String,
      sparse: true, 
    },
    address: {
      type: String,
    },
    follower: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    watchList: [
      {
        type: Schema.Types.ObjectId,
        ref: "startup",
      }
    ],
    following: [{
      type: Schema.Types.ObjectId,
      ref: "User"
    }],
    refreshToken: {
      type: String,
    },
    isInvestor: {
      type: Boolean,
      default: false,
    },
    isFounder: {
      type: Boolean,
      default: false,
    },
    googleId: { type: String, unique: true, sparse: true },
    linkedinId: { type: String, unique: true, sparse: true },
    githubId: { type: String, unique: true, sparse: true },
  },
  
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next;
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.genrateAccessToken = function(){
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.genrateRefreshToken = function(){
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
