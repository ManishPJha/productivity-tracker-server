import express from "express";
import {
  adminCreateUser,
  adminDeleteActivity,
  adminDeleteUser,
  adminGetActivities,
  adminGetUsers,
  adminUpdateUser,
  getActivitiesByUserId,
} from "../controllers/admin.controller";
import authMiddleware from "../middlewares/authMiddleware";

const router = express.Router();

router
  .route("/users")
  .get(authMiddleware("admin"), adminGetUsers)
  .post(authMiddleware("admin"), adminCreateUser);

router
  .route("/users/:id")
  .put(authMiddleware("admin"), adminUpdateUser)
  .delete(authMiddleware("admin"), adminDeleteUser);

router.get("/activities", authMiddleware("admin"), adminGetActivities);
router.delete("/activities/:id", authMiddleware("admin"), adminDeleteActivity);
router.get(
  "/activities/user/:userId",
  authMiddleware("admin"),
  getActivitiesByUserId
);

router.get("*", (_, res) => res.end("Admin routes are available"));

export default router;
