import { IClinic } from "../models/Clinic";
import { Slot } from "../models/Doctor";

class ClinicManager {
  public generateDoctorSlots(clinic: IClinic): Slot[] {
    const slots: Slot[] = [];
    const startDate = new Date(clinic.opentime).getTime(); // Convert start time to timestamp
    const endDate = new Date(clinic.closetime).getTime(); // Convert end time to timestamp
    const lunchStartTime = new Date(clinic.lunchStartTime).getTime(); // Convert lunch start time to timestamp
    const lunchEndTime = new Date(clinic.lunchEndTime).getTime(); // Convert lunch end time to timestamp

    // Set the interval to one hour in milliseconds
    const interval = 60 * 60 * 1000;

    let currentTime = startDate; // Initialize current time to start time

    let i = 1;
    // Loop through each hour from workingHoursStart to workingHoursEnd
    while (currentTime < endDate) {
      // Convert current time back to Date object
      const startTime = new Date(currentTime);
      const endTime = new Date(currentTime + interval);

      // Check if the current hour falls within the lunchtime range
      if (currentTime >= lunchStartTime && currentTime < lunchEndTime) {
        // Skip this hour if it's within lunchtime
        currentTime += interval;
        continue;
      }

      console.log(startTime.toLocaleString(), endTime.toLocaleString()); // For debugging

      const slot: Slot = {
        slot: i,
        startTime,
        endTime,
        available: true, // Slots are initially available
      };

      slots.push(slot);
      i++;

      // Move to the next hour
      currentTime += interval;
    }

    return slots;
  }
}

export default new ClinicManager();
