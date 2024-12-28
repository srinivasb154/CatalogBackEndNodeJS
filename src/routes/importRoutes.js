import multer from 'multer';
import Papa from 'papaparse';
import fs from 'fs';

import { replaceProducts, addProducts } from '../services/products.js';

export function importRoutes(app) {
  // Multer configuration for file upload
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
  });
  const upload = multer({ storage });

  /**
   * Parse CSV file using PapaParse
   * @param {String} filePath - Path to the CSV file
   * @returns {Promise<Array>} Parsed rows
   */
  const parseCSV = (filePath) => {
    return new Promise((resolve, reject) => {
      const fileContent = fs.readFileSync(filePath, 'utf8'); // Read file content
      Papa.parse(fileContent, {
        header: true, // Use the first row as headers
        skipEmptyLines: true, // Skip empty lines
        quoteChar: '"', // Handle quoted fields
        escapeChar: '\\', // Handle escaped quotes
        complete: (results) => {
          console.log('Parsed rows:', results.data);
          resolve(results.data); // Resolve with parsed rows
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          reject(error);
        },
      });
    });
  };

  const preprocessSpecifications = (specifications) => {
    try {
      return JSON.parse(specifications); // Attempt to parse JSON
    } catch (error) {
      console.error('Invalid JSON in specifications:', specifications);
      return {}; // Return an empty object for invalid JSON
    }
  };

  const processRow = (row) => {
    // Preprocess and validate the specifications field
    if (row.specifications) {
      row.specifications = preprocessSpecifications(row.specifications);
    }

    console.log('Processed Row:', row);
    return row;
  };

  /**
   * Import products from CSV.
   * POST /api/import/products
   */
  app.post('/api/products/import', upload.single('file'), async (req, res) => {
    console.log('Uploaded file:', req.file);
    if (!req.file) {
      return res
        .status(400)
        .json({ error: 'No file uploaded. Please upload a CSV file.' });
    }
    const { mode } = req.body; // "add" or "replace"
    const filePath = req.file.path;

    try {
      // Parse the CSV file
      const rows = await parseCSV(filePath);

      // Process rows and handle specifications
      const processedRows = rows.map((row) => processRow(row));

      // Perform add or replace operation
      if (mode === 'replace') {
        await replaceProducts(processedRows);
      } else if (mode === 'add') {
        await addProducts(processedRows);
      } else {
        throw new Error(`Invalid mode: ${mode}`);
      }

      res.status(200).json({ message: 'Products imported successfully.' });
    } catch (error) {
      console.error('Error processing import:', error);
      res.status(500).json({ error: error.message });
    }
  });
}
