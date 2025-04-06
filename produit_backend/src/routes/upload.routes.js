const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { upload } = require('../middleware/upload.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const { extractTenant } = require('../middleware/tenant.middleware');

// Route pour upload un seul fichier
router.post('/single', authMiddleware.protect, extractTenant, upload.single('file'), uploadController.uploadSingleFile);

// Route pour upload plusieurs fichiers (max 5)
router.post('/multiple', authMiddleware.protect, extractTenant, upload.array('files', 5), uploadController.uploadMultipleFiles);

module.exports = router; 