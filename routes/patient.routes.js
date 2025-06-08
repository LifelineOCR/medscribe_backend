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

/**
 * @swagger
 * /api/patients:
 *   post:
 *     summary: Create a new patient record
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     description: Create a new patient for the authenticated user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - dob
 *               - gender
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "1990-05-20"
 *               gender:
 *                 type: string
 *                 example: "Male"
 *               contactInfo:
 *                 type: string
 *                 example: "123-456-7890"
 *     responses:
 *       "201":
 *         description: Patient created successfully.
 *       "400":
 *         description: Bad request.
 *       "401":
 *         description: Unauthorized.
 */
patientRouter.post('/', isLoggedIn, createPatient);

/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: Get all patients for the authenticated user
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieves all patients created by the authenticated user.
 *     responses:
 *       "200":
 *         description: A list of patients.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       "401":
 *         description: Unauthorized.
 */
patientRouter.get('/', isLoggedIn, getPatientsForUser);

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     summary: Get a patient by ID
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     responses:
 *       "200":
 *         description: Patient found.
 *       "404":
 *         description: Patient not found.
 *       "401":
 *         description: Unauthorized.
 */
patientRouter.get('/:id', isLoggedIn, getPatientById);

/**
 * @swagger
 * /api/patients/{id}:
 *   put:
 *     summary: Update a patient by ID
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Jane Smith"
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "1985-12-10"
 *               gender:
 *                 type: string
 *                 example: "Female"
 *               contactInfo:
 *                 type: string
 *                 example: "555-123-4567"
 *     responses:
 *       "200":
 *         description: Patient updated successfully.
 *       "404":
 *         description: Patient not found.
 *       "401":
 *         description: Unauthorized.
 */
patientRouter.put('/:id', isLoggedIn, updatePatientById);

/**
 * @swagger
 * /api/patients/{id}:
 *   delete:
 *     summary: Delete a patient by ID
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     responses:
 *       "200":
 *         description: Patient deleted successfully.
 *       "404":
 *         description: Patient not found.
 *       "401":
 *         description: Unauthorized.
 */
patientRouter.delete('/:id', isLoggedIn, deletePatientById);

export default patientRouter;
