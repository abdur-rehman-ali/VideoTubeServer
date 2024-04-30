import { User } from "../models/user.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadImageToCloudinary } from "../utils/cloudinary.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, password, firstName, lastName } = req.body;
  const { profileImage, coverImage } = req.files;

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
