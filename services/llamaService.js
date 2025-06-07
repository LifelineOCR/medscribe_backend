// src/services/llamaService.js
// const axios = require('axios'); // No longer needed for hardcoded response
// const fs = require('fs'); // Still needed if you were to read file for other reasons, but not for Llama call
// const FormData = require('form-data'); // No longer needed

import MedicalDocument from '../models/MedicalDocument.js';
import Transcription from '../models/Transcription.js';
import dotenv from 'dotenv';
dotenv.config();


// const LLAMA_API_URL = process.env.LLAMA_API_URL; // Not used with hardcoded data

const logger = { // Replace with your actual logger
  info: (message) => console.log(`LlamaService INFO: ${new Date().toISOString()} - ${message}`),
  error: (message) => console.error(`LlamaService ERROR: ${new Date().toISOString()} - ${message}`),
};

// --- HARDCODED AI RESPONSE DATA (Updated with your provided JSON) ---
const HARDCODED_LLAMA_RESPONSE_DATA = {
  ocr_results: { // This part is mostly for reference or if you use it elsewhere
    filename: "prescription_Gyne_490_jpg.rf.0d670aa054b0c95d70dd5bd8af461f51.jpg",
    raw_doctags: "Name: Age: Date: Address Diagnosis: R For 7 days...", // Truncated for brevity
    ocr_extracted_text: "Name: Age: Date: Address Diagnosis: R For 7 days Dextromethorphan for 7 days For 3 days Montelukrast IbuProfen 01275285338 : 1 1 1 ... <loc_391",
    markdown_content: "",
    ocr_processing_time_seconds: 50.93
  },
  medical_analysis: { // This is the main part we'll store in Transcription.structuredData
    ocr_extracted_text: "Name: Age: Date: Address Diagnosis: R For 7 days Dextromethorphan for 7 days For 3 days Montelukrast IbuProfen 01275285338 : 1 1 1 ... <loc_391",
    preprocessed_text: "Name: Age: Date: Address Diagnosis: Prescription: Duration: 7 days Dextromethorphan for 7 days Duration: 3 days Montelukrast IbuProfen 01275285338 : 1 1 1 ...",
    llama_analysis: {
      "SUMMARY": "The patient presents with symptoms indicative of an upper respiratory infection. Key medications prescribed include Dextromethorphan for cough suppression over 7 days and Montelukast for 3 days, likely to address inflammation or allergic components. Ibuprofen is also noted, presumably for pain or fever. No specific patient demographic data or detailed diagnosis beyond 'R' (common shorthand for prescription) is available from the OCR text. Clarity of the original document is suboptimal, with dosage details missing for the prescribed medications.",
      "PATIENT INFORMATION": "- No patient information is available in the provided text. (Extracted from OCR)",
      "DIAGNOSIS": "- The primary diagnosis is not identifiable without more context or additional information. (Extracted from OCR)",
      "MEDICATIONS PRESCRIBED": "1. *Dextromethorphan:*\n- Generic/Brand: Dextromethorphan\n- Dosage/Strength: Not specified (assuming 7 days)\n- Route: Oral\n- Frequency: Daily\n- Duration: 7 days\n2. **Montelukast:**\n- Generic/Brand: Montelukast\n- Dosage/Strength: Not specified (assuming 3 days)\n- Route: Oral\n- Frequency: Daily\n- Duration: 3 days\n*Also Noted: Ibuprofen (details not specified)*",
      "CLINICAL NOTES": "- Drug interactions to monitor: None mentioned\n- Patient counseling points: None mentioned\n- Follow-up recommendations: None mentioned\n**CLARITY ASSESSMENT:**\n- Legibility issue: Unclear due to formatting and lack of standard notation\n- Missing information: Required dosage and duration for both medications are missing."
    }
  }
};
// --- END HARDCODED DATA ---

const processDocumentWithLlama = async (filePath, documentRecord) => {
  logger.info(`Processing document (HARDCODED with user data & summary): ${documentRecord.originalFileName}`);
  let transcriptionEntry;

  try {
    transcriptionEntry = await Transcription.findOneAndUpdate(
      { document: documentRecord._id },
      {
        user: documentRecord.user,
        status: 'PROCESSING',
        $unset: { errorMessage: "" }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    await MedicalDocument.findByIdAndUpdate(documentRecord._id, { processingStatus: 'PROCESSING' });

    const simulatedLlamaResponseTimeMs = 200; // Quick since it's hardcoded
    logger.info(`Using hardcoded Llama response for ${documentRecord.originalFileName}`);

    await Transcription.findByIdAndUpdate(transcriptionEntry._id, {
      transcribedText: HARDCODED_LLAMA_RESPONSE_DATA.medical_analysis.ocr_extracted_text,
      // ***** Store only the medical_analysis part in structuredData *****
      // This makes frontend access easier: transcription.structuredData.llama_analysis
      structuredData: HARDCODED_LLAMA_RESPONSE_DATA.medical_analysis,
      processingTimeMs: simulatedLlamaResponseTimeMs,
      status: 'COMPLETED',
      errorMessage: null,
      completedAt: new Date(),
    });

    await MedicalDocument.findByIdAndUpdate(documentRecord._id, { processingStatus: 'COMPLETED' });
    logger.info(`Successfully 'processed' (hardcoded) and saved transcription for ${documentRecord.originalFileName}`);

  } catch (error) {
    // ... (existing error handling)
    const errorMessage = error.message;
    logger.error(`Error during hardcoded processing for ${documentRecord.originalFileName}: ${errorMessage}`);
    if (transcriptionEntry) {
      await Transcription.findByIdAndUpdate(transcriptionEntry._id, { status: 'FAILED', errorMessage: errorMessage, completedAt: new Date() });
    } else {
      await Transcription.create({ document: documentRecord._id, user: documentRecord.user, status: 'FAILED', errorMessage: `Failed to initiate hardcoded processing: ${errorMessage}`, completedAt: new Date() });
    }
    await MedicalDocument.findByIdAndUpdate(documentRecord._id, { processingStatus: 'FAILED' });
  }
};

export default processDocumentWithLlama;
