import { Request, Response } from 'express';
import { ActivityModel } from '../db/model/activities.model';
import { IUser, UserModel } from '../db/model/users.model';
import { asyncFunction } from '../utils/catchAsyncErrorhandler';
import getErrorMessage from '../utils/getErrorMessage';
import bcrypt from 'bcryptjs';

export const adminGetUsers = asyncFunction(
  async (req: Request, res: Response) => {
    try {
      const users = await UserModel.find({ role: 'user' });
      res.status(200).json(users);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  },
);

export const adminDeleteUser = asyncFunction(
  async (req: Request, res: Response) => {
    try {
      const user = await UserModel.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  },
);

export const adminGetActivities = asyncFunction(
  async (req: Request, res: Response) => {
    try {
      const activities = await ActivityModel.find().populate('user');
      res.status(200).json(activities);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  },
);

export const adminDeleteActivity = asyncFunction(
  async (req: Request, res: Response) => {
    try {
      const activityId = req.params.id;

      const activity = await ActivityModel.findByIdAndDelete(activityId);
      if (!activity) {
        return res.status(404).json({ message: 'Activity not found' });
      }

      await UserModel.updateOne(
        { activities: activityId },
        { $pull: { activities: activityId } }
      );

      res.status(200).json({ message: 'Activity deleted successfully' });
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  }
);


export const adminCreateUser = asyncFunction(
  async (req: Request, res: Response) => {
    try {
      const { username, email, password, role, salary } = req.body;

      const validRoles = ['admin', 'user'];
      if (role && !validRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }

      const ifUserExists = await UserModel.findOne({ email });
      if (ifUserExists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = new UserModel({
        username,
        email,
        password,
        role: role || 'user',
        salary,
      });

      await user.save();

      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  },
);

export const incrementEmailCount = async (userId: string) => {
  try {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format

    await UserModel.findByIdAndUpdate(userId, {
      $addToSet: { emailStats: dateString }, // Add the date only if it doesn't already exist
    });
  } catch (error) {
    console.error('Error incrementing email count:', error);
  }
};


export const getActivitiesByUserId = asyncFunction(
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      // Check if the user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Find activities for the specified user
      const activities = await ActivityModel.find({ user: userId }).populate(
        'user',
      );
      if (activities.length === 0) {
        return res
          .status(404)
          .json({ message: 'No activities found for this user' });
      }

      res.status(200).json(activities);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  },
);

export const adminUpdateUser = asyncFunction(
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { username, email, password, salary } = req.body;

      // Find the user by ID
      const user = await UserModel.findById(id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Prepare update object
      const updateData: Partial<IUser> = { username, email, salary };

      if (password) {
        // Hash the new password
        updateData.password = await bcrypt.hash(password, 10);
      }

      // Find and update the user
      const updatedUser = await UserModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  }
);