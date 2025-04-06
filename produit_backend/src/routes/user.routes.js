const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getUser, 
  createUser, 
  updateUser, 
  deleteUser 
} = require('../controllers/user.controller');
const { 
  protect, 
  authorize 
} = require('../middleware/auth.middleware');
const { 
  verifyTenantMembership 
} = require('../middleware/tenant.middleware');

// Toutes les routes nécessitent l'authentification et la vérification d'appartenance au tenant
router.use(protect);
router.use(verifyTenantMembership);

// Routes accessibles aux admin et manager
router.get('/', authorize('admin', 'manager'), getUsers);

// Route pour créer un utilisateur (admin uniquement)
router.post('/', authorize('admin'), createUser);

// Routes pour un utilisateur spécifique
router.get('/:id', getUser); // Admin, manager ou soi-même (vérifié dans le contrôleur)
router.put('/:id', updateUser); // Admin ou soi-même (vérifié dans le contrôleur)
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router; 