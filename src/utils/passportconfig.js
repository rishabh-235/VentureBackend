import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { User } from '../models/user.models.js'; // Adjust the path to your User model
import dotenv from 'dotenv';
import { genrateAccessAndRefreshTokens } from '../controllers/user.controller.js'; // Adjust the path to your token utility

dotenv.config();

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password -refreshToken');
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Helper function to handle user creation or fetching and token generation
const handleUser = async (profile, platformIdField, done) => {
  try {
    let user = await User.findOne({ [platformIdField]: profile.id });

    if (!user) {
      user = new User({
        [platformIdField]: profile.id,
        fullname: profile.displayName,
        email: profile.emails[0].value,
      });
      await user.save();
    }

    const { accessToken, refreshToken } = await genrateAccessAndRefreshTokens(user._id);

    // Pass the user and tokens to done
    return done(null, {accessToken, refreshToken });
  } catch (err) {
    return done(err);
  }
};

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:8000/auth/google/callback",
},
(token, tokenSecret, profile, done) => {
  handleUser(profile, 'googleId', done);
}));

// LinkedIn Strategy
passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: "http://localhost:8000/auth/linkedin/callback",
  scope: ['r_emailaddress', 'r_liteprofile'],
},
(token, tokenSecret, profile, done) => {
  handleUser(profile, 'linkedinId', done);
}));

// GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "http://localhost:8000/auth/github/callback",
},
(accessToken, refreshToken, profile, done) => {
  handleUser(profile, 'githubId', done);
}));