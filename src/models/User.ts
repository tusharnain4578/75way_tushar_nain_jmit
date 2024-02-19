import mongoose, { Document, Schema } from "mongoose";

export interface Slot {
  slot: number;
  startTime: Date;
  endTime: Date;
  available: boolean;
}

export interface IUser extends Document {
  fullname: string;
  email: string;
  bookedSlot: Slot;
  bookedDoctor: Schema.Types.ObjectId;
}

// Define the User schema
const UserSchema: Schema = new Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true },
  bookedSlot: {
    slot: Number,
    startTime: Date,
    endTime: Date,
    available: Boolean,
  },
  bookedDoctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: false },
});

// Define and export the User model
const User = mongoose.model<IUser>("User", UserSchema);
export default User;
