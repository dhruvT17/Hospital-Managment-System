// models/Assignment.js
import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  doctorId: {
    type: Number,
    required: [true, 'Doctor ID is required'],
    ref: 'Doctor', // Reference the Doctor model
  },
  patientId: {
    type: Number,
    required: [true, 'Patient ID is required'],
    ref: 'Patient', // Reference the Patient model
  },
});

assignmentSchema.index({ doctorId: 1, patientId: 1 }, { unique: true }); // Ensure unique doctor-patient assignments

const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;
