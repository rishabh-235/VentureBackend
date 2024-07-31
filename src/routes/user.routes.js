import { Router } from "express";
import { followUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, unfollowUser} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refreshToken").post(refreshAccessToken)
router.route("/editprofile").post(verifyJWT, updateAccountDetails)
router.route("/follow").post(verifyJWT,followUser);
router.route("/unfollow").post(verifyJWT, unfollowUser);
router.route("/verifyToken").get(verifyJWT, (req, res) => {
    res.status(200).json(new ApiResponse(200, req.user, "Token is valid"));
});

export default router;