import { generateAccessAndRefreshToken } from "../helpers/user.helper.js";
import { User } from "../models/user.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadImageToCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

export const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, password, firstName, lastName } = req.body;
  const { profileImage, coverImage } = req.files;

  if (!userName || !email || !password) {
    throw new APIError(422, "All fields are required");
  }

  const user = await User.findOne({
    $or: [{ email }, { userName }]
  });

  if (user) {
    throw new APIError(409, "User with this email or username already exists");
  }

  let uploadedProfileImage = "";
  if (profileImage && profileImage.length > 0 && profileImage[0].path) {
    uploadedProfileImage = await uploadImageToCloudinary(profileImage[0].path);
  }
  let uploadedCoverImage = "";
  if (coverImage && coverImage.length > 0 && coverImage[0].path) {
    uploadedCoverImage = await uploadImageToCloudinary(coverImage[0].path);
  }

  let createdUser = await User.create({
    userName,
    email,
    password,
    firstName,
    lastName,
    profileImage: uploadedProfileImage?.url,
    coverImage: uploadedCoverImage?.url
  });

  createdUser = await User.findById(createdUser._id).select(
    "-password -refreshToken"
  );

  res
    .status(201)
    .json(new APIResponse(201, createdUser, "User registered sucessfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password) {
    throw new APIError(422, "All fields are required");
  }

  const user = await User.findOne({
    $or: [{ userName: usernameOrEmail }, { email: usernameOrEmail }]
  });

  if (!user) {
    throw new APIError(422, "User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new APIError(422, "Password is incorrect");
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshToken(user);

  const cookieOptions = {
    httpOnly: true,
    secure: true
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new APIResponse(
        200,
        { user, accessToken, refreshToken },
        "User login successfully"
      )
    );
});

export const currentUser = asyncHandler(async (req, res) => {
  res.status(200).json(new APIResponse(200, req.user, "Current User"));
});

export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $unset: {
      refreshToken: 1
    }
  });

  const cookieOptions = {
    httpOnly: true,
    secure: true
  };

  res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new APIResponse(200, {}, "User logged out successfully"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new APIError(401, "Unauthorized access");
  }

  const decodedRefreshToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET_KEY
  );

  if (!decodedRefreshToken) {
    throw new APIError(401, "Failed to decode refresh token");
  }

  const user = await User.findById(decodedRefreshToken._id);

  if (!user) {
    throw new APIError(401, "Failed to generate user from refresh token");
  }

  if (user.refreshToken !== incomingRefreshToken) {
    throw new APIError(
      401,
      "Failed to match refresh token with incoming refresh token"
    );
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshToken(user);

  const cookieOptions = {
    httpOnly: true,
    secure: true
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new APIResponse(
        200,
        {
          accessToken,
          refreshToken
        },
        "Access token refreshed successfully"
      )
    );
});

/**
 * Resets the user's password.
 *
 * This function handles the password reset process by:
 * 1. Verifying that the new password and confirmation match.
 * 2. Finding the user by their ID from the request object.
 * 3. Checking if the provided old password is correct.
 * 4. Updating the user's password to the new one if all checks pass.
 *
 * Parameters:
 * - req.body.oldPassword (string): The user's current password.
 * - req.body.newPassword (string): The new password to set.
 * - req.body.newPasswordConfirmation (string): Confirmation of the new password.
 *
 * Errors are thrown with appropriate HTTP status codes:
 * - 400 Bad Request: New password and confirmation do not match.
 * - 404 Not Found: User cannot be found.
 * - 401 Unauthorized: Incorrect old password.
 *
 * On success, returns a 200 OK status with a success message.
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, newPasswordConfirmation } = req.body;

  // Check if new passwords match
  if (newPassword !== newPasswordConfirmation) {
    throw new APIError(400, "New password and confirmation do not match");
  }

  // Find user by ID
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new APIError(404, "User not found");
  }

  // Verify old password
  const isOldPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isOldPasswordCorrect) {
    throw new APIError(401, "Incorrect old password");
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Respond with success message
  res.status(200).json(new APIResponse(200, {}, "Password reset successfully"));
});
