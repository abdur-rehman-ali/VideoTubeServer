import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import {
  createPlaylist,
  getSinglePlaylistById
} from "../controllers/playlist.controller.js";
import { upload } from "../utils/multer.js";

const router = Router();

// Public routes
router.route("/:playlistID").get(getSinglePlaylistById);

// Private routes
router.route("/create").post(upload.none(), authenticate, createPlaylist);

export default router;
