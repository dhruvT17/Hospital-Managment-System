import mongoose from "mongoose";

// Patient Schema
const patientSchema = new mongoose.Schema({
  PatientId: { 
    type: Number, 
    unique: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  disease: {
     type: String,
    required: true 
  },
  admissionStatus: { 
    type: String, 
    required: true 
  },
});

// Counter Schema for auto-incrementing doctorId and patientId
const counterSchema = new mongoose.Schema({
  _id: { 
    type: String, 
    required: true 
  }, // Counter name (doctorId or patientId)
  seq: { 
    type: Number, 
    default: 0 
  }, // Sequence value
});

// Doctor Schema
const doctorSchema = new mongoose.Schema({
  doctorId: { 
    type: Number, 
    unique: true },
  name: { 
    type: String, 
    required: true },
  specialization: {
    type: String,
    required: true,
    enum: [
      "Cardiologist",
      "Neurologist",
      "Dermatologist",
      "Orthopedic",
      "Pediatrician",
    ],
  },
  experience: { 
    type: Number, 
    required: true 
  },
  patients: [patientSchema], // Array of patients
});

// Export Models
const Doctor = mongoose.model("Doctor", doctorSchema);
const Patient = mongoose.model("Patient", patientSchema);
const Counter = mongoose.model("Counter", counterSchema); // Counter Model

export { Doctor, Patient, Counter };
