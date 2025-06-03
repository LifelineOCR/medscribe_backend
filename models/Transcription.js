import mongoose from "mongoose";

const transcriptionSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicalDocument",
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    }, // Denormalized for easier querying
    transcribedText: { type: String }, // Full text output from Llama
    structuredData: { type: mongoose.Schema.Types.Mixed }, // For key-value pairs, entities, or JSON from Llama (the "Summary" field and more)
    confidenceScore: { type: Number },
    processingTimeMs: { type: Number }, // Time taken by Llama
    errorMessage: { type: String }, // If processing failed
  },
  { timestamps: true }
);

const Transcription = mongoose.model("Transcription", transcriptionSchema);
export default Transcription;
