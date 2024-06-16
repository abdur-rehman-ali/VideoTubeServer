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
import {
  authenticate,
  isUserAuthenticated
} from "../middlewares/authenticate.middleware.js";

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
router.route("/logout").post(authenticate, isUserAuthenticated, logoutUser);
router
  .route("/current-user")
  .get(authenticate, isUserAuthenticated, currentUser);
router
  .route("/refresh-access-token")
  .post(authenticate, isUserAuthenticated, refreshAccessToken);
router
  .route("/reset-password")
  .post(authenticate, isUserAuthenticated, resetPassword);
router
  .route("/channel/:username")
  .get(authenticate, isUserAuthenticated, userChannelProfile);
router
  .route("/update-profile-image")
  .post(
    upload.single("profileImage"),
    authenticate,
    isUserAuthenticated,
    updateProfileImage
  );

export default router;
