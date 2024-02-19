import express, { Request, Response } from "express";
import dotenv from "dotenv";
import database from "./src/config/database";
import ClinicRoutes from "./src/routes/ClinicRoutes";
import DoctorRoutes from "./src/routes/DoctorRoutes";
dotenv.config();
process.env.TZ = "UTC";

const app = express();
const PORT = process.env.EXPRESS_PORT ?? 8000;

database
  .connect()
  .then(() => {
    app.use(express.json());

    app.use("/clinic", ClinicRoutes).use("/doctor", DoctorRoutes);

    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(`Error starting server.`);
  });
