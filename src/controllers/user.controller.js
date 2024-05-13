import { generateAccessAndRefreshToken } from "../helpers/user.helper.js";
import { User } from "../models/user.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadImageToCloudinary } from "../utils/cloudinary.js";

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

export const currentUser = async (req, res) => {
  res.status(200).json(new APIResponse(200, req.user, "Current User"));
};

export const logoutUser = async (req, res) => {
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
};
