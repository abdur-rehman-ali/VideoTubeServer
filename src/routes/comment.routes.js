import { Router } from "express";
import {
  authenticate,
  isUserAuthenticated
} from "../middlewares/authenticate.middleware.js";

import { upload } from "../utils/multer.js";
import { createCommentOnVideo } from "../controllers/comment.controller.js";

const router = Router();

// Private routes
router
  .route("/commentOnVideo")
  .post(upload.none(), authenticate, isUserAuthenticated, createCommentOnVideo);

export default router;
