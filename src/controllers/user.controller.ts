import { NextFunction, Request, Response } from "express";

import { UserModel } from "../db/model/users.model";
import ApiFeature from "../utils/ApiFeature";
import { asyncFunction } from "../utils/catchAsyncErrorhandler";
import getErrorMessage from "../utils/getErrorMessage";

export const createUser = asyncFunction(async (req: Request, res: Response) => {
  try {
    const { username, email, password, salary } = req.body;

    const ifUserExists = await UserModel.findOne({ username });

    if (ifUserExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new UserModel({
      username,
      email,
      password,
      salary,
    });

    await user.save();

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: getErrorMessage(error) });
  }
});

export const getUsers = async (req: Request, res: Response) => {
  try {
    const apiFeature = new ApiFeature(UserModel.find(), req.query);

    const users = await apiFeature.query;
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ message: getErrorMessage(error) });
  }
};

export const incrementEmailCount = async (userId: string) => {
  try {
    const today = new Date();
    const dateString = today.toISOString().split("T")[0]; // YYYY-MM-DD format

    await UserModel.findByIdAndUpdate(userId, {
      $addToSet: { emailStats: dateString }, // Add the date only if it doesn't already exist
    });
  } catch (error) {
    console.error("Error incrementing email count:", error);
  }
};

export const loginUser = asyncFunction(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const user = await UserModel.findOne({ email });

      if (!user) {
        return res
          .status(401)
          .json({ message: "Invalid email", success: false });
      }

      const isPasswordMatched = await user.comparePassword(password);

      if (!isPasswordMatched) {
        return res
          .status(401)
          .json({ message: "Invalid password", success: false });
      }

      const token = user.getJWTToken();
      const role = user.role;
      const username = user.username;

      res.status(200).json({
        token,
        user: { id: user._id, email: user.email, role, username },
      });
    } catch (error) {
      next(error);
    }
  }
);
