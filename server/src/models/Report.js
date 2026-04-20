import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    uploadedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileURL: { type: String, required: true },
    fileMimeType: { type: String, required: true },
    originalName: { type: String, required: true },
    extractedText: { type: String, default: "" },
    summary: { type: String, default: "" },
    explanation: { type: String, default: "" },
    recommendations: { type: String, default: "" }
  },
  { timestamps: true }
);

export const Report = mongoose.model("Report", reportSchema);

