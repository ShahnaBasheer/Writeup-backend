const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.memoryStorage();


const fileFields = [
    { name: 'image', maxCount: 1 },
  ];

// Configure multer upload
const upload = multer({ storage }).fields(fileFields);

module.exports = upload;
