import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { APIError } from "../utils/APIError.js";

export const authenticate = asyncHandler(async (req, _, next) => {
  let bearerToken = req.headers.authorization;
  if (!bearerToken) {
    throw new APIError(401, "Unauthorized access");
  }
  bearerToken = bearerToken.replace("Bearer ", "");
  const decoded = jwt.verify(bearerToken, process.env.ACCESS_TOKEN_SECRET_KEY);
  const user = await User.findById(decoded._id).select("-password");
  if (!user) {
    throw new APIError(401, "Invalid Token");
  }
  req.user = user;
  next();
});

export const isUserAuthenticated = asyncHandler(async (req, _, next) => {
  if (!req.user) {
    throw new APIError(401, "User not authenticated");
  }
  next();
});
