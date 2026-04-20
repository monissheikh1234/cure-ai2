import dotenv from "dotenv";
dotenv.config();

import { connectDb } from "../config/db.js";
import { User } from "../models/User.js";
import { Patient } from "../models/Patient.js";
import { ROLES } from "../config/constants.js";

function randAadhaar() {
  const base = String(Math.floor(Math.random() * 1e12)).padStart(12, "0");
  return base.slice(0, 12);
}

await connectDb(process.env.MONGODB_URI);

await User.deleteMany({});
await Patient.deleteMany({});

const doctorPassword = "Doctor@12345";
const patientPassword = "Patient@12345";
const patientAadhaar = randAadhaar();

const doctor = await User.create({
  name: "Dr. Demo",
  email: "doctor@cureai.local",
  password: doctorPassword,
  role: ROLES.DOCTOR
});

const patientUser = await User.create({
  name: "Patient Demo",
  email: "patient@cureai.local",
  password: patientPassword,
  role: ROLES.PATIENT
});

const patient = await Patient.create({
  userId: patientUser._id,
  name: "Patient Demo",
  aadhaarNumber: patientAadhaar,
  age: 28,
  gender: "Other",
  diseases: [{ name: "Asthma", organ: "lungs", notes: "Demo condition" }],
  medications: [
    { name: "Inhaler", dosage: "2 puffs", frequency: "as needed", duration: "ongoing" }
  ]
});

// eslint-disable-next-line no-console
console.log("Seed complete\n");
// eslint-disable-next-line no-console
console.log("Doctor login:");
// eslint-disable-next-line no-console
console.log("  email:", doctor.email);
// eslint-disable-next-line no-console
console.log("  password:", doctorPassword);
// eslint-disable-next-line no-console
console.log("\nPatient login:");
// eslint-disable-next-line no-console
console.log("  email:", patientUser.email);
// eslint-disable-next-line no-console
console.log("  password:", patientPassword);
// eslint-disable-next-line no-console
console.log("  aadhaar:", patient.aadhaarNumber);

process.exit(0);

