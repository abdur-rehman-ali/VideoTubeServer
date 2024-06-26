import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadFileToCloudinary,
  deleteFileFromCloudinary
} from "../utils/cloudinary.js";
import { parseQueryParam } from "../helpers/application.helper.js";

export const getAllVideos = asyncHandler(async (req, res) => {
  const page = parseQueryParam(req.query.page, 1);
  const limit = parseQueryParam(req.query.limit, 10);
  const sortBy = req.query.sortBy || "createdAt";
  const sortType = req.query.sortType || "desc";

  const sortOptions = {};
  sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

  const startIndex = (page - 1) * limit;

  const pipeline = [
    { $sort: sortOptions },
    { $skip: startIndex },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "creator",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              password: 0,
              refreshToken: 0,
              watchHistory: 0
            }
          }
        ]
      }
    },
    {
      $unwind: "$owner"
    },
    {
      $project: {
        creator: 0
      }
    }
  ];

  const videos = await Video.aggregate(pipeline);

  res.status(200).json(
    new APIResponse(
      200,
      {
        videos,
        count: videos.length,
        page
      },
      "Videos fetched successfully!!!"
    )
  );
});

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

export const updateVideo = asyncHandler(async (req, res) => {
  const { videoId, resourceType } = req.params;
  const { title, description } = req.body;

  const videoRecord = await Video.findById(videoId);

  if (!videoRecord) {
    throw new APIError(404, "Video not found");
  }

  if (!videoRecord.isOwner(req.user._id)) {
    throw new APIError(422, "Your are not owner of this video");
  }

  if (!resourceType) {
    if (title) videoRecord.title = title;
    if (description) videoRecord.description = description;
  } else if (resourceType === "title" && title) {
    videoRecord.title = title;
  } else if (resourceType === "description" && description) {
    videoRecord.description = description;
  } else if (resourceType === "thumbnail") {
    const uploadedFile = await uploadFileToCloudinary(req.file?.path);
    const oldFileToDelete = videoRecord.thumbnail;
    await deleteFileFromCloudinary(oldFileToDelete);
    videoRecord.thumbnail = uploadedFile.url;
  }
  await videoRecord.save();

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        { video: videoRecord },
        "Record updated successfully"
      )
    );
});

export const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new APIError(400, "Video Id is required");
  }

  const video = await Video.findByIdAndDelete(videoId);

  if (!video) {
    throw new APIError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new APIResponse(200, {}, "Video deleted successfully"));
});

export const togglePublishVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new APIError(400, "Video Id is required");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new APIError(404, "Video not found");
  }

  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(new APIResponse(200, {}, "Video published toggled successfully"));
});
