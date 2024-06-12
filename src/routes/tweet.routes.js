import { Router } from "express";
import {
  authenticate,
  isUserAuthenticated
} from "../middlewares/authenticate.middleware.js";
import {
  createTweet,
  deleteTweet,
  editTweet,
  getCurrentUsersTweet,
  tweets
} from "../controllers/tweet.controller.js";
import { upload } from "../utils/multer.js";

const router = Router();
//Public routes
router.route("/all").get(tweets);

// Private routes
router
  .route("/create")
  .post(upload.none(), authenticate, isUserAuthenticated, createTweet);
router
  .route("/:tweetID/edit")
  .put(upload.none(), authenticate, isUserAuthenticated, editTweet);
router
  .route("/:tweetID/delete")
  .delete(authenticate, isUserAuthenticated, deleteTweet);
router
  .route("/currentUser")
  .get(authenticate, isUserAuthenticated, getCurrentUsersTweet);

export default router;
