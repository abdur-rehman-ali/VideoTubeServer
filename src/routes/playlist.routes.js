import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import {
  addVideoToPlaylist,
  createPlaylist,
  getAllPlaylistOfUserById,
  getSinglePlaylistById
} from "../controllers/playlist.controller.js";
import { upload } from "../utils/multer.js";

const router = Router();

// Public routes
router.route("/:playlistID").get(getSinglePlaylistById);
router.route("/user/:userID").get(getAllPlaylistOfUserById);

// Private routes
router.route("/create").post(upload.none(), authenticate, createPlaylist);
router
  .route("/:playlistID/addToPlaylist")
  .post(upload.none(), authenticate, addVideoToPlaylist);

export default router;
