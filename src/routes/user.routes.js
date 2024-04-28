import { Router } from "express";
import { upload } from "../utils/multer.js";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
  ]),
  registerUser
);

export default router;
