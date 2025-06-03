// src/services/llamaService.js
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import MedicalDocument from '../models/MedicalDocument.js'; 
import Transcription from '../models/Transcription.js';
import logger from '../utils/logger.js'; // Assuming you have a logger utility
import dotenv from 'dotenv';
dotenv.config();


const LLAMA_API_URL = process.env.LLAMA_API_URL;

/**
 * Sends a document to the Llama API for transcription.
 * @param {string} filePath - Absolute path to the file to be transcribed.
 * @param {object} documentRecord - The MedicalDocument record from MongoDB.
 */
export const processDocumentWithLlama = async (filePath, documentRecord) => {
  logger.info(`[LlamaService] Processing document: ${documentRecord.originalFileName}, Path: ${filePath}`);

  if (!LLAMA_API_URL) {
    logger.error("[LlamaService] Error: LLAMA_API_URL is not defined in .env");
    await MedicalDocument.findByIdAndUpdate(documentRecord._id, { processingStatus: 'FAILED' });
    // Optionally create a Transcription record with an error
    await Transcription.create({
        document: documentRecord._id,
        user: documentRecord.user,
        errorMessage: "Llama API URL not configured on server.",
        completedAt: new Date()
    });
    return;
  }

  const formData = new FormData();
  formData.append('document', fs.createReadStream(filePath), documentRecord.originalFileName);
//   formData.append('userId', documentRecord.user.toString());
//   formData.append('documentId', documentRecord._id.toString());

  try {
    logger.info(`[LlamaService] Sending request to Llama API: ${LLAMA_API_URL}`);
    const startTime = Date.now();

    // Update document status to 'PROCESSING'
    await MedicalDocument.findByIdAndUpdate(documentRecord._id, { processingStatus: 'PROCESSING' });

    const response = await axios.post(LLAMA_API_URL, formData, {
      headers: {
        ...formData.getHeaders(), // Important for multipart/form-data
        // Add any other headers your Llama API requires, e.g., an API key
        // 'X-Llama-API-Key': 'YOUR_LLAMA_API_KEY'
      },
      timeout: 300000, // 5 minutes timeout, adjust as needed
    });

    const endTime = Date.now();
    const processingTimeMs = endTime - startTime;

    logger.info('[LlamaService] Received response from Llama API:', response.data);

    // Assuming Llama API returns data like:
    // { transcribedText: "...", structuredData: {...}, confidenceScore: 0.95 }
    const { transcribedText, structuredData, confidenceScore } = response.data;

    // Create Transcription record
    await Transcription.create({
      document: documentRecord._id,
      user: documentRecord.user,
      transcribedText: transcribedText,
      structuredData: structuredData,
      confidenceScore: confidenceScore,
      processingTimeMs: processingTimeMs,
      completedAt: new Date()
    });

    // Update document status to 'COMPLETED'
    await MedicalDocument.findByIdAndUpdate(documentRecord._id, { processingStatus: 'COMPLETED' });
    logger.info(`[LlamaService] Successfully processed and saved transcription for ${documentRecord.originalFileName}`);

  } catch (error) {
    console.error(`[LlamaService] Error processing document ${documentRecord.originalFileName} with Llama:`, error.message);
    if (error.response) {
      console.error('[LlamaService] Llama API Response Error Data:', error.response.data);
      console.error('[LlamaService] Llama API Response Status:', error.response.status);
    } else if (error.request) {
      console.error('[LlamaService] Llama API No response received:', error.request);
    }

    // Update document status to 'FAILED'
    await MedicalDocument.findByIdAndUpdate(documentRecord._id, { processingStatus: 'FAILED' });
    // Create Transcription record with error message
    await Transcription.create({
        document: documentRecord._id,
        user: documentRecord.user,
        errorMessage: error.response ? JSON.stringify(error.response.data) : error.message,
        completedAt: new Date()
    });
  } finally {
    // Optional: Clean up the uploaded file from the server's 'uploads' folder
    // if you don't need it after sending to Llama (e.g., if Llama stores it or you use cloud storage)
    // fs.unlink(filePath, (err) => {
    //   if (err) console.error(`[LlamaService] Error deleting temp file ${filePath}:`, err);
    //   else logger.info(`[LlamaService] Deleted temp file ${filePath}`);
    // });
  }
};

