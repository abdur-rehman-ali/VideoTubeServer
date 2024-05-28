import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { uploadVideo } from "../controllers/video.controller.js";
import { upload } from "../utils/multer.js";

const router = Router();

// Private routes
router.route("/upload-video").post(
  authenticate,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]),
  uploadVideo
);

export default router;
