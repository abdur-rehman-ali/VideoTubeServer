import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
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

  const commentWithOwner = await comment.populate(
    "owner",
    "_id email userName"
  );

  res
    .status(201)
    .json(new APIResponse(201, commentWithOwner, "Commented on video"));
});

export const createCommentOnTweet = asyncHandler(async (req, res) => {
  const { content, tweetID } = req.body;

  if (!content) {
    throw new APIError(400, "Content is required");
  }

  if (!tweetID || !mongoose.Types.ObjectId.isValid(tweetID)) {
    throw new APIError(400, "Invalid or missing tweetID");
  }

  const tweet = await Tweet.findById(tweetID);
  if (!tweet) {
    throw new APIError(404, "Tweet not found");
  }

  const comment = await Comment.create({
    content: content,
    tweet: tweetID,
    owner: req.user._id
  });

  if (!comment) {
    throw new APIError(500, "Failed to comment");
  }

  const commentWithOwner = await comment.populate(
    "owner",
    "_id email userName"
  );

  res
    .status(201)
    .json(new APIResponse(201, commentWithOwner, "Commented on tweet"));
});

export const editComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { commentID } = req.params;

  if (!content) {
    throw new APIError(400, "Content is required");
  }

  if (!commentID || !mongoose.Types.ObjectId.isValid(commentID)) {
    throw new APIError(400, "Invalid or missing commentID");
  }

  const comment = await Comment.findOneAndUpdate(
    { _id: commentID, owner: req.user._id },
    {
      content: content
    },
    {
      new: true
    }
  );

  if (!comment) {
    throw new APIError(404, "Comment not found");
  }

  const commentWithOwner = await comment.populate(
    "owner",
    "_id email userName"
  );

  res
    .status(201)
    .json(new APIResponse(201, commentWithOwner, "Comment edited"));
});
