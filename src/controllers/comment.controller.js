import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

export const createCommentOnVideo = asyncHandler(async (req, res) => {
  const { content, videoID } = req.body;

  if (!content) {
    throw new APIError(400, "Content is required");
  }

  if (!videoID || !mongoose.Types.ObjectId.isValid(videoID)) {
    throw new APIError(400, "Invalid or missing videoID");
  }

  const video = await Video.findById(videoID);
  if (!video) {
    throw new APIError(404, "Video not found");
  }

  const comment = await Comment.create({
    content: content,
    video: videoID,
    owner: req.user._id
  });

  if (!comment) {
    throw new APIError(500, "Failed to comment");
  }

  res.status(201).json(new APIResponse(201, comment, "Commented on video"));
});
