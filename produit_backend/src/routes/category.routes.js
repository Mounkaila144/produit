const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { verifyTenantMembership } = require('../middleware/tenant.middleware');

// Route publique pour récupérer les catégories
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategory);
router.get('/:id/products', categoryController.getCategoryProducts);

// Routes protégées pour la gestion des catégories
router.use(protect);
router.use(verifyTenantMembership);

router.post('/', authorize('admin', 'manager'), categoryController.createCategory);
router.put('/:id', authorize('admin', 'manager'), categoryController.updateCategory);
router.delete('/:id', authorize('admin'), categoryController.deleteCategory);

module.exports = router; 