// src/controllers/documentController.js
import MedicalDocument from "../models/MedicalDocument.js";
import Transcription from "../models/Transcription.js";
import processDocumentWithLlama  from "../services/llamaService.js";
import path from "path";
import fs from "fs";
import { errorResponse, successResponse } from "../utils/responses.js";
import { StatusCodes } from "http-status-codes";
import logger from "../utils/logger.js";
import mongoose from "mongoose";

// @desc    Upload a medical document
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = async (req, res, next) => {
  logger.info("START: Upload Document Service");
  try {
    if (!req.file) {
      logger.warn("END: Upload Document Service - No file uploaded");
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "No file uploaded. Please select a file."
      );
    }

    const {
      originalname,
      filename: multerGeneratedFilename,
      path: multerFilePath,
      mimetype,
      size,
    } = req.file;
    const userId = req.user.userId;

    // <<< NEW: Get patientId from request body >>>
    // const { patientId, documentTitle, doctorName, documentDate } = req.body;
    const { documentTitle, doctorName, documentDate } = req.body;

    // if (!patientId) {
    //   logger.warn("END: Upload Document Service - Patient ID is required");
    //   return errorResponse(
    //     res,
    //     StatusCodes.BAD_REQUEST,
    //     "Patient ID is required to upload a document."
    //   );
    // }

    // Validate if the patientId is a valid ObjectId and belongs to the current user
    // if (!mongoose.Types.ObjectId.isValid(patientId)) {
    //   logger.warn("END: Upload Document Service - Invalid Patient ID format");
    //   return errorResponse(
    //     res,
    //     StatusCodes.BAD_REQUEST,
    //     "Invalid Patient ID format."
    //   );
    // }
    // const patientExists = await Patient.findOne({
    //   _id: patientId,
    //   user: userId,
    // });
    // if (!patientExists) {
    //   logger.warn(
    //     "END: Upload Document Service - Patient not found or does not belong to user"
    //   );
    //   return errorResponse(
    //     res,
    //     StatusCodes.NOT_FOUND,
    //     "Patient not found or you do not have access to this patient."
    //   );
    // }

    const newDocument = new MedicalDocument({
      user: userId,
    //   patient: patientId, // <<< ASSOCIATE DOCUMENT WITH PATIENT >>>
      originalFileName: originalname,
      storageFileName: multerGeneratedFilename,
      filePath: multerFilePath,
      fileType: mimetype,
      fileSize: size,
      processingStatus: "PENDING",
      documentTitle: documentTitle || originalname.split(".")[0],
      doctorName: doctorName,
      documentDate: documentDate,
    });

    const savedDocument = await newDocument.save();

    processDocumentWithLlama(savedDocument.filePath, savedDocument)
      .then(() =>
        logger.info(
          `Llama processing initiated for ${savedDocument.originalFileName} (Patient: ${patientId})`
        )
      )
      .catch((err) =>
        logger.error(
          `Error initiating Llama processing for ${savedDocument.originalFileName}: ${err.message}`
        )
      );

    logger.info(
      "END: Upload Document Service - File uploaded for patient, processing started"
    );
    return successResponse(
      res,
      StatusCodes.CREATED,
      "File uploaded successfully and associated with patient. Processing has started.",
      {
        document: {
          _id: savedDocument._id,
          originalFileName: savedDocument.originalFileName,
        //   patientId: savedDocument.patient,
          processingStatus: savedDocument.processingStatus,
          storageFileName: savedDocument.storageFileName,
        },
      }
    );
  } catch (error) {
    logger.error(`Upload Document Service Error: ${error.message}`);
    // ... (existing file cleanup logic) ...
    next(error);
  }
};

// @desc    Get all documents for the logged-in user
// @route   GET /api/documents
// @access  Private
// export const getUserDocuments = async (req, res) => {
//   try {
//       if (!req.user || !req.user.userId) {
//         return errorResponse(
//           res,
//           StatusCodes.FORBIDDEN,
//           "Unauthorized: User not logged in"
//         );
//     }
//     const documents = await MedicalDocument.find({ user: req.user.userId })
//       .sort({ uploadDate: -1 }) // Sort by newest first
//       .select("-filePath -storageFileName"); // Exclude sensitive/internal paths

