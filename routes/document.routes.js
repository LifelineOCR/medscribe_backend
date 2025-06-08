import express from 'express';
import {
  uploadDocument,
  getUserDocuments,
  getRecentUserDocuments,
  getDocumentTranscription,
  getDocumentById,
  getFileByFilename,
  deleteAllUserDocuments
} from '../controllers/document.controller.js';
import isLoggedIn from '../middleware/auth.js';
import { upload } from '../middleware/upload.middleware.js';

const documentRouter = express.Router();

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload a new document
 *     tags: [Documents]
 *     description: Upload a new document for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *     responses:
 *       "201":
 *         description: Document uploaded successfully.
 *       "400":
 *         description: Bad request.
 *       "401":
 *         description: Unauthorized.
 */
documentRouter.post('/upload', isLoggedIn, upload.single('document'), uploadDocument);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get all user documents
 *     tags: [Documents]
 *     description: Retrieves all documents for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: List of user documents.
 *       "401":
 *         description: Unauthorized.
 */
documentRouter.get('/', isLoggedIn, getUserDocuments);

/**
 * @swagger
 * /recent:
 *   get:
 *     summary: Get recent user documents
 *     tags: [Documents]
 *     description: Retrieves the most recently uploaded documents.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: List of recent user documents.
 *       "401":
 *         description: Unauthorized.
 */
documentRouter.get('/recent', isLoggedIn, getRecentUserDocuments);

/**
 * @swagger
 * /{id}:
 *   get:
 *     summary: Get document by ID
 *     tags: [Documents]
 *     description: Retrieve a specific document by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The document ID
 *     responses:
 *       "200":
 *         description: Document retrieved successfully.
 *       "404":
 *         description: Document not found.
 *       "401":
 *         description: Unauthorized.
 */
documentRouter.get('/:id', isLoggedIn, getDocumentById);

/**
 * @swagger
 * /{id}/transcription:
 *   get:
 *     summary: Get document transcription
 *     tags: [Documents]
 *     description: Retrieve the transcription result of a document.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The document ID
 *     responses:
 *       "200":
 *         description: Transcription retrieved successfully.
 *       "404":
 *         description: Transcription not found.
 *       "401":
 *         description: Unauthorized.
 */
documentRouter.get('/:id/transcription', isLoggedIn, getDocumentTranscription);

/**
 * @swagger
 * /file/{storageFileName}:
 *   get:
 *     summary: Get uploaded file by filename
 *     tags: [Documents]
 *     description: Download or preview the file stored by its filename.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storageFileName
 *         required: true
 *         schema:
 *           type: string
 *         description: Stored file name on server
 *     responses:
 *       "200":
 *         description: File retrieved.
 *       "404":
 *         description: File not found.
 *       "401":
 *         description: Unauthorized.
 */
documentRouter.get('/file/:storageFileName', isLoggedIn, getFileByFilename);

/**
 * @swagger
 * /:
 *   delete:
 *     summary: Delete all user documents
 *     tags: [Documents]
 *     description: Deletes all documents uploaded by the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: All user documents deleted.
 *       "401":
 *         description: Unauthorized.
 */
documentRouter.delete('/', isLoggedIn, deleteAllUserDocuments);

export default documentRouter;
