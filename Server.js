const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const mongoose = require('mongoose');
const path = require('path');

// Create an Express app
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/receipt_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

// Define a schema for the receipt data
const receiptSchema = new mongoose.Schema({
  content: String,
});
const Receipt = mongoose.model('Receipt', receiptSchema);

// Set up Multer for file uploading
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Define a route to handle receipt scanning
app.post('/api/scan', upload.single('receipt'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const imagePath = req.file.path;
  Tesseract.recognize(
    imagePath,
    'eng',
    { logger: info => console.log(info) } // Optional logger function for Tesseract
  ).then(({ data: { text } }) => {
    const newReceipt = new Receipt({ content: text });
    newReceipt.save() // Using Promises-based approach
      .then(() => {
        console.log('Receipt saved successfully');
        res.json({ message: 'Receipt scanned and saved successfully' });
      })
      .catch((err) => {
        console.error('Error saving receipt:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      });
  });
});

// Serve static files from the 'uploads' directory
const staticDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(staticDir));

// Handle errors during file upload (Multer)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading.
    res.status(500).json({ error: 'File upload error. Please try again later.' });
  } else {
    next(err);
  }
});

// Generic error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
const port = 5000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
