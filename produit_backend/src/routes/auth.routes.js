const express = require('express');
const router = express.Router();
const { 
  setupTenant, 
  login, 
  register, 
  getProfile 
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { extractTenant } = require('../middleware/tenant.middleware');

// Routes publiques
router.post('/setup-tenant', setupTenant);
router.post('/login', login);
router.post('/register', extractTenant, register);

// Route spéciale pour le superadmin (sans vérification de tenant)
router.post('/super-admin/login', login);

// Routes protégées
router.get('/profile', protect, getProfile);

module.exports = router; 