//     return successResponse(
//       res,
//       StatusCodes.OK,
//       "User documents fetched successfully.",
//       { data: documents }
//     );
//   } catch (error) {
//     console.error("Error fetching user documents:", error);
//     return errorResponse(
//       res,
//       StatusCodes.INTERNAL_SERVER_ERROR,
//       "Server error fetching documents."
//     );
//   }
// };
export const getUserDocuments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, searchTerm } = req.query; // Get status and searchTerm from query parameters

    let query = { user: userId };

    if (status && status !== "All Status" && status !== "") {
      // Ensure the status is one of the valid enum values if you want to be strict
      const validStatuses = ["PENDING", "PROCESSING", "COMPLETED", "FAILED"];
      if (validStatuses.includes(status.toUpperCase())) {
        query.processingStatus = status.toUpperCase();
      } else {
        // Optional: return an error for invalid status, or just ignore it
        logger.info(`Invalid status filter received: ${status}`);
      }
    }

    if (searchTerm) {
      // Add search functionality (case-insensitive)
      // This will search in originalFileName and documentTitle. Add more fields if needed.
      query.$or = [
        { originalFileName: { $regex: searchTerm, $options: "i" } },
        { documentTitle: { $regex: searchTerm, $options: "i" } },
        { doctorName: { $regex: searchTerm, $options: "i" } }, // Example: search by doctor name
      ];
    }

    console.log("Backend query for documents:", query); // For debugging

    const documents = await MedicalDocument.find(query).sort({
      uploadDate: -1,
    });

    successResponse(
      res,
      StatusCodes.OK,
      "User documents fetched successfully.",
      { data: documents }
    );
    // res.json(documents); // If you need {data: documents}, change to res.json({ data: documents });
  } catch (error) {
    logger.error("Error fetching user documents:", error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Server error fetching documents."
    );
  }
};
// @desc    Get recent documents for the logged-in user
// @route   GET /api/documents/recent
// @access  Private
export const getRecentUserDocuments = async (req, res) => {
  try {
    const documents = await MedicalDocument.find({ user: req.user.userId })
      .sort({ uploadDate: -1 })
      .limit(5); // Get latest 5 documents
    return successResponse(
      res,
      StatusCodes.OK,
      "Recent documents fetched successfully.",
      { data: documents }
    );
  } catch (error) {
    console.error("Error fetching recent documents:", error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Server error fetching recent documents."
    );
  }
};

// @desc    Get transcription details for a specific document
// @route   GET /api/documents/:id/transcription
// @access  Private
export const getDocumentTranscription = async (req, res, next) => {
  const documentId = req.params.id;
  logger.info(
    `START: Get Document Transcription Service - Document ID: ${documentId}`
  );
  try {
    if (!documentId.match(/^[0-9a-fA-F]{24}$/)) {
      // Basic ObjectId format check
      logger.warn(
        `END: Get Document Transcription Service - Invalid Document ID format: ${documentId}`
      );
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "Invalid document ID format."
      );
    }

    // First, find the MedicalDocument to get its current overall status
    const medicalDoc = await MedicalDocument.findOne({
      _id: documentId,
      user: req.user.userId,
    });
    if (!medicalDoc) {
      logger.warn(
        `END: Get Document Transcription Service - MedicalDocument not found or access denied for ID: ${documentId}`
      );
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        "Document not found or access denied."
      );
    }

    // Then, find the associated Transcription record
    const transcriptionRecord = await Transcription.findOne({
      document: documentId,
      user: req.user.userId,
    });

    if (!transcriptionRecord) {
      // No transcription record exists yet (e.g., still PENDING in MedicalDocument, or LlamaService hasn't run)
      logger.info(
        `END: Get Document Transcription Service - No Transcription record found for Document ID: ${documentId}. MedicalDoc status: ${medicalDoc.processingStatus}`
      );
      return successResponse(
        res,
        StatusCodes.OK, // It's not an error that it's not there yet, the document exists
        "Transcription data is not yet available.",
        {
          documentId: medicalDoc._id,
          originalFileName: medicalDoc.originalFileName,
          processingStatus: medicalDoc.processingStatus, // Reflect the overall document status
          transcription: null, // Explicitly null
          message: `Transcription is currently ${medicalDoc.processingStatus.toLowerCase()}. Please check back later.`,
        }
      );
    }

    // Transcription record exists, return its details along with parent document info
    logger.info(
      `END: Get Document Transcription Service - Transcription record found for Document ID: ${documentId}`
    );
    return successResponse(
      res,
      StatusCodes.OK,
      "Transcription fetched successfully.",
      {
        documentId: medicalDoc._id,
        originalFileName: medicalDoc.originalFileName,
        processingStatus: medicalDoc.processingStatus, // Overall status
        transcription: transcriptionRecord, // The actual transcription sub-document
      }
    );
  } catch (error) {
    logger.error(
      `Get Document Transcription Service Error for Document ID ${documentId}: ${error.message}`
    );
    if (error.name === "CastError") {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "Invalid document ID format (cast error)."
      );
    }
    next(error); // Pass to centralized error handler
  }
};

