import express from 'express';
import passport from 'passport';
const router = express.Router();

// Google auth
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  const {accessToken, refreshToken } = req.user;
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax'
  };

  res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .redirect('http://localhost:3000/');
});

// LinkedIn auth
router.get('/auth/linkedin', passport.authenticate('linkedin'));
router.get('/auth/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/login' }), (req, res) => {
  const {accessToken, refreshToken } = req.user;
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax'
  };

  res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .redirect('http://localhost:3000/');
});

// GitHub auth
router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
  const {accessToken, refreshToken } = req.user;
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax'
  };

  res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .redirect('http://localhost:3000/');
});

export default router;