const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
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

// Routes publiques pour récupérer les produits
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

// Routes protégées pour la gestion des produits
router.use(protect);
router.use(verifyTenantMembership);

router.post('/', authorize('admin', 'manager'), productController.createProduct);
router.put('/:id', authorize('admin', 'manager'), productController.updateProduct);
router.delete('/:id', authorize('admin'), productController.deleteProduct);

// Routes pour la gestion des images
router.post('/:id/images', authorize('admin', 'manager'), upload.array('images', 5), productController.uploadProductImages);
router.delete('/:id/images/:imageIndex', authorize('admin', 'manager'), productController.deleteProductImage);

module.exports = router; 