// @desc    Get a specific document's details (metadata)
// @route   GET /api/documents/:id
// @access  Private
export const getDocumentById = async (req, res, next) => {
  const documentId = req.params.id;
  logger.info(
    `START: Serve Document File By ID Service - Document ID: ${documentId}`
  );
  try {
    // Basic ObjectId format validation
    if (!documentId.match(/^[0-9a-fA-F]{24}$/)) {
      logger.warn(
        `END: Serve Document File By ID Service - Invalid Document ID format: ${documentId}`
      );
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "Invalid document ID format."
      );
    }

    const document = await MedicalDocument.findOne({
      _id: documentId,
      user: req.user.userId, // Ensure the logged-in user owns this document
    });

    if (!document) {
      logger.warn(
        `END: Serve Document File By ID Service - Document not found or access denied for ID: ${documentId}`
      );
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        "Document not found or access denied."
      );
    }

    // Use the 'filePath' stored in the MedicalDocument model.
    // This should be the absolute path where Multer saved the file.
    const absoluteFilePath = document.filePath;

    if (!absoluteFilePath) {
      logger.error(
        `END: Serve Document File By ID Service - File path not stored in document record for ID: ${documentId}`
      );
      return errorResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        "File path information is missing for this document."
      );
    }

    if (!fs.existsSync(absoluteFilePath)) {
      logger.error(
        `END: Serve Document File By ID Service - File does not exist on server at path: ${absoluteFilePath} for document ID: ${documentId}`
      );
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        "File does not exist on the server at the expected location."
      );
    }

    logger.info(
      `END: Serve Document File By ID Service - Serving file: ${absoluteFilePath}`
    );

    // Set headers for inline display (browser will try to show PDF/image)
    // or download if it can't display.
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${document.originalFileName}"`
    );
    res.setHeader("Content-Type", document.fileType); // Use the stored MIME type

    const readStream = fs.createReadStream(absoluteFilePath);
    readStream.pipe(res);

    readStream.on("error", (err) => {
      logger.error(
        `Stream error serving file for Document ID ${documentId}: ${err.message}`
      );
      // Don't try to send another response if headers already sent
      if (!res.headersSent) {
        // No need to call next(err) here if we are sending a response
        return errorResponse(
          res,
          StatusCodes.INTERNAL_SERVER_ERROR,
          "Error streaming file."
        );
      }
    });
    readStream.on("close", () => {
      logger.info(
        `Successfully streamed file for Document ID ${documentId}: ${absoluteFilePath}`
      );
    });
  } catch (error) {
    logger.error(
      `Serve Document File By ID Service Error for Document ID ${documentId}: ${error.message}`
    );
    // Avoid sending response if stream error already handled it
    if (!res.headersSent) {
      if (error.name === "CastError") {
        // Though the regex check should catch this earlier
        return errorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          "Invalid document ID format (cast error)."
        );
      }
      next(error); // Pass to your general Express error handler
    }
  }
};
// @desc    Get a file by its filename (for download or viewing)
export const getFileByFilename = async (req, res) => {
  try {
    const { storageFileName } = req.params;
    console.log(req.user);
    const userId = req.user.userId;

    // Find the document by storageFileName
    const document = await MedicalDocument.findOne({
      storageFileName: storageFileName,
      user: userId,
    });

    if (!document) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        "File not found or access denied."
      );
    }

    // Construct the full file path
    const filePath = path.join("uploads", storageFileName); // Adjust based on your upload directory

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        "File does not exist on the server."
      );
    }

    // Set headers for file download
    // res.setHeader("Content-Disposition", `inline; filename="${document.originalFileName}"`);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${document.originalFileName}`
    );
    res.setHeader("Content-Type", document.fileType);
    res.setHeader("Content-Length", document.fileSize);

    // Stream the file to the response
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  } catch (error) {
    console.error("Error fetching file by filename:", error);
    if (error.kind === "ObjectId") {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "Invalid filename format."
      );
    }
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Server error fetching file."
    );
  }
};

//create a method to delete all images in the database for this user
export const deleteAllUserDocuments = async (req, res) => {
  try {
    const userId = req.user.userId;

    const documents = await MedicalDocument.find({ user: userId });

    if (documents.length === 0) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        "No documents found for this user."
      );
    }

    // Delete each document and its associated file
    for (const doc of documents) {
      const filePath = doc.filePath;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Delete the file from the server
      }
      await MedicalDocument.deleteOne({ _id: doc._id }); // Delete the document record
    }

    return successResponse(
      res,
      StatusCodes.OK,
      "All user documents deleted successfully."
    );
  } catch (error) {
    console.error("Error deleting user documents:", error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Server error deleting documents."
    );
  }
};

// export default {
//   uploadDocument,
//   getUserDocuments,
//   getRecentUserDocuments,
//   getDocumentTranscription,
//   getDocumentById,
// };
