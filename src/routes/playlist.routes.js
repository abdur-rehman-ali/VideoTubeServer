import { Router } from "express";
import {
  authenticate,
  isUserAuthenticated
} from "../middlewares/authenticate.middleware.js";
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
router
  .route("/create")
  .post(upload.none(), authenticate, isUserAuthenticated, createPlaylist);
router
  .route("/:playlistID/addToPlaylist")
  .post(upload.none(), authenticate, isUserAuthenticated, addVideoToPlaylist);
router
  .route("/:playlistID/removeFromPlaylist")
  .post(
    upload.none(),
    authenticate,
    isUserAuthenticated,
    removeVideoFromPlaylist
  );
router
  .route("/:playlistID/deletePlaylist")
  .delete(authenticate, isUserAuthenticated, deletePlaylist);
router
  .route("/:playlistID/editPlaylist")
  .put(upload.none(), authenticate, isUserAuthenticated, editPlaylist);

export default router;
