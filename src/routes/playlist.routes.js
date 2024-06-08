import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { createPlaylist } from "../controllers/playlist.controller.js";
import { upload } from "../utils/multer.js";

const router = Router();

// Private routes
router.route("/create").post(upload.none(), authenticate, createPlaylist);

export default router;
