const express = require('express');
const router = express.Router();
const superadminController = require('../controllers/superadmin.controller');
const { protect, superadminOnly } = require('../middleware/auth.middleware');

// Protéger toutes les routes superadmin
router.use(protect);
router.use(superadminOnly);

// Routes pour la gestion des tenants
router.route('/tenants')
  .post(superadminController.createTenant)
  .get(superadminController.getAllTenants);

router.route('/tenants/:id')
  .get(superadminController.getTenant)
  .put(superadminController.updateTenant)
  .delete(superadminController.deleteTenant);

router.put('/tenants/:id/disable', superadminController.disableTenant);
router.put('/tenants/:id/enable', superadminController.enableTenant);
router.put('/tenants/:id/renew', superadminController.renewTenant);
router.post('/tenants/:id/owner', superadminController.assignOwner);

// Routes pour la gestion des utilisateurs
router.route('/users')
  .get(superadminController.getAllUsers)
  .post(superadminController.createUser);

router.route('/users/:id')
  .get(superadminController.getUser)
  .put(superadminController.updateUser)
  .delete(superadminController.deleteUser);

router.put('/users/:id/enable', superadminController.enableUser);
router.put('/users/:id/disable', superadminController.disableUser);

module.exports = router; 