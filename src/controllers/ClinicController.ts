import { Request, Response } from "express";
import Clinic, { IClinic } from "../models/Clinic";
import { Error } from "mongoose";
import Joi from "joi";

const clinicSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  opentime: Joi.date().required(),
  closetime: Joi.date()
    .required()
    .min(Joi.ref("opentime"))
    .message('"closetime" must be greater than "opentime"'),
  lunchStartTime: Joi.date().required(),
  lunchEndTime: Joi.date()
    .required()
    .min(Joi.ref("lunchStartTime"))
    .message('"lunchEndTime" must be greater than "lunchStartTime"'),
})
  .custom((value, helpers) => {
    if (value.opentime === value.closetime) {
      return helpers.error("any.invalid");
    }
    if (value.lunchStartTime === value.lunchEndTime) {
      return helpers.error("any.invalid");
    }
    return value;
  })
  .messages({
    "any.invalid":
      "Invalid input: opentime and closetime cannot be the same, and lunchStartTime and lunchEndTime cannot be the same",
  });

// Define Joi schema for clinic ID validation
const objectIdSchema = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .required()
  .messages({
    "string.pattern.base": `"clinic ID" should be a valid ObjectId`,
  });

class ClinicController {
  /**
   * Get Clinic by Id (GET)
   * Controller method to fetch a specific clinic from id
   */
  public getClinicById = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate clinicId parameter using Joi schema
      const { error, value } = objectIdSchema.validate(req.params.id);
      if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
      }
      const clinicId: string = value;

      // Find the clinic by ID in the database
      const clinic: IClinic | null = await Clinic.findById(clinicId);

      if (!clinic) {
        res.status(404).json({ message: "Clinic not found" });
        return;
      }

      // If the clinic is found, respond with it
      res.json(clinic);
    } catch (error: any) {
      // Handle errors
      if (error?.kind === "ObjectId") {
        res.status(404).json({ message: "Clinic not found" });
        return;
      }
      console.error("Error fetching clinic:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  };

  /**
   * Get All Clinics (GET)
   * Controller method to fetch all the clinics from the database
   */
  public getAllClinics = async (req: Request, res: Response): Promise<void> => {
    try {
      const clinics: IClinic[] = await Clinic.find();
      res.json(clinics);
    } catch (error: any) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "An error occurred" });
      }
    }
  };

  /**
   * Add New Clinic (POST)
   * Controller method to add new Clinic in database
   */
  public addClinic = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body using Joi schema
      const { error, value } = clinicSchema.validate(req.body, {
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
        name,
        address,
        opentime,
        closetime,
        lunchStartTime,
        lunchEndTime,
      }: {
        name: string;
        address: string;
        opentime: Date;
        closetime: Date;
        lunchStartTime: Date;
        lunchEndTime: Date;
      } = value;

      // Create a new Clinic instance
      const newClinic: IClinic = new Clinic({
        name,
        address,
        opentime,
        closetime,
        lunchStartTime,
        lunchEndTime,
      });

      // Save the new clinic to MongoDB
      const savedClinic: IClinic = await newClinic.save();

      // Respond with the saved clinic
      res.status(201).json({
        success: true,
        clinic: savedClinic,
      });
    } catch (error: any) {
      // Handle errors
      console.error("Error adding clinic:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  };

  /**
   * Update Clinic (PUT)
   * Controller method to update an existing clinic in the database
   */
  public updateClinic = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate clinicId parameter using Joi schema
      const { error: idError, value: clinicId } = objectIdSchema.validate(
        req.params.id
      );
      if (idError) {
        res.status(400).json({ message: idError.details[0].message });
        return;
      }

      // Validate request body using Joi schema
      const { error: bodyError, value } = clinicSchema.validate(req.body, {
        abortEarly: false,
      });
      if (bodyError) {
        const errorMessage = bodyError.details
          .map((detail) => detail.message)
          .join(", ");
        res.status(400).json({ message: errorMessage });
        return;
      }

      // Extract validated data from req.body
      const { name, address, opentime, closetime, lunchtime } = value;

      // Find the clinic by ID and update it in the database
      const updatedClinic = await Clinic.findByIdAndUpdate(
        clinicId,
        { name, address, opentime, closetime, lunchtime },
        { new: true }
      );

      // Check if clinic was found and updated successfully
      if (!updatedClinic) {
        res.status(404).json({ message: "Clinic not found" });
        return;
      }

      // Respond with the updated clinic
      res.json(updatedClinic);
    } catch (error: any) {
      // Handle errors
      console.error("Error updating clinic:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  };
}

export default new ClinicController();
