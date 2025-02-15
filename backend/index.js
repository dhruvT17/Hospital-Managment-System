
// const express = require('express');
// const fs = require('fs');
// const cors = require('cors');
// const path = require('path');

// // Create an instance of the Express app
// const app = express();
// app.use(cors());
// // Middleware to parse incoming requests
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// // Path to the data file
// const dataFilePath = path.join(__dirname, 'HospitalData.json');

// // List of valid doctor specializations
// const validSpecializations = ["Cardiologist", "Neurologist", "Dermatologist", "Orthopedic", "Pediatrician"];

// // Read data from the JSON file
// const readData = () => {
//   const rawData = fs.readFileSync(dataFilePath, 'utf8');
//   return JSON.parse(rawData);
// };

// // Write updated data to the JSON file
// const writeData = (data) => {
//   fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
// };

// // Start the Express server
// const PORT = 3001;

// // ------------------ ROUTES ------------------

// // 1. Add a new doctor
// app.post('/doctors', (req, res) => {
//   const { doctorId, name, specialization, experience } = req.body;

//   // Validate specialization
//   if (!validSpecializations.includes(specialization)) {
//     return res.status(400).json({ error: 'Invalid specialization' });
//   }

//   const newDoctor = { doctorId, name, specialization, experience, patients: [] };
  
//   // Read current data and add the new doctor
//   const data = readData();
//   data.doctors.push(newDoctor);
//   writeData(data);

//   res.status(201).json({
//     message: 'Doctor added successfully',
//     doctor: newDoctor
//   });
// });

// // 2. Get all doctors
// app.get('/doctors', (req, res) => {
//   const data = readData();
//   res.status(200).json(data.doctors);
// });

// // 3. Get a specific doctor by ID
// app.get('/doctors/:doctorId', (req, res) => {
//   const { doctorId } = req.params;
//   const data = readData();
  
//   const doctor = data.doctors.find(d => d.doctorId == doctorId);
//   if (!doctor) {
//     return res.status(404).json({ error: 'Doctor not found' });
//   }

//   res.status(200).json(doctor);
// });

// // 4. Add a patient to a doctor
// app.post('/doctors/:doctorId/patients', (req, res) => {
//   const { doctorId } = req.params;
//   const { patientId, name, disease, admissionStatus } = req.body;

//   // Check for missing patient details
//   if (!name || !disease || !admissionStatus) {
//     return res.status(400).json({ error: 'Missing required patient details' });
//   }

//   const data = readData();
//   const doctor = data.doctors.find(d => d.doctorId == doctorId);
//   if (!doctor) {
//     return res.status(404).json({ error: 'Doctor not found' });
//   }

//   const newPatient = { patientId, name, disease, admissionStatus };
//   doctor.patients.push(newPatient);
//   writeData(data);

//   res.status(201).json({ message: 'Patient added to doctor', doctor });
// });

// // 5. Remove a patient from a doctor
// app.delete('/doctors/:doctorId/patients/:patientId', (req, res) => {
//   const { doctorId, patientId } = req.params;
//   const data = readData();

//   const doctor = data.doctors.find(d => d.doctorId == doctorId);
//   if (!doctor) {
//     return res.status(404).json({ error: 'Doctor not found' });
//   }

//   const patientIndex = doctor.patients.findIndex(p => p.patientId == patientId);
//   if (patientIndex === -1) {
//     return res.status(404).json({ error: 'Patient not found' });
//   }

//   // Remove the patient
//   doctor.patients.splice(patientIndex, 1);
//   writeData(data);

//   res.status(200).json({ message: 'Patient removed successfully' });
// });

// // 6. Delete a doctor
// app.delete('/doctors/:doctorId', (req, res) => {
//   const { doctorId } = req.params;
//   const data = readData();

//   const doctorIndex = data.doctors.findIndex(d => d.doctorId == doctorId);
//   if (doctorIndex === -1) {
//     return res.status(404).json({ error: 'Doctor not found' });
//   }

//   // Remove the doctor
//   data.doctors.splice(doctorIndex, 1);
//   writeData(data);

//   res.status(200).json({ message: 'Doctor deleted successfully' });
// });

// // ------------------ ERROR HANDLING ------------------

