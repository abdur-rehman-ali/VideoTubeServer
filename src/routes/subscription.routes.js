import { Router } from "express";
import {
  authenticate,
  isUserAuthenticated
} from "../middlewares/authenticate.middleware.js";
import { subscribeChannel } from "../controllers/subscription.controller.js";

const router = Router();

// Private routes
router
  .route("/subscribe-channel")
  .post(authenticate, isUserAuthenticated, subscribeChannel);

export default router;
