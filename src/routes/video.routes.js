import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import {
  getVideoById,
  updateVideo,
  uploadVideo
} from "../controllers/video.controller.js";
import { upload } from "../utils/multer.js";

const router = Router();

// Public routes
router.route("/:videoId").get(getVideoById);

// Private routes
router.route("/upload-video").post(
  authenticate,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]),
  uploadVideo
);
router.route("/:videoId/update").put(authenticate, updateVideo);
router.route("/:videoId/update/:resourceType").put(authenticate, updateVideo);

export default router;
