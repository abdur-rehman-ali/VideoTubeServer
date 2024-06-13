import { Router } from "express";
import {
  authenticate,
  isUserAuthenticated
} from "../middlewares/authenticate.middleware.js";

import { upload } from "../utils/multer.js";
import {
  createCommentOnTweet,
  createCommentOnVideo
} from "../controllers/comment.controller.js";

const router = Router();

// Private routes
router
  .route("/commentOnVideo")
  .post(upload.none(), authenticate, isUserAuthenticated, createCommentOnVideo);
router
  .route("/commentOnTweet")
  .post(upload.none(), authenticate, isUserAuthenticated, createCommentOnTweet);

export default router;
