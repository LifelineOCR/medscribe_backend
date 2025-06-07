import mongoose from 'mongoose';


const patientSchema = new mongoose.Schema({
  user: { // The healthcare provider/user who created this patient record
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  firstName: {
    type: String,
    required: [true, "Patient's first name is required."],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "Patient's last name is required."],
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: false, // Making it optional for now
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    required: false,
  },
  contactInfo: {
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
  },
  // You can add more fields like address, medical history summary, etc.
  // For simplicity, we'll start with these.
  customId: { // Optional: If you use an internal patient ID system
    type: String,
    trim: true,
    index: true, // Index if you search by it often
    sparse: true, // Allows for null/missing values if not all patients have it
  }
}, { timestamps: true }); // Adds createdAt and updatedAt

// Compound index to ensure a user doesn't create the exact same patient name twice (optional)
// patientSchema.index({ user: 1, firstName: 1, lastName: 1 }, { unique: true, partialFilterExpression: { firstName: { $type: "string" }, lastName: { $type: "string" }} });


const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
