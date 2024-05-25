import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { subscribeChannel } from "../controllers/subscription.controller.js";

const router = Router();

// Private routes
router.route("/subscribe-channel").post(authenticate, subscribeChannel);

export default router;
