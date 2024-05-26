import { Router } from "express";
import { upload } from "../utils/multer.js";
import {
  currentUser,
  loginUser,
  registerUser,
  logoutUser,
  refreshAccessToken,
  resetPassword,
  updateProfileImage,
  userChannelProfile
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";

const router = Router();

// Public routes
router.route("/register").post(
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
  ]),
  registerUser
);
router.route("/login").post(upload.none(), loginUser);

// Private routes
router.route("/current-user").get(authenticate, currentUser);
router.route("/logout").post(authenticate, logoutUser);
router.route("/refresh-access-token").post(authenticate, refreshAccessToken);
router.route("/reset-password").post(authenticate, resetPassword);
router.route("/channel/:username").get(authenticate, userChannelProfile);
router
  .route("/update-profile-image")
  .post(authenticate, upload.single("profileImage"), updateProfileImage);

export default router;
