const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenant.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { verifyTenantMembership } = require('../middleware/tenant.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration de multer pour le téléchargement de fichiers
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../../public/uploads/temp');
    // Créer le répertoire s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Filtrer les types de fichiers acceptés (images uniquement)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Le fichier doit être une image'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: fileFilter
});

// Protéger toutes les routes
router.use(protect);

// Vérifier que l'utilisateur est propriétaire ou admin du tenant
router.use(verifyTenantMembership);

// Routes pour le profil du tenant
router.get('/profile', tenantController.getTenantProfile);
router.put('/profile', authorize('admin'), tenantController.updateTenantProfile);
router.post('/logo', authorize('admin'), upload.single('logo'), tenantController.uploadTenantLogo);
router.put('/contact', authorize('admin'), tenantController.updateTenantContact);

// Routes pour l'abonnement et le tableau de bord
router.get('/subscription', authorize('admin'), tenantController.getSubscriptionInfo);
router.get('/dashboard', authorize('admin', 'manager'), tenantController.getDashboard);

// Routes pour la gestion des utilisateurs
router.get('/users', authorize('admin'), tenantController.getTenantUsers);

module.exports = router; 