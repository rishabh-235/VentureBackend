import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import { Strategy as GitHubStrategy } from "passport-github2";
import { User } from "../models/user.models.js"; // Adjust the path to your User model
import dotenv from "dotenv";
import { genrateAccessAndRefreshTokens } from "../controllers/user.controller.js"; // Adjust the path to your token utility

dotenv.config();

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select("-password -refreshToken");
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Helper function to generate unique username
const generateUniqueUsername = async (firstname, lastname, email) => {
  const baseUsername = `${firstname.toLowerCase()}${lastname ? lastname.toLowerCase() : ""}`;
  let username = baseUsername;
  let counter = 1;

  // Check if username exists, if it does, append a number
  while (await User.findOne({ username })) {
    username = `${baseUsername}${counter}`;
    counter++;
  }

  // If still conflicts, use part of email
  if (await User.findOne({ username })) {
    const emailPart = email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    username = emailPart;
    counter = 1;

    while (await User.findOne({ username })) {
      username = `${emailPart}${counter}`;
      counter++;
    }
  }

  return username;
};

// Helper function to handle user creation or fetching and token generation
const handleUser = async (profile, platformIdField, done) => {
  try {
    let user = await User.findOne({
      $or: [
        { [platformIdField]: profile.id },
        { email: profile.emails[0].value },
      ],
    });

    const nameParts = profile.displayName.trim().split(" ");
    const [firstname, ...rest] = nameParts;
    const lastname = rest.pop() || "";
    const middlename = rest.join(" ");

    if (!user) {
      // Generate a unique username for OAuth users
      const username = await generateUniqueUsername(
        firstname,
        lastname,
        profile.emails[0].value
      );

      user = new User({
        [platformIdField]: profile.id,
        username,
        firstname,
        lastname,
        middlename,
        email: profile.emails[0].value,
        avatar:
          profile.photos && profile.photos.length > 0
            ? profile.photos[0].value
            : undefined,
      });
      await user.save();
    } else if (!user[platformIdField]) {
      // If user exists with email but not with this OAuth provider, link them
      user[platformIdField] = profile.id;
      await user.save();
    }

    const { accessToken, refreshToken } = await genrateAccessAndRefreshTokens(
      user._id
    );

    // Pass the user and tokens to done
    return done(null, { accessToken, refreshToken });
  } catch (err) {
    console.error("OAuth handleUser error:", err);
    return done(err);
  }
};

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8000/auth/google/callback",
    },
    (token, tokenSecret, profile, done) => {
      handleUser(profile, "googleId", done);
    }
  )
);

// LinkedIn Strategy
passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: "http://localhost:8000/auth/linkedin/callback",
      scope: ["r_emailaddress", "r_liteprofile"],
    },
    (token, tokenSecret, profile, done) => {
      handleUser(profile, "linkedinId", done);
    }
  )
);

// GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:8000/auth/github/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      handleUser(profile, "githubId", done);
    }
  )
);
