import { Playlist } from "../models/playlist.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

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

  const playlist = await Playlist.findById(playlistID)
    .populate({
      path: "owner",
      select: "-password -refreshToken -watchHistory"
    })
    .populate("videos");

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

  const allPlaylists = await Playlist.find({ owner: userID })
    .populate({
      path: "owner",
      select: "-password -refreshToken -watchHistory"
    })
    .populate("videos");

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

export const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistID } = req.params;
  const { videoID } = req.body;

  if (!playlistID) {
    throw new APIError(422, "Playlist id is required");
  }

  if (!videoID) {
    throw new APIError(422, "Video id is required");
  }

  const video = await Video.findById(videoID);
  if (!video) {
    throw new APIError(422, "Video does not exists");
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistID,
    {
      $addToSet: {
        videos: videoID
      }
    },
    { new: true }
  )
    .populate({
      path: "owner",
      select: "-password -refreshToken -watchHistory"
    })
    .populate("videos");

  if (!playlist) {
    throw new APIError(404, "Playlist not found");
  }

  res
    .status(200)
    .json(
      new APIResponse(200, playlist, "Video added to playlist successfully")
    );
});

export const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistID } = req.params;
  const { videoID } = req.body;

  if (!playlistID) {
    throw new APIError(422, "Playlist id is required");
  }

  if (!videoID) {
    throw new APIError(422, "Video id is required");
  }

  const video = await Video.findById(videoID);
  if (!video) {
    throw new APIError(422, "Video does not exists");
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistID,
    {
      $pull: {
        videos: videoID
      }
    },
    { new: true }
  )
    .populate({
      path: "owner",
      select: "-password -refreshToken -watchHistory"
    })
    .populate("videos");

  if (!playlist) {
    throw new APIError(404, "Playlist not found");
  }

  res
    .status(200)
    .json(
      new APIResponse(200, playlist, "Video added to playlist successfully")
    );
});

export const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistID } = req.params;

  if (!playlistID) {
    throw new APIError(400, "Playlist Id is required");
  }

  const playlist = await Playlist.findById(playlistID);

  if (!playlist) {
    throw new APIError(404, "Playlist not found");
  }

  if (!playlist.owner.equals(req.user._id)) {
    throw new APIError(403, "You are not the owner of this playlist");
  }

  await Playlist.findByIdAndDelete(playlistID);

  return res
    .status(200)
    .json(new APIResponse(200, {}, "Playlist deleted successfully"));
});

export const editPlaylist = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const { playlistID } = req.params;

  const playlist = await Playlist.findById(playlistID);
  if (!playlist) {
    throw new APIError(403, "Playlist not found");
  }

  if (title) playlist.title = title;
  if (description) playlist.description = description;
  await playlist.save();

  res
    .status(201)
    .json(new APIResponse(200, playlist, "Playlist edit successfully"));
});
