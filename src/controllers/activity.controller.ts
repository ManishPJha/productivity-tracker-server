import { Request, Response } from "express";

import { isMongoId } from "validator";
import { ActivityModel } from "../db/model/activities.model";
import { UserModel } from "../db/model/users.model";
import ApiFeature from "../utils/ApiFeature";
import { asyncFunction } from "../utils/catchAsyncErrorhandler";
import getErrorMessage from "../utils/getErrorMessage";

interface ActivityDetails {
  mouseEventCount: number;
  keyboardEventCount: number;
  capturedImage?: string;
  key: string;
}

interface IActivity {
  userId: string;
  activities: {
    eventType: string;
    timestamp: number;
    details: ActivityDetails;
  };
}

export const createActivity = asyncFunction(
  async (req: Request<null, null, IActivity>, res: Response) => {
    const { userId, activities } = req.body;

    if (!isMongoId(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await UserModel.findById({
      _id: isMongoId(userId) ? userId : null,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const activity = await ActivityModel.create({
      user: user._id,
      eventType: activities.eventType,
      timestamp: activities.timestamp,
      details: activities.details,
    });

    if (activity) {
      user.activities?.push(activity._id);
      await user.save();
    }

    res.status(201).json(activity);
  }
);

export const getActivities = async (req: Request, res: Response) => {
  try {
    const apiFeature = new ApiFeature(ActivityModel.find(), req.query);

    const activities = await apiFeature.query;
    res.status(200).json(activities);
  } catch (error) {
    res.status(400).json({ message: getErrorMessage(error) });
  }
};
