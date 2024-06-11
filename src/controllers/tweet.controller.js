import { Tweet } from "../models/tweet.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const tweets = asyncHandler(async (req, res) => {
  const tweets = await Tweet.find();

  res
    .status(200)
    .json(
      new APIResponse(
        200,
        { tweets, count: tweets.length },
        "Tweets fetched successfully!"
      )
    );
});

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

export const editTweet = asyncHandler(async (req, res) => {
  const { tweetID } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new APIError(400, "Content is required");
  }

  const tweet = await Tweet.findByIdAndUpdate(
    tweetID,
    {
      content: content
    },
    { new: true }
  );

  const tweetWithCreator = await tweet.populate(
    "creator",
    "-password -refreshToken"
  );

  res
    .status(201)
    .json(
      new APIResponse(201, tweetWithCreator, "Tweet updated successfully!")
    );
});

export const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetID } = req.params;

  if (!tweetID) {
    throw new APIError(400, "Tweet ID is required");
  }

  const tweet = await Tweet.findById(tweetID);
  if (!tweet) {
    throw new APIError(404, "Tweet not found");
  }

  const isUserCreatorOfTweet = tweet.creator.equals(req.user.id);
  if (!isUserCreatorOfTweet) {
    throw new APIError(403, "You are not authorized to delete this tweet");
  }

  await tweet.deleteOne();

  res.status(200).json(new APIResponse(200, {}, "Tweet deleted successfully!"));
});
