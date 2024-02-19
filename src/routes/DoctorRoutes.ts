import express, { Router } from "express";
import DoctorController from "../controllers/DoctorController";
const router: Router = express.Router();

router.get("/list", DoctorController.getAllDoctorsWithClinics);
router.get("/:id", DoctorController.getDoctorById);
router.post("/add", DoctorController.addDoctor);

router.post("/:id/add-slot", DoctorController.addSlotsForDoctor);

router.post("/make-appointment", DoctorController.allocateSlotToUser);

router.put("/:id/reject-appointment", DoctorController.rejectAppointment);

export default router;
