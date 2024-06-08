import { Playlist } from "../models/playlist.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createPlaylist = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    throw new APIError(422, "All fields are required");
  }

  const playlist = await Playlist.create({
    title,
    description,
    owner: req.user._id
  });

  if (!playlist) {
    throw new APIError(500, "Failed to create playlist");
  }

  const playlistData = await Playlist.findById(playlist._id).populate({
    path: "owner",
    select: "-password -refreshToken"
  });

  return res
    .status(201)
    .json(
      new APIResponse(
        201,
        playlistData,
        "Playlist has been created successfully"
      )
    );
});

export const getSinglePlaylistById = asyncHandler(async (req, res) => {
  const { playlistID } = req.params;

  if (!playlistID) {
    throw new APIError(422, "Id is required");
  }

  const playlist = await Playlist.findById(playlistID).populate({
    path: "owner",
    select: "-password -refreshToken -watchHistory"
  });

  if (!playlist) {
    throw new APIError(500, "Playlist not found");
  }

  return res
    .status(200)
    .json(new APIResponse(200, playlist, "Playlist fetched successfully"));
});

export const getAllPlaylistOfUserById = asyncHandler(async (req, res) => {
  const { userID } = req.params;

  if (!userID) {
    throw new APIError(422, "User Id is required");
  }

  const allPlaylists = await Playlist.find({ owner: userID }).populate({
    path: "owner",
    select: "-password -refreshToken -watchHistory"
  });

  if (!userID) {
    throw new APIError(500, "Playlists not found");
  }

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        allPlaylists,
        "Playlists of user fetched successfully"
      )
    );
});
