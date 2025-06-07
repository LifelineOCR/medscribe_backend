import mongoose from "mongoose";
/**
 * MedicalDocument Schema
 * This schema is designed to store metadata about medical documents uploaded by users.
 * It includes fields for user reference, file details, processing status, and optional metadata.
 */


const medicalDocumentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
//   patient: { // <<< NEW FIELD TO LINK TO A PATIENT
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Patient',
//     required: false, // Make it false initially, will become true after frontend changes
//                      // Or true if a document MUST belong to a patient. Let's make it required.
//     required: [true, "A document must be associated with a patient."],
//     index: true,
//   },
  originalFileName: { type: String, required: true },
  storageFileName: { type: String, required: true, unique: true },
  filePath: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  uploadDate: { type: Date, default: Date.now },
  processingStatus: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
    default: 'PENDING',
    index: true
  },
  documentTitle: { type: String },
  doctorName: { type: String }, // This might be the doctor mentioned IN the document
  documentDate: { type: Date },
}, { timestamps: true });


const MedicalDocument = mongoose.model(
  "MedicalDocument",
  medicalDocumentSchema
);
export default MedicalDocument;

