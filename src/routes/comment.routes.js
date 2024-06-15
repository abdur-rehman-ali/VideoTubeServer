import { Router } from "express";
import {
  authenticate,
  isUserAuthenticated
} from "../middlewares/authenticate.middleware.js";

import { upload } from "../utils/multer.js";
import {
  createCommentOnTweet,
  createCommentOnVideo,
  deleteComment,
  editComment
} from "../controllers/comment.controller.js";

const router = Router();

// Private routes
router
  .route("/commentOnVideo")
  .post(upload.none(), authenticate, isUserAuthenticated, createCommentOnVideo);
router
  .route("/commentOnTweet")
  .post(upload.none(), authenticate, isUserAuthenticated, createCommentOnTweet);
router
  .route("/:commentID/editComment")
  .put(upload.none(), authenticate, isUserAuthenticated, editComment);
router
  .route("/:commentID/deleteComment")
  .delete(authenticate, isUserAuthenticated, deleteComment);

export default router;
