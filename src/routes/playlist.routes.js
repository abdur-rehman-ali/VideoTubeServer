import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  editPlaylist,
  getAllPlaylistOfUserById,
  getSinglePlaylistById,
  removeVideoFromPlaylist
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
router
  .route("/:playlistID/removeFromPlaylist")
  .post(upload.none(), authenticate, removeVideoFromPlaylist);
router
  .route("/:playlistID/deletePlaylist")
  .delete(authenticate, deletePlaylist);
router
  .route("/:playlistID/editPlaylist")
  .put(upload.none(), authenticate, editPlaylist);

export default router;
