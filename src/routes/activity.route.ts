import express from "express";

import {
  createActivity,
  getActivities,
} from "../controllers/activity.controller";
import authMiddleware from "../middlewares/authMiddleware";

const router = express.Router();

router
  .route("/")
  .get(authMiddleware("user"), getActivities)
  .post(authMiddleware("user"), createActivity);

router.get("*", (_, res) => res.end("Activity routes are available"));

export default router;
