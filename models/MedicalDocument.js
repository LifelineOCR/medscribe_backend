import mongoose from "mongoose";
/**
 * MedicalDocument Schema
 * This schema is designed to store metadata about medical documents uploaded by users.
 * It includes fields for user reference, file details, processing status, and optional metadata.
 */

const medicalDocumentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    originalFileName: { type: String, required: true },
    storageFileName: { type: String, required: true, unique: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true }, // in bytes
    uploadDate: { type: Date, default: Date.now },
    processingStatus: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
      default: "PENDING",
      index: true,
    },
    processingError: { type: String },
    documentTitle: { type: String }, // e.g., "Patient Chart - Dr. Smith"
    doctorName: { type: String },
    documentDate: { type: Date }, // Date mentioned in the document itself
  },
  { timestamps: true }
);

const MedicalDocument = mongoose.model(
  "MedicalDocument",
  medicalDocumentSchema
);
export default  {
	  MedicalDocument,
  medicalDocumentSchema
};

