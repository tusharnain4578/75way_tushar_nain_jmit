import mongoose, { Document, Schema, Model } from "mongoose";

// Define the interface representing a clinic document
export interface IClinic extends Document {
  starttime(starttime: any, endtime: any): import("./Doctor").Slot[];
  name: string;
  address: string;
  opentime: string;
  closetime: string;
  lunchStartTime: string;
  lunchEndTime: string;
}

// Define the clinic schema
const ClinicSchema: Schema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  opentime: { type: String, required: true },
  closetime: { type: String, required: true },
  lunchStartTime: { type: String, required: true },
  lunchEndTime: { type: String, required: true },
});

// Define the extended model interface with the isClinicExists method
interface IClinicModel extends Model<IClinic> {
  isClinicExists(clinicId: string): Promise<boolean>;
}

// Define the Clinic model
const Clinic: IClinicModel = mongoose.model<IClinic, IClinicModel>(
  "Clinic",
  ClinicSchema
);

// Function to check if a clinic with a given ID exists
Clinic.isClinicExists = async (clinicId: string): Promise<boolean> => {
  try {
    const clinic = await Clinic.findById(clinicId);
    return !!clinic;
  } catch (error) {
    return false;
  }
};

export default Clinic;
