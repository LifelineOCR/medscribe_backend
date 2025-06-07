//create routes for my patient controller
import express from 'express';
import {
  createPatient,
  getPatientsForUser,
  getPatientById,
  updatePatientById,
  deletePatientById
} from '../controllers/patient.controller.js';
import isLoggedIn from '../middleware/auth.js';

const patientRouter = express.Router();

// POST /api/patients
patientRouter.post('/', isLoggedIn, createPatient);
// GET /api/patients
patientRouter.get('/', isLoggedIn, getPatientsForUser);
// GET /api/patients/:id
patientRouter.get('/:id', isLoggedIn, getPatientById);
// PUT /api/patients/:id
patientRouter.put('/:id', isLoggedIn, updatePatientById);
// DELETE /api/patients/:id
patientRouter.delete('/:id', isLoggedIn, deletePatientById);

export default patientRouter;
