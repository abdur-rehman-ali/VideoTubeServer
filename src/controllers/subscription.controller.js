import { Subscription } from "../models/subscription.model.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const subscribeChannel = asyncHandler(async (req, res) => {
  const { channel } = req.body;

  // Check for the old subscription
  const oldSubscription = await Subscription.findOne({
    channel: channel
  });

  // If old subscription is present, then unsubscribe it by removing the old subscription
  if (oldSubscription) {
    await Subscription.deleteOne({ _id: oldSubscription._id });
    return res
      .status(201)
      .json(
        new APIResponse(
          201,
          oldSubscription,
          "Channel unsubscribed successfully!"
        )
      );
  }

  // If no old subscription, then create a new one
  const newSubscription = await Subscription.create({
    channel: channel,
    subscriber: req.user._id
  });

  // Return the response
  res
    .status(201)
    .json(
      new APIResponse(201, newSubscription, "Channel subscribed successfully!")
    );
});
