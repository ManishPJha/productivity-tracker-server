import { NextFunction, Request, Response } from "express";

const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: "Admin Token is InValid" });
    }

    next();
  };
};

export default authorizeRoles;