// // Generic error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: 'Something went wrong' });
// });

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT} http://localhost:${PORT}`);
//   });


// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { Doctor, Patient, Counter } from './module/Doctor.js'; // ES6 import

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Function to get the next ID from the counter collection
const getNextId = async (counterName) => {
    const counter = await Counter.findByIdAndUpdate(
        { _id: counterName },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return counter.seq;
};

// ------------------ ROUTES ------------------

// 1. Add a new doctor
app.post('/doctors', async (req, res) => {
    const { name, specialization, experience } = req.body;

    if (!["Cardiologist", "Neurologist", "Dermatologist", "Orthopedic", "Pediatrician"].includes(specialization)) {
        return res.status(400).json({ error: 'Invalid specialization' });
    }

    try {
        // Get the next doctorId
        const doctorId = await getNextId('doctorId');

        // Create the new doctor
        const newDoctor = new Doctor({ doctorId, name, specialization, experience, patients: [] });
        await newDoctor.save();

        res.status(201).json({ message: 'Doctor added successfully', doctor: newDoctor });
    } catch (err) {
        res.status(500).json({ error: 'Error adding doctor', details: err.message });
    }
});

// 2. Get all doctors
app.get('/doctors', async (req, res) => {
    try {
        const doctors = await Doctor.find();
        res.status(200).json(doctors);
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving doctors', details: err.message });
    }
});

// 3. Get a specific doctor by ID
app.get('/doctors/:doctorId', async (req, res) => {
    const { doctorId } = req.params;

    try {
        const doctor = await Doctor.findOne({ doctorId });
        if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
        res.status(200).json(doctor);
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving doctor', details: err.message });
    }
});

// 4. Add a patient to a doctor
app.post('/doctors/:doctorId/patients', async (req, res) => {
    const { doctorId } = req.params;
    const { name, disease, admissionStatus } = req.body;

    // Validate input
    if (!name || !disease || !admissionStatus) {
        return res.status(400).json({ error: 'Missing required patient details' });
    }

    try {
        // Get the next PatientId
        const patientId = await getNextId('patientId');

        // Find the doctor by doctorId
        const doctor = await Doctor.findOne({ doctorId });
        if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

        // Initialize the patients array if missing
        if (!doctor.patients) {
            doctor.patients = [];
        }

        // Create the new patient
        const newPatient = { PatientId: patientId, name, disease, admissionStatus };
        doctor.patients.push(newPatient); // Push the patient into the doctor's patients array
        await doctor.save(); // Save the doctor document

        res.status(201).json({ message: 'Patient added to doctor', doctor });
    } catch (err) {
        console.error('Error adding patient:', err);
        res.status(500).json({ error: 'Error adding patient', details: err.message });
    }
});

// 5. Remove a patient from a doctor
app.delete('/doctors/:doctorId/patients/:patientId', async (req, res) => {
    const { doctorId, patientId } = req.params;

    try {
        const doctor = await Doctor.findOne({ doctorId });
        if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

        doctor.patients = doctor.patients.filter(patient => patient._id.toString() !== patientId);
        await doctor.save();

        res.status(200).json({ message: 'Patient removed successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error removing patient', details: err.message });
    }
});

// 6. Delete a doctor
app.delete('/doctors/:doctorId', async (req, res) => {
    const { doctorId } = req.params;

    try {
        const result = await Doctor.findOneAndDelete({ doctorId });
        if (!result) return res.status(404).json({ error: 'Doctor not found' });

        res.status(200).json({ message: 'Doctor deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting doctor', details: err.message });
    }
});

// 7. Update a doctor's details
app.put('/doctors/:doctorId', async (req, res) => {
    const { doctorId } = req.params;
    const { name, specialization, experience } = req.body;

    try {
        const updatedDoctor = await Doctor.findOneAndUpdate(
            { doctorId },
            { $set: { name, specialization, experience } },
            { new: true } // Return the updated document
        );
        if (!updatedDoctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        res.status(200).json({ message: 'Doctor updated successfully', doctor: updatedDoctor });
    } catch (err) {
        res.status(500).json({ error: 'Error updating doctor', details: err.message });
    }
});

// ------------------ ERROR HANDLING ------------------

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong', details: err.message });
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} http://localhost:${PORT}`);
});
