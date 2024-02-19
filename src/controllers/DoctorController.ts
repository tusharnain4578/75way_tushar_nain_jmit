import { Request, Response } from "express";
import Doctor, { IDoctor, Slot } from "../models/Doctor";
import Clinic, { IClinic } from "../models/Clinic"; // Import the Clinic model
import Joi from "joi";
import ClinicManager from "../services/ClinicManager";
import User, { IUser } from "../models/User";

const appointmentSchema = Joi.object({
  fullname: Joi.string().required(),
  email: Joi.string().email().required(),
  doctorId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
});

const doctorSchema = Joi.object({
  fullname: Joi.string().required(),
  specialization: Joi.string().optional(),
  appointmentFee: Joi.number().required(),
  clinic: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(), // Assuming clinic ID is a MongoDB ObjectId
});

const slotIdSchema = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .required()
  .messages({
    "string.pattern.base": `"slot ID" should be a valid ObjectId`,
  });

const doctorIdSchema = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .required()
  .messages({
    "string.pattern.base": `"doctor ID" should be a valid ObjectId`,
  });

class DoctorController {
  /**
   * Get All Doctors with Clinics (GET)
   * Controller method to fetch all doctors with their associated clinics
   */
  public getAllDoctorsWithClinics = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      // Retrieve all doctors with their associated clinics
      const doctorsWithClinics: IDoctor[] = await Doctor.find().populate(
        "clinic"
      );

      // Respond with the array of doctors with clinics
      res.json(doctorsWithClinics);
    } catch (error: any) {
      // Handle errors
      console.error("Error fetching doctors with clinics:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  };

  /**
   * Get Doctor by ID (GET)
   * Controller method to fetch a specific doctor by ID
   */
  public getDoctorById = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate doctor ID parameter using Joi schema
      const { error, value } = doctorIdSchema.validate(req.params.id);
      if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
      }
      const doctorId: string = value;

      // Find the doctor by ID in the database
      const doctor: IDoctor | null = await Doctor.findById(doctorId).populate(
        "clinic"
      );

      if (!doctor) {
        res.status(404).json({ message: "Doctor not found" });
        return;
      }

      // If the doctor is found, respond with it
      res.json(doctor);
    } catch (error: any) {
      // Handle errors
      if (error?.kind === "ObjectId") {
        res.status(404).json({ message: "Doctor not found" });
        return;
      }
      console.error("Error fetching doctor:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  };

  /**
   * Add Slots for Doctor (POST)
   * Controller method to add slots for a doctor and update the doctor record
   */
  public addSlotsForDoctor = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      // Validate doctor ID parameter using Joi schema
      const { error: idError, value: doctorId } = doctorIdSchema.validate(
        req.params.id
      );
      if (idError) {
        res.status(400).json({ message: idError.details[0].message });
        return;
      }

      // Find the doctor by ID in the database
      const doctor: IDoctor | null = await Doctor.findById(doctorId).populate(
        "clinic"
      );

      if (!doctor) {
        res.status(404).json({ message: "Doctor not found" });
        return;
      }

      // Respond with the updated doctor record
      res.status(200).json({ success: true, doctor });
    } catch (error: any) {
      // Handle errors
      console.error("Error adding slots for doctor:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  };

  /**
   * Add New Doctor (POST)
   * Controller method to add new Doctor of Clinic in database
   */
  public addDoctor = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body using Joi schema
      const { error, value } = doctorSchema.validate(req.body, {
        abortEarly: false,
      });
      if (error) {
        const errorMessage = error.details
          .map((detail) => detail.message)
          .join(", ");
        res.status(400).json({ message: errorMessage });
        return;
      }

      // Extract validated data from req.body
      const {
        fullname,
        specialization,
        appointmentFee,
        clinic,
      }: {
        fullname: string;
        specialization?: string;
        appointmentFee: number;
        clinic: string;
      } = value;

      // Check if the clinic ID provided exists
      const doctorClinic: IClinic | null = await Clinic.findById(clinic);
      if (!doctorClinic) {
        res.status(400).json({ message: "Invalid clinic ID" });
        return;
      }
      const slots: Slot[] = ClinicManager.generateDoctorSlots(doctorClinic);

      // Create a new Doctor instance
      const newDoctor: IDoctor = new Doctor({
        fullname,
        specialization,
        appointmentFee,
        clinic,
        slots,
      });

      // Save the new doctor to MongoDB
      const savedDoctor: IDoctor = await newDoctor.save();

      // Respond with the saved doctor
      res.status(201).json({
        success: true,
        doctor: savedDoctor,
      });
    } catch (error: any) {
      // Handle errors
      console.error("Error adding doctor:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  };

  public allocateSlotToUser = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      // Validate request body using Joi schema
      const { error, value } = appointmentSchema.validate(req.body, {
        abortEarly: false,
      });
      if (error) {
        const errorMessage = error.details
          .map((detail) => detail.message)
          .join(", ");
        res.status(400).json({ message: errorMessage });
        return;
      }

      // Extract validated data from req.body
      const { fullname, email, doctorId } = value;

      // Find the doctor by ID in the database
      const doctor: IDoctor | null = await Doctor.findById(doctorId).populate(
        "clinic"
      );

      if (!doctor) {
        res.status(404).json({ message: "Doctor not found" });
        return;
      }

      // Find the first available slot
      let allocatedSlot: Slot | undefined;
      for (const slot of doctor.slots) {
        if (slot.available) {
          allocatedSlot = slot;
          slot.available = false; // Mark the slot as unavailable
          break;
        }
      }

      if (!allocatedSlot) {
        res.status(404).json({ message: "No available slots for this doctor" });
        return;
      }

      const user: IUser = new User({
        fullname,
        email,
        bookedSlot: allocatedSlot,
        bookedDoctor: doctorId,
      });

      await user.save();

      // Update the doctor record with the allocated slot
      await doctor.save();

      // Respond with the allocated slot details
      res.status(200).json({
        success: true,
        slot: allocatedSlot,
        user: { fullname, email },
      });
    } catch (error: any) {
      // Handle errors
      console.error("Error allocating slot to user:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  };

  /**
   * Reject Appointment (PUT)
   * Controller method to reject an appointment by marking the slot as available
   */
  public rejectAppointment = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      // Validate doctorId parameter using Joi schema
      const { error: idError, value: doctorId } = doctorIdSchema.validate(
        req.params.doctorId
      );
      if (idError) {
        res.status(400).json({ message: idError.details[0].message });
        return;
      }

      // Validate slotId parameter using Joi schema
      const { error: slotError, value: slotId } = slotIdSchema.validate(
        req.body.slotId
      );
      if (slotError) {
        res.status(400).json({ message: slotError.details[0].message });
        return;
      }

      // Find the doctor by ID in the database
      const doctor: IDoctor | null = await Doctor.findById(doctorId);

      if (!doctor) {
        res.status(404).json({ message: "Doctor not found" });
        return;
      }

      // Find the slot by ID in the doctor's slots
      const slotIndex = doctor.slots.findIndex(
        (slot) => slot?._id?.toString() === slotId
      );

      if (slotIndex === -1) {
        res.status(404).json({ message: "Slot not found" });
        return;
      }

      // Mark the slot as available
      doctor.slots[slotIndex].available = true;

      // Save the updated doctor record
      await doctor.save();

      res.status(200).json({ success: true, message: "Appointment rejected" });
    } catch (error: any) {
      // Handle errors
      console.error("Error rejecting appointment:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  };
}

export default new DoctorController();
