import mongoose from "mongoose";

const diseaseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    organ: { type: String, trim: true, maxlength: 60 },
    notes: { type: String, trim: true, maxlength: 500 }
  },
  { _id: false }
);

const medicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    dosage: { type: String, trim: true, maxlength: 120 },
    frequency: { type: String, trim: true, maxlength: 120 },
    duration: { type: String, trim: true, maxlength: 120 }
  },
  { _id: false }
);

const patientSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, sparse: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    aadhaarNumber: {
      type: String,
      required: true,
      unique: true,
      match: /^\d{12}$/
    },
    age: { type: Number, min: 0, max: 130 },
    gender: { type: String, trim: true, maxlength: 30 },
    diseases: { type: [diseaseSchema], default: [] },
    medications: { type: [medicationSchema], default: [] }
  },
  { timestamps: true }
);

export const Patient = mongoose.model("Patient", patientSchema);

