// src/routes/documentRoutes.js
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
const documentRouter = express.Router();

import isLoggedIn from '../middleware/auth.js'; 
import {upload} from '../middleware/upload.middleware.js'; 

// POST /api/documents/upload
// Middleware order: isLoggedIn (auth) -> upload.single (file handling) -> controller
documentRouter.post('/upload', isLoggedIn, upload.single('document'), uploadDocument); // 'document' is the field name in form-data

// GET /api/documents
documentRouter.get('/', isLoggedIn, getUserDocuments);

// GET /api/documents/recent
documentRouter.get('/recent', isLoggedIn, getRecentUserDocuments);

// GET /api/documents/:id
documentRouter.get('/:id', isLoggedIn, getDocumentById);

// GET /api/documents/:id/transcription
documentRouter.get('/:id/transcription', isLoggedIn, getDocumentTranscription);

documentRouter.get('/file/:storageFileName', isLoggedIn, getFileByFilename);
export default documentRouter;

// DELETE all documents 
documentRouter.delete('/', isLoggedIn, deleteAllUserDocuments);