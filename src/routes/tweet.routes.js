import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { createTweet } from "../controllers/tweet.controller.js";
import { upload } from "../utils/multer.js";

const router = Router();

// Private routes
router.route("/create").post(upload.none(), authenticate, createTweet);

export default router;
