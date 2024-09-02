import mongoose, { Document, Schema } from 'mongoose';
import type { IUser } from './users.model';

export interface IActivity extends Document {
  user: IUser['_id'];
  eventType: string;
  timestamp: Date;
  details: {
    mouseEventCount: number;
    keyboardEventCount: number;
    capturedImage: string;
    key: string;
  };
  createdAt?: Date;
}

const ActivitySchema: Schema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventType: { type: String, required: true },
  timestamp: { type: Date, required: true },
  // capturedImage: { type: String, required: true },
  details: {
    mouseEventCount: { type: Number, required: true },
    keyboardEventCount: { type: Number, required: true },
    capturedImage: { type: String },
    key: { type: String },
  },
  createdAt: { type: Date, default: Date.now },
});

export const ActivityModel = mongoose.model<IActivity>(
  'Activity',
  ActivitySchema,
);
