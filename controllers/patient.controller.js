import path from "path";
import fs from "fs";
import { errorResponse, successResponse } from "../utils/responses.js";
import { StatusCodes } from "http-status-codes";
import logger from "../utils/logger.js";
import MedicalDocument from "../models/MedicalDocument.js";
import Patient from "../models/Patient.js";

export const createPatient = async (req, res, next) => {
  logger.info("START: Create Patient Service");
  try {
    const { firstName, lastName, dateOfBirth, gender, contactInfo, customId } =
      req.body;
    const userId = req.user.userId; // From 'protect' middleware

    if (!firstName || !lastName) {
      logger.warn("END: Create Patient Service - Missing first or last name");
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "First name and last name are required."
      );
    }

    // Optional: Check if a patient with the same name already exists for this user
    const existingPatient = await Patient.findOne({
      user: userId,
      firstName,
      lastName,
    });
    if (existingPatient) {
      logger.warn(
        "END: Create Patient Service - Patient with this name already exists for user"
      );
      // Decide if this is an error or if you allow it. For now, let's allow it but log.
      // return errorResponse(res, StatusCodes.CONFLICT, "A patient with this first and last name already exists.");
    }

    const patient = await Patient.create({
      user: userId,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      contactInfo,
      customId,
    });

    logger.info("END: Create Patient Service - Patient created successfully");
    return successResponse(
      res,
      StatusCodes.CREATED,
      "Patient created successfully.",
      patient
    );
  } catch (error) {
    logger.error(`Create Patient Service Error: ${error.message}`);
    if (error.name === "ValidationError") {
      return errorResponse(res, StatusCodes.BAD_REQUEST, error.message);
    }
    next(error);
  }
};

// @desc    Get all patients for the logged-in user
// @route   GET /api/patients
// @access  Private
export const getPatientsForUser = async (req, res, next) => {
  logger.info("START: Get Patients For User Service");
  try {
    const userId = req.user.userId;
    const { searchTerm } = req.query; // Optional search term

    let query = { user: userId };

    if (searchTerm) {
      query.$or = [
        { firstName: { $regex: searchTerm, $options: "i" } },
        { lastName: { $regex: searchTerm, $options: "i" } },
        { customId: { $regex: searchTerm, $options: "i" } },
      ];
    }

    const patients = await Patient.find(query).sort({
      lastName: 1,
      firstName: 1,
    }); // Sort by name

    if (!patients) {
      // find returns [] if no match, not null, so this check is more for unexpected issues
      logger.info(
        "END: Get Patients For User Service - Error fetching patients (query returned null/undefined)"
      );
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        "Could not retrieve patients."
      );
    }

    logger.info(
      `END: Get Patients For User Service - Found ${patients.length} patients`
    );
    // Consistent with other list endpoints, decide if you wrap in {data: patients} or send directly
    return successResponse(
      res,
      StatusCodes.OK,
      "Patients fetched successfully.",
      patients
    );
    // If your frontend expects { data: [...] } for lists:
    // return successResponse(res, StatusCodes.OK, "Patients fetched successfully.", { data: patients });
  } catch (error) {
    logger.error(`Get Patients For User Service Error: ${error.message}`);
    next(error);
  }
};

// create   getPatientById,
//   updatePatientById,
//   deletePatientById

export const getPatientById = async (req, res, next) => {
  logger.info("START: Get Patient By ID Service");
  try {
    const { patientId } = req.params;
    const userId = req.user.userId;

    const patient = await Patient.findOne({ _id: patientId, user: userId });

    if (!patient) {
      logger.warn("END: Get Patient By ID Service - Patient not found");
      return errorResponse(res, StatusCodes.NOT_FOUND, "Patient not found.");
    }

    logger.info(
      "END: Get Patient By ID Service - Patient fetched successfully"
    );
    return successResponse(
      res,
      StatusCodes.OK,
      "Patient fetched successfully.",
      patient
    );
  } catch (error) {
    logger.error(`Get Patient By ID Service Error: ${error.message}`);
    next(error);
  }
};

export const updatePatientById = async (req, res, next) => {
  logger.info("START: Update Patient By ID Service");
  try {
    const { patientId } = req.params;
    const userId = req.user.userId;
    const { firstName, lastName } = req.body;
    if (!firstName || !lastName) {
      logger.warn(
        "END: Update Patient By ID Service - Missing first or last name"
      );
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "First name and last name are required."
      );
    }
    const patient = await Patient.findOneAndUpdate(
      { _id: patientId, user: userId },
      { firstName, lastName },
      { new: true } // Return the updated document
    );
    if (!patient) {
      logger.warn("END: Update Patient By ID Service - Patient not found");
      return errorResponse(res, StatusCodes.NOT_FOUND, "Patient not found.");
    }
    logger.info(
      "END: Update Patient By ID Service - Patient updated successfully"
    );

    return successResponse(
      res,
      StatusCodes.OK,
      "Patient updated successfully.",
      patient
    );
  } catch (error) {
    logger.error(`Update Patient By ID Service Error: ${error.message}`);
    if (error.name === "ValidationError") {
      return errorResponse(res, StatusCodes.BAD_REQUEST, error.message);
    }
    next(error);
  }
};

export const deletePatientById = async (req, res, next) => {
  logger.info("START: Delete Patient By ID Service");
  try {
    const { patientId } = req.params;
    const userId = req.user.userId;

    const patient = await Patient.find;
    OneAndDelete({ _id: patientId, user: userId });
    if (!patient) {
      logger.warn("END: Delete Patient By ID Service - Patient not found");
      return errorResponse(res, StatusCodes.NOT_FOUND, "Patient not found.");
    }
    logger.info(
      "END: Delete Patient By ID Service - Patient deleted successfully"
    );
    return successResponse(
      res,
      StatusCodes.OK,
      "Patient deleted successfully."
    );
  } catch (error) {
    logger.error(`Delete Patient By ID Service Error: ${error.message}`);
    if (error.name === "ValidationError") {
      return errorResponse(res, StatusCodes.BAD_REQUEST, error.message);
    }
    next(error);
  }
};
