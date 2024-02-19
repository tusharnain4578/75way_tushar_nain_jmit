import express, { Router } from "express";
import ClinicController from "../controllers/ClinicController";
const router: Router = express.Router();

router.get("/list", ClinicController.getAllClinics);
router.get("/:id", ClinicController.getClinicById);

router.post("/add", ClinicController.addClinic);

router.put("/:id", ClinicController.updateClinic);

export default router;
