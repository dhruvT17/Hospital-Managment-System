// models/Patient.js
import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: [true, 'Patient ID is required'],
    unique: true, // Ensure each patient has a unique ID
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'Patient name is required'],
    minlength: [3, 'Name must be at least 3 characters long'],
    maxlength: [50, 'Name must not exceed 50 characters'],
  },
  disease: {
    type: String,
    required: [true, 'Disease is required'],
  },
});

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
