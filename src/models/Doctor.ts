import mongoose, { Document, Schema, ObjectId } from "mongoose";

export interface Slot {
  _id?: ObjectId;
  slot: number;
  startTime: Date;
  endTime: Date;
  available: boolean;
}

export interface IDoctor extends Document {
  fullname: string;
  specialization?: string;
  appointmentFee: number;
  clinic: Schema.Types.ObjectId; // Reference to the Clinic model,
  slots: Slot[];
}

// Define the Doctor schema
const DoctorSchema: Schema = new Schema({
  fullname: { type: String, required: true },
  specialization: { type: String }, // Optional specialization field
  appointmentFee: { type: Number, required: true }, // Required appointment fee field
  clinic: { type: Schema.Types.ObjectId, ref: "Clinic", required: true }, // Reference to the Clinic model
  slots: [{ slot: Number, startTime: Date, endTime: Date, available: Boolean }],
});

// Define and export the Doctor model
const Doctor = mongoose.model<IDoctor>("Doctor", DoctorSchema);
export default Doctor;
