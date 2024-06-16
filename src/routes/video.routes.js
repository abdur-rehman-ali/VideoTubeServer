import { Router } from "express";
import {
  authenticate,
  isUserAuthenticated
} from "../middlewares/authenticate.middleware.js";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  togglePublishVideo,
  updateVideo,
  uploadVideo
} from "../controllers/video.controller.js";
import { upload } from "../utils/multer.js";

const router = Router();

// Public routes
router.route("/all").get(getAllVideos);
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
router
  .route("/:videoId/update")
  .put(authenticate, isUserAuthenticated, updateVideo);
router
  .route("/:videoId/update/:resourceType")
  .put(
    upload.single("thumbnail"),
    authenticate,
    isUserAuthenticated,
    updateVideo
  );
router
  .route("/:videoId/destroy")
  .delete(authenticate, isUserAuthenticated, deleteVideo);
router
  .route("/:videoId/togglePublishVideo")
  .put(authenticate, isUserAuthenticated, togglePublishVideo);

export default router;
