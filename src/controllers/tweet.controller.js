import { Tweet } from "../models/tweet.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    throw new APIError(400, "Content is required");
  }

  const tweet = await Tweet.create({
    content,
    creator: req.user?._id
  });

  const tweetWithCreator = await tweet.populate(
    "creator",
    "-password -refreshToken"
  );

  res
    .status(201)
    .json(
      new APIResponse(201, tweetWithCreator, "Tweet created successfully!")
    );
});
