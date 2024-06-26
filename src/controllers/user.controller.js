import jwt from "jsonwebtoken";
import { generateAccessAndRefreshToken } from "../helpers/user.helper.js";
import { User } from "../models/user.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFileFromCloudinary,
  uploadFileToCloudinary
} from "../utils/cloudinary.js";

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
    uploadedProfileImage = await uploadFileToCloudinary(profileImage[0].path);
  }
  let uploadedCoverImage = "";
  if (coverImage && coverImage.length > 0 && coverImage[0].path) {
    uploadedCoverImage = await uploadFileToCloudinary(coverImage[0].path);
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

export const updateProfileImage = asyncHandler(async (req, res) => {
  // Retrieve the path of the uploaded profile image from the request
  const profileImagePath = req.file?.path;

  // Upload the image to Cloudinary and get the uploaded image details
  const uploadedProfileImage = await uploadFileToCloudinary(profileImagePath);
  if (!uploadedProfileImage) {
    throw new APIError(401, "Profile image not updated");
  }

  // Update the user's profile image URL in the database
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        profileImage: uploadedProfileImage.url
      }
    },
    { new: true } // Return the updated user document
  ).select("-password -refreshToken"); // Exclude password and refresh token

  // Delete the old profile image from Cloudinary if it exists
  await deleteFileFromCloudinary(req.user?.profileImage);

  // Send a successful response with the updated user information
  res
    .status(200)
    .json(new APIResponse(200, { user }, "Profile image updated successfully"));
});

export const userChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  // Check if username is provided
  if (!username) {
    throw new APIError(400, "Username is required");
  }

  // Aggregation pipeline to fetch user profile and subscription details
  let user = await User.aggregate([
    // Match the user by username (case-insensitive)
    {
      $match: { userName: username.trim().toLowerCase() }
    },
    // Lookup subscriptions where the user is the subscriber
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "mySubscriptions"
      }
    },
    // Lookup subscriptions where the user is the channel
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribedTo"
      }
    },
    // Add fields for the counts of subscriptions and subscribers, and check if the current user is subscribed
    {
      $addFields: {
        mySubscriptionsCount: {
          $size: "$mySubscriptions"
        },
        subscribedToCount: {
          $size: "$subscribedTo"
        },
        // Check if the current user is subscribed to the user's channel
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribedTo.subscriber"] },
            then: true,
            else: false
          }
        }
      }
    },
    // Project necessary fields and exclude sensitive information
    {
      $project: {
        password: 0,
        mySubscriptions: 0,
        subscribedTo: 0,
        refreshToken: 0
      }
    }
  ]);

  // If no user is found, return a 404 response
  if (user.length === 0) {
    return res.status(404).json(new APIResponse(404, null, "User not found!"));
  }

  // Return the user profile data in the response
  return res
    .status(200)
    .json(
      new APIResponse(200, user[0], "User Profile data fetched successfully!")
    );
});
