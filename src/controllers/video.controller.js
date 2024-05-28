import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadFileToCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";

export const uploadVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    throw new APIError(422, "All fields are required");
  }

  const { videoFile, thumbnail } = req.files;
  if (!videoFile || !thumbnail) {
    throw new APIError(422, "All fields are required");
  }

  let uploadedVideoFile = "";
  if (videoFile && videoFile.length > 0 && videoFile[0].path) {
    uploadedVideoFile = await uploadFileToCloudinary(videoFile[0].path);
  }

  let uploadedThumbnailFile = "";
  if (thumbnail && thumbnail.length > 0 && thumbnail[0].path) {
    uploadedThumbnailFile = await uploadFileToCloudinary(thumbnail[0].path);
  }

  const uploadedVideo = await Video.create({
    title,
    description,
    thumbnail: uploadedThumbnailFile?.url,
    videoFile: uploadedVideoFile?.url,
    duration: uploadedVideoFile?.duration,
    isPublished: false,
    creator: req.user?._id
  });

  if (!uploadedVideo) {
    throw new APIError(400, "Failed to upload video");
  }

  return res
    .status(201)
    .json(
      new APIResponse(
        201,
        { video: uploadedVideo },
        "Video has been uploaded successfully"
      )
    );
});

export const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new APIError(422, "Video Id is required");
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId.createFromHexString(videoId)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "creator",
        foreignField: "_id",
        as: "user"
      }
    },
    {
      $unwind: "$user"
    },
    {
      $project: {
        creator: 0,
        user: {
          password: 0,
          refreshToken: 0
        }
      }
    }
  ]);

  if (video.length === 0) {
    throw new APIError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new APIResponse(200, video, "Video fetched successfully"));
});
