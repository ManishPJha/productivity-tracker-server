import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../db/model/users.model";

const authMiddleware = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Extract token from header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      const user = await UserModel.findById((decoded as any).id);

      if (!user) {
        return res.status(401).json({ message: "User not authorized" });
      }

      // Attach user to request object
      (req as any).user = user;

      // Check if user's role is allowed
      if (roles.length && !roles.includes(user.role)) {
        return res
          .status(403)
          .json({ message: "Forbidden: Insufficient rights" });
      }

      next();
    } catch (error) {
      res.status(401).json({ message: "Token is not valid" });
    }
  };
};

export default authMiddleware;
