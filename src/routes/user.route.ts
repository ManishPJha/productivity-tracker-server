import express from "express";

import {
  createUser,
  getUsers,
  loginUser,
} from "../controllers/user.controller";

import authMiddleware from "../middlewares/authMiddleware";

const router = express.Router();

router.route("/").get(authMiddleware("user"), getUsers).post(createUser);

router.post("/login", loginUser);

router.get("*", (_, res) => res.end("User routes are available"));

export default router;
