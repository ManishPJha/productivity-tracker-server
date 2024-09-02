import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import mongoose, { Document, Schema } from "mongoose";

import type { IActivity } from "./activities.model";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: string;
  createdAt?: Date;
  activities?: IActivity["_id"][];
  salary: number;
  emailStats: string[]; // { YYYY-MM: number }
  getJWTToken(): string;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  activities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],
  salary: { type: Number },
  emailStats: { type: [String], default: [] }, // Store dates as strings
  createdAt: { type: Date, default: Date.now },
});

if (!process.env.JWT_SECRET || !process.env.JWT_SECRET) {
  throw new Error("Missing JWT_SECRET or JWT_EXPIRE environment variables");
}

UserSchema.pre("save", async function (next) {
  // hash the password before saving the user
  const user = this as unknown as IUser;
  if (!user.isModified("password")) {
    next();
  }
  const hashedPassword = await bcrypt.hash(user.password, 10);
  user.password = hashedPassword;
});

UserSchema.methods.getJWTToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET as string,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
};

UserSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getResetPasswordToken = async function () {
  // generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // generate hash token and add to db
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

export const UserModel = mongoose.model<IUser>("User", UserSchema